-- Allow admins to view all notification logs
DROP POLICY IF EXISTS "Admins can view all logs" ON public.notification_logs;
CREATE POLICY "Admins can view all logs" ON public.notification_logs
  FOR SELECT TO authenticated
  USING (is_admin());
