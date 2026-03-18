-- Hard Reset of test data for proper platform evaluation
DELETE FROM public.match_feedback;
DELETE FROM public.notification_logs;
DELETE FROM public.support_tickets;
DELETE FROM public.documents;

-- Remove non-admin users (which cascades to profiles and notification_templates)
DELETE FROM auth.users 
WHERE id IN (
  SELECT id FROM public.profiles WHERE role != 'admin'
);
