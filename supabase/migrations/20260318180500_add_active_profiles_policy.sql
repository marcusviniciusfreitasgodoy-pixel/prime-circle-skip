-- Allow authenticated users to perform SELECT operations on the profiles table
-- specifically for reading records where status = 'active'.
-- This enables verifying referral codes and active partner statuses.

DO $$
BEGIN
  DROP POLICY IF EXISTS "Authenticated users can select active profiles" ON public.profiles;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

CREATE POLICY "Authenticated users can select active profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (status = 'active');
