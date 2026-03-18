-- Enable read access for active profiles to allow authenticated users
-- to safely query the 'profiles' table for referral code validation
-- and avoid RLS blocking issues when looking up active partners.

DO $$
BEGIN
  DROP POLICY IF EXISTS "Enable read access for active profiles" ON public.profiles;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

CREATE POLICY "Enable read access for active profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (status = 'active');
