-- Elevate the most recently created user to admin and Founder
DO $$
DECLARE
  latest_user_id uuid;
BEGIN
  SELECT id INTO latest_user_id FROM auth.users ORDER BY created_at DESC LIMIT 1;
  
  IF latest_user_id IS NOT NULL THEN
    UPDATE public.profiles
    SET role = 'admin', plan = 'Founder'
    WHERE id = latest_user_id;
  END IF;
END $$;

-- Ensure RLS allows updating accepted_terms
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile" ON public.profiles
      FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
  END IF;
END $$;
