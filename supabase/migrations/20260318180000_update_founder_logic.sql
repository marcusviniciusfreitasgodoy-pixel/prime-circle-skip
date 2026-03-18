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
BEGIN
  -- Fast count to assign Founder to first 20 users
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  
  IF user_count = 0 THEN
    assigned_role := 'admin';
    assigned_plan := 'Founder';
    assigned_status := 'active';
  ELSIF user_count < 20 THEN
    assigned_plan := 'Founder';
    assigned_status := 'active';
  END IF;

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
      company_name
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
      NEW.raw_user_meta_data->>'company_name'
    )
    ON CONFLICT (id) DO UPDATE SET
      role = EXCLUDED.role,
      plan = EXCLUDED.plan,
      status = EXCLUDED.status;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
  END;
    
  RETURN NEW;
END;
$function$;

-- Update the existing first 20 users to ensure they have the Founder plan and are active
WITH first_users AS (
  SELECT p.id
  FROM public.profiles p
  JOIN auth.users u ON p.id = u.id
  ORDER BY u.created_at ASC
  LIMIT 20
)
UPDATE public.profiles
SET
  plan = 'Founder',
  status = CASE WHEN status = 'pending_validation' THEN 'active' ELSE status END
WHERE id IN (SELECT id FROM first_users);
