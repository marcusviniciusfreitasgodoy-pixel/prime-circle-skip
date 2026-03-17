-- Create avatars bucket if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true) 
ON CONFLICT (id) DO NOTHING;

-- Add avatar_url column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Update handle_new_user trigger to include avatar_url mapping
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
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
    avatar_url
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
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    plan = EXCLUDED.plan;
    
  RETURN NEW;
END;
$function$;

-- Storage RLS Policies
DO $$
BEGIN
    DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
    DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
    DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
END $$;

CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
    FOR SELECT TO public USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (
        bucket_id = 'avatars' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can update their own avatar" ON storage.objects
    FOR UPDATE TO authenticated USING (
        bucket_id = 'avatars' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can delete their own avatar" ON storage.objects
    FOR DELETE TO authenticated USING (
        bucket_id = 'avatars' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );
