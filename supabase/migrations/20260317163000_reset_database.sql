-- Reset user database to prepare for clean validation
TRUNCATE auth.users CASCADE;

-- Add fields to track roles and plans natively on profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'Free';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create function to handle new user registration and automatically assign first user as Admin/Founder
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_count INT;
  assigned_role TEXT := 'user';
  assigned_plan TEXT := 'Free';
BEGIN
  -- Verify if this is the first user
  SELECT count(*) INTO user_count FROM auth.users;
  
  IF user_count <= 1 THEN
    assigned_role := 'admin';
    assigned_plan := 'Founder';
  END IF;

  INSERT INTO public.profiles (id, full_name, role, plan, accepted_terms)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    assigned_role,
    assigned_plan,
    false
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    plan = EXCLUDED.plan;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
