-- Prime Circle: pré-cadastro para usuários da plataforma (13/11/2026)
-- Corrige 20261113120000: o Supabase Auth grava app_metadata depois do gatilho de criação
-- de perfil, então a origem passa a vir de uma tabela que a função provision-user preenche
-- antes de criar a conta. Idempotente. Não apaga dados de usuários.

-- 1. Tabela de pré-cadastro (só a chave de serviço acessa)
CREATE TABLE IF NOT EXISTS public.pending_provisions (
  email text PRIMARY KEY,
  external_id text NOT NULL,
  initial_status text NOT NULL DEFAULT 'active' CHECK (initial_status IN ('active', 'pending_validation')),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pending_provisions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.pending_provisions FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pending_provisions TO service_role;

-- 2. Criação de perfil lê o pré-cadastro
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
  v_source TEXT := 'direct';
  v_external_id TEXT := NULL;
  v_initial_status TEXT := NULL;
  v_pending public.pending_provisions%ROWTYPE;
BEGIN
  -- Pré-cadastro gravado pela função provision-user antes de criar a conta.
  -- Só a chave de serviço escreve nessa tabela; o usuário não controla.
  SELECT * INTO v_pending FROM public.pending_provisions
  WHERE email = lower(NEW.email) AND created_at > now() - interval '15 minutes';
  IF FOUND THEN
    v_source := 'primecircle_saas';
    v_external_id := v_pending.external_id;
    v_initial_status := v_pending.initial_status;
    DELETE FROM public.pending_provisions WHERE email = v_pending.email;
  END IF;

  SELECT COUNT(*) INTO user_count FROM public.profiles WHERE source = 'direct';

  IF NEW.email_confirmed_at IS NOT NULL
     AND EXISTS (SELECT 1 FROM public.admin_allowlist a WHERE lower(a.email) = lower(NEW.email)) THEN
    assigned_role := 'admin';
    assigned_plan := 'Founder';
    assigned_status := 'active';
  ELSIF v_source = 'primecircle_saas' THEN
    -- Vindos da plataforma: entram ativos e não ocupam as 20 vagas de fundador
    assigned_status := CASE WHEN v_initial_status = 'pending_validation'
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
