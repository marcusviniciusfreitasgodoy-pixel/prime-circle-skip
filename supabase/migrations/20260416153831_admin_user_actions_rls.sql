-- Drop dependent policies
DROP POLICY IF EXISTS "System can manage user_actions" ON public.user_actions;
DROP POLICY IF EXISTS "Admins can manage user_actions" ON public.user_actions;
DROP POLICY IF EXISTS "Users can view own actions" ON public.user_actions;
DROP POLICY IF EXISTS "Users can manage own actions" ON public.user_actions;

-- Create policy for users to manage own actions
CREATE POLICY "Users can manage own actions" ON public.user_actions
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create policy for admins to manage all user_actions
CREATE POLICY "Admins can manage user_actions" ON public.user_actions
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
