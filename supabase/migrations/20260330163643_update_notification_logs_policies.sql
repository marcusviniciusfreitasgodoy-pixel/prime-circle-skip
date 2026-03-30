-- Allow admins to update notification logs to fix status when resending
DROP POLICY IF EXISTS "Admins can update all logs" ON public.notification_logs;
CREATE POLICY "Admins can update all logs" ON public.notification_logs
  FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can delete all logs" ON public.notification_logs;
CREATE POLICY "Admins can delete all logs" ON public.notification_logs
  FOR DELETE TO authenticated USING (is_admin());
