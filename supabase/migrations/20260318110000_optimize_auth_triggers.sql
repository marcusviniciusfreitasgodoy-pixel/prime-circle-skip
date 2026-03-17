-- Optimizes the handle_new_user trigger to prevent full table scans on auth.users
-- which can cause 504 Gateway Timeouts during user registration.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  is_first_user BOOLEAN;
  assigned_role TEXT := 'user';
  assigned_plan TEXT := 'Free';
BEGIN
  -- Use a fast check on public.profiles instead of a full scan count(*) on auth.users
  SELECT NOT EXISTS (SELECT 1 FROM public.profiles LIMIT 1) INTO is_first_user;
  
  IF is_first_user THEN
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
      role = EXCLUDED.role,
      plan = EXCLUDED.plan;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user trigger: %', SQLERRM;
  END;
    
  RETURN NEW;
END;
$function$;
