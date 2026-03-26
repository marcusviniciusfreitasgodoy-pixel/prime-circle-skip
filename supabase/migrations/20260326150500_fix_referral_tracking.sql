-- Fix Referral Tracking Logic

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
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

  IF user_count = 0 THEN
    assigned_role := 'admin';
    assigned_plan := 'Founder';
    assigned_status := 'active';
  ELSIF user_count < 20 THEN
    assigned_plan := 'Founder';
    assigned_status := 'active';
  END IF;

  -- Resolve referral
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
      id,
      full_name,
      role,
      plan,
      status,
      accepted_terms,
      whatsapp_number,
      creci,
      region,
      ticket_value,
      referral_code,
      company_name,
      email,
      referred_by_id,
      specialties
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

-- Retroactive audit to fix missing referrals
DO $$
DECLARE
  r RECORD;
  v_ref_id UUID;
BEGIN
  FOR r IN 
    SELECT id, referral_code 
    FROM public.profiles 
    WHERE referred_by_id IS NULL 
      AND referral_code IS NOT NULL 
      AND referral_code != ''
  LOOP
    v_ref_id := NULL;
    
    IF r.referral_code ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
      SELECT id INTO v_ref_id FROM public.profiles WHERE id = r.referral_code::uuid OR referral_code = r.referral_code LIMIT 1;
    ELSE
      SELECT id INTO v_ref_id FROM public.profiles WHERE referral_code = r.referral_code LIMIT 1;
    END IF;
    
    IF v_ref_id IS NOT NULL AND v_ref_id != r.id THEN
      UPDATE public.profiles SET referred_by_id = v_ref_id WHERE id = r.id;
    END IF;
  END LOOP;
END $$;
