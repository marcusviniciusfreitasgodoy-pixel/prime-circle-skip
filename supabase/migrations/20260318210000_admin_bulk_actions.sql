-- Add email column to profiles if it doesn't exist to allow searching and password resets
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email') THEN
    ALTER TABLE public.profiles ADD COLUMN email TEXT;
  END IF;
END $$;

-- Update the handle_new_user trigger to populate the email column automatically
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
      company_name,
      email
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
      NEW.email
    )
    ON CONFLICT (id) DO UPDATE SET
      role = EXCLUDED.role,
      plan = EXCLUDED.plan,
      status = EXCLUDED.status,
      email = EXCLUDED.email;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
  END;
    
  RETURN NEW;
END;
$function$;

-- Backfill emails for existing profiles from auth.users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- Ensure RLS allows admins to perform bulk updates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Admins can update all profiles'
  ) THEN
    CREATE POLICY "Admins can update all profiles" ON public.profiles
      FOR UPDATE TO authenticated
      USING ( public.is_admin() )
      WITH CHECK ( public.is_admin() );
  END IF;
END $$;
