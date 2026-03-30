ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_activation_reminder_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION public.get_admin_users_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    v_result jsonb;
BEGIN
    IF NOT is_admin() THEN
        RETURN '{"error": "unauthorized"}'::jsonb;
    END IF;

    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', p.id,
            'full_name', p.full_name,
            'email', p.email,
            'role', p.role,
            'plan', p.plan,
            'status', p.status,
            'avatar_url', p.avatar_url,
            'whatsapp_number', p.whatsapp_number,
            'creci', p.creci,
            'region', p.region,
            'reputation_score', p.reputation_score,
            'last_activation_reminder_at', p.last_activation_reminder_at,
            'properties_count', (SELECT count(*) FROM public.documents d WHERE d.metadata->>'user_id' = p.id::text AND d.metadata->>'type' = 'oferta'),
            'demands_count', (SELECT count(*) FROM public.documents d WHERE d.metadata->>'user_id' = p.id::text AND d.metadata->>'type' = 'demanda'),
            'referrals_count', (SELECT count(*) FROM public.profiles r WHERE r.referred_by_id = p.id)
        ) ORDER BY p.updated_at DESC
    ), '[]'::jsonb) INTO v_result
    FROM public.profiles p;

    RETURN v_result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_inactive_profiles_for_activation()
RETURNS TABLE (
    id uuid,
    full_name text,
    email text,
    whatsapp_number text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY
    SELECT p.id, p.full_name, p.email, p.whatsapp_number
    FROM public.profiles p
    WHERE p.status = 'active'
      AND p.created_at < now() - interval '7 days'
      AND (p.last_activation_reminder_at IS NULL OR p.last_activation_reminder_at < now() - interval '7 days')
      AND NOT EXISTS (
          SELECT 1 FROM public.documents d WHERE d.metadata->>'user_id' = p.id::text AND (d.metadata->>'type' = 'oferta' OR d.metadata->>'type' = 'demanda')
      );
END;
$function$;

DO $setup_cron$
DECLARE
    v_job_id bigint;
    v_url text;
BEGIN
    v_url := current_setting('app.settings.supabase_url', true);
    IF v_url IS NULL OR v_url = '' THEN
        v_url := 'https://lortaowlmktdnttoykfl.supabase.co';
    END IF;
    v_url := v_url || '/functions/v1/process-activation-reminders';

    BEGIN
        SELECT cron.schedule(
            'weekly-activation-reminders',
            '0 9 * * 1', -- Every Monday at 9:00 AM
            format('SELECT net.http_post(url := %L, headers := ''{"Content-Type": "application/json"}''::jsonb, body := ''{}''::jsonb)', v_url)
        ) INTO v_job_id;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not schedule cron job. pg_cron or net might not be available: %', SQLERRM;
    END;
END $setup_cron$;
