-- Clear test data to allow fresh testing and solve registration loops
TRUNCATE auth.users CASCADE;

-- Ensure profiles can be updated by their owners during onboarding
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
  CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
END $$;

-- Ensure notification logs can be inserted by their owners
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can insert own logs" ON public.notification_logs;
  CREATE POLICY "Users can insert own logs" ON public.notification_logs
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
END $$;
