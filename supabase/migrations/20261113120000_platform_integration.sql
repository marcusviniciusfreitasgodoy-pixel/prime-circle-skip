-- Prime Circle: receber usuários da plataforma Prime Circle (13/11/2026)
-- Roda depois de 20261113000000_security_hardening. Idempotente. Não apaga dados.

-- 1. Origem do cadastro (usuários que chegam da plataforma Prime Circle)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'direct';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS external_id text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS provisioned_at timestamptz;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_external_id_key
  ON public.profiles (external_id) WHERE external_id IS NOT NULL;

-- 2. Criação de perfil: lê a origem de app_metadata (só a chave de serviço grava)
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
  -- raw_app_meta_data só pode ser escrito com a chave de serviço; o usuário não controla
  v_source TEXT := CASE WHEN NEW.raw_app_meta_data->>'provisioned_by' = 'primecircle_saas'
                        THEN 'primecircle_saas' ELSE 'direct' END;
  v_external_id TEXT := NULLIF(NEW.raw_app_meta_data->>'external_id', '');
BEGIN
  SELECT COUNT(*) INTO user_count FROM public.profiles WHERE source = 'direct';

  IF NEW.email_confirmed_at IS NOT NULL
     AND EXISTS (SELECT 1 FROM public.admin_allowlist a WHERE lower(a.email) = lower(NEW.email)) THEN
    assigned_role := 'admin';
    assigned_plan := 'Founder';
    assigned_status := 'active';
  ELSIF v_source = 'primecircle_saas' THEN
    -- Vindos da plataforma: entram ativos e não ocupam as 20 vagas de fundador
    assigned_status := CASE WHEN NEW.raw_app_meta_data->>'initial_status' = 'pending_validation'
                            THEN 'pending_validation' ELSE 'active' END;
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
      ticket_value, referral_code, company_name, email, referred_by_id, specialties,
      source, external_id, provisioned_at
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
      NEW.raw_user_meta_data->>'specialties',
      v_source,
      v_external_id,
      CASE WHEN v_source = 'direct' THEN NULL ELSE now() END
    )
    ON CONFLICT (id) DO UPDATE SET
      role = EXCLUDED.role,
      plan = EXCLUDED.plan,
      status = EXCLUDED.status,
      email = EXCLUDED.email,
      source = EXCLUDED.source,
      external_id = COALESCE(public.profiles.external_id, EXCLUDED.external_id),
      provisioned_at = COALESCE(public.profiles.provisioned_at, EXCLUDED.provisioned_at);

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

-- 3. Trava de colunas: origem e vínculo também ficam protegidos
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
    NEW.source := 'direct';
    NEW.external_id := NULL;
    NEW.provisioned_at := NULL;
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
    NEW.source := OLD.source;
    NEW.external_id := OLD.external_id;
    NEW.provisioned_at := OLD.provisioned_at;
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

-- Boas-vindas automáticas só para quem se cadastra direto no app.
-- Quem vem da plataforma recebe a comunicação que a integração decidir.
DROP TRIGGER IF EXISTS on_profile_created_send_welcome ON public.profiles;
CREATE TRIGGER on_profile_created_send_welcome
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  WHEN (NEW.source = 'direct')
  EXECUTE FUNCTION public.trigger_welcome_webhook();
