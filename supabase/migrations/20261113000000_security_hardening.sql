-- Prime Circle: endurecimento de segurança do banco (13/11/2026)
-- Idempotente: pode ser reaplicada. Não apaga nem altera dados de usuários.

-- 1. Lista de e-mails que viram admin (substitui "primeiro cadastro = admin")
CREATE TABLE IF NOT EXISTS public.admin_allowlist (email text PRIMARY KEY);
ALTER TABLE public.admin_allowlist ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.admin_allowlist FROM PUBLIC, anon, authenticated;
INSERT INTO public.admin_allowlist (email) VALUES
  ('marcusviniciusfreitasgodoy@gmail.com'),
  ('marcus@godoyprime.com.br')
ON CONFLICT DO NOTHING;

-- 2. Criação de perfil: admin só por lista e só com e-mail confirmado
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, extensions
AS $function$
DECLARE
  user_count INT;
  assigned_role TEXT := 'user';
  assigned_plan TEXT := 'Free';
  assigned_status TEXT := 'pending_validation';
  ref_by_id UUID := NULL;
  v_ref_code TEXT;
BEGIN
  SELECT COUNT(*) INTO user_count FROM public.profiles;

  IF NEW.email_confirmed_at IS NOT NULL
     AND EXISTS (SELECT 1 FROM public.admin_allowlist a WHERE lower(a.email) = lower(NEW.email)) THEN
    assigned_role := 'admin';
    assigned_plan := 'Founder';
    assigned_status := 'active';
  ELSIF user_count < 20 THEN
    assigned_plan := 'Founder';
    assigned_status := 'active';
  END IF;

  BEGIN
    IF NEW.raw_user_meta_data->>'referred_by_id' IS NOT NULL AND NEW.raw_user_meta_data->>'referred_by_id' != '' THEN
      ref_by_id := (NEW.raw_user_meta_data->>'referred_by_id')::uuid;
    END IF;

    v_ref_code := NEW.raw_user_meta_data->>'referral_code';
    IF ref_by_id IS NULL AND v_ref_code IS NOT NULL AND v_ref_code != '' THEN
      IF v_ref_code ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
        SELECT id INTO ref_by_id FROM public.profiles WHERE id = v_ref_code::uuid OR referral_code = v_ref_code LIMIT 1;
      ELSE
        SELECT id INTO ref_by_id FROM public.profiles WHERE referral_code = v_ref_code LIMIT 1;
      END IF;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    ref_by_id := NULL;
  END;

  BEGIN
    INSERT INTO public.profiles (
      id, full_name, role, plan, status, accepted_terms, whatsapp_number, creci, region,
      ticket_value, referral_code, company_name, email, referred_by_id, specialties
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      assigned_role,
      assigned_plan,
      assigned_status,
      COALESCE((NEW.raw_user_meta_data->>'accepted_terms')::boolean, false),
      NEW.raw_user_meta_data->>'whatsapp_number',
      NEW.raw_user_meta_data->>'creci',
      NEW.raw_user_meta_data->>'region',
      NEW.raw_user_meta_data->>'ticket_value',
      NEW.raw_user_meta_data->>'referral_code',
      NEW.raw_user_meta_data->>'company_name',
      NEW.email,
      ref_by_id,
      NEW.raw_user_meta_data->>'specialties'
    )
    ON CONFLICT (id) DO UPDATE SET
      role = EXCLUDED.role,
      plan = EXCLUDED.plan,
      status = EXCLUDED.status,
      email = EXCLUDED.email;

    UPDATE public.invitations
    SET status = 'registered'
    WHERE (invitee_email = NEW.email OR invitee_phone = NEW.raw_user_meta_data->>'whatsapp_number')
      AND status = 'pending';

  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
  END;

  RETURN NEW;
END;
$function$;

-- Promove a admin quando o e-mail da lista é confirmado depois do cadastro
CREATE OR REPLACE FUNCTION public.promote_allowlisted_admin()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, extensions
AS $function$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL
     AND EXISTS (SELECT 1 FROM public.admin_allowlist a WHERE lower(a.email) = lower(NEW.email)) THEN
    UPDATE public.profiles
    SET role = 'admin', plan = 'Founder', status = 'active'
    WHERE id = NEW.id AND role IS DISTINCT FROM 'admin';
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS on_auth_user_confirmed_promote_admin ON auth.users;
CREATE TRIGGER on_auth_user_confirmed_promote_admin
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.promote_allowlisted_admin();

-- 3. Trava de colunas sensíveis do perfil
-- Vale só para chamadas diretas do app (papéis authenticated/anon). Funções internas,
-- service_role e admins passam sem restrição.
CREATE OR REPLACE FUNCTION public.guard_profile_columns()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public, extensions
AS $function$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF current_user NOT IN ('authenticated', 'anon') THEN
    RETURN NEW;
  END IF;
  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.role := 'user';
    NEW.plan := 'Free';
    NEW.status := 'pending_validation';
    NEW.reputation_score := 0;
    NEW.suggestion_points := 0;
    NEW.discount_tier := NULL;
    NEW.validated_by := NULL;
    NEW.validation_date := NULL;
    NEW.referred_by_id := NULL;
    RETURN NEW;
  END IF;

  IF OLD.id = v_uid THEN
    NEW.id := OLD.id;
    NEW.role := OLD.role;
    NEW.plan := OLD.plan;
    NEW.status := OLD.status;
    NEW.reputation_score := OLD.reputation_score;
    NEW.suggestion_points := OLD.suggestion_points;
    NEW.discount_tier := OLD.discount_tier;
    NEW.validated_by := OLD.validated_by;
    NEW.validation_date := OLD.validation_date;
    NEW.referred_by_id := OLD.referred_by_id;
    NEW.referral_code := OLD.referral_code;
    NEW.created_at := OLD.created_at;
    NEW.last_activation_reminder_at := OLD.last_activation_reminder_at;
    NEW.golden_duo_reminder_sent_at := OLD.golden_duo_reminder_sent_at;
    RETURN NEW;
  END IF;

  -- Perfil de outra pessoa: só a validação de quem ela indicou
  IF OLD.status = 'pending_validation' AND NEW.status = 'active'
     AND (OLD.referred_by_id = v_uid OR OLD.referral_code = v_uid::text) THEN
    NEW := OLD;
    NEW.status := 'active';
    NEW.validated_by := v_uid;
    NEW.validation_date := now();
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Alteração de perfil não permitida' USING ERRCODE = '42501';
END;
$function$;

DROP TRIGGER IF EXISTS aa_guard_profile_columns ON public.profiles;
CREATE TRIGGER aa_guard_profile_columns
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_columns();

-- 4. Políticas
CREATE OR REPLACE FUNCTION public.can_validate_peers()
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.status = 'active' AND p.reputation_score > 80
  );
$function$;

DROP POLICY IF EXISTS "Admins and Elite can update other profiles" ON public.profiles;
DROP POLICY IF EXISTS "Referrer can validate referred profiles" ON public.profiles;
CREATE POLICY "Referrer can validate referred profiles" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    status = 'pending_validation'
    AND (referred_by_id = auth.uid() OR referral_code = (auth.uid())::text)
    AND public.can_validate_peers()
  )
  WITH CHECK (status = 'active' AND validated_by = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "authenticated_insert_documents" ON public.documents;
CREATE POLICY "authenticated_insert_documents" ON public.documents
  FOR INSERT TO authenticated
  WITH CHECK (((auth.uid())::text = (metadata ->> 'user_id')) OR public.is_admin());

-- 5. Funções privilegiadas: tirar o acesso público
DO $do$
DECLARE r record;
BEGIN
  -- funções de gatilho nunca precisam ser chamadas pela API
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prorettype = 'trigger'::regtype
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated', r.sig);
  END LOOP;

  -- search_path fixo em toda função SECURITY DEFINER
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef AND p.proconfig IS NULL
  LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = public, extensions', r.sig);
  END LOOP;
END
$do$;

-- uso interno (funções de servidor e cron): só service_role
REVOKE EXECUTE ON FUNCTION public.clean_old_logs(integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_inactive_profiles_for_activation() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_id_by_email(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_user_match_count(uuid, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.quick_update_partnership(uuid, text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_notification(uuid, text, text, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.can_validate_peers() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.clean_old_logs(integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_inactive_profiles_for_activation() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_user_id_by_email(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_user_match_count(uuid, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.quick_update_partnership(uuid, text, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.log_notification(uuid, text, text, text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.can_validate_peers() TO authenticated;

-- usadas pelo app logado: sem acesso anônimo
REVOKE EXECUTE ON FUNCTION public.get_admin_users_stats() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_growth_metrics() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_whatsapp_collection_metrics() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_market_intelligence_metrics() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.increment_video_views(bigint) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_admin_users_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_growth_metrics() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_whatsapp_collection_metrics() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_market_intelligence_metrics() TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_video_views(bigint) TO authenticated;
