-- Ensures the handle_new_user trigger correctly maps whatsapp_number and creci 
-- from raw_user_meta_data so it is available for Onboarding pre-population.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_count INT;
  assigned_role TEXT := 'user';
  assigned_plan TEXT := 'Free';
BEGIN
  SELECT count(*) INTO user_count FROM auth.users;
  
  IF user_count <= 1 THEN
    assigned_role := 'admin';
    assigned_plan := 'Founder';
  END IF;

  BEGIN
    INSERT INTO public.profiles (
      id, 
      full_name, 
      role, 
      plan, 
      accepted_terms,
      whatsapp_number,
      creci,
      region,
      ticket_value,
      referral_code,
      company_name
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      assigned_role,
      assigned_plan,
      COALESCE((NEW.raw_user_meta_data->>'accepted_terms')::boolean, false),
      NEW.raw_user_meta_data->>'whatsapp_number',
      NEW.raw_user_meta_data->>'creci',
      NEW.raw_user_meta_data->>'region',
      NEW.raw_user_meta_data->>'ticket_value',
      NEW.raw_user_meta_data->>'referral_code',
      NEW.raw_user_meta_data->>'company_name'
    )
    ON CONFLICT (id) DO UPDATE SET
      whatsapp_number = COALESCE(public.profiles.whatsapp_number, EXCLUDED.whatsapp_number),
      creci = COALESCE(public.profiles.creci, EXCLUDED.creci);
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user trigger: %', SQLERRM;
  END;
    
  RETURN NEW;
END;
$$;
