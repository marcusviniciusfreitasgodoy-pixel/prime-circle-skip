-- Clean all support tickets explicitly since the user_id relation is ON DELETE SET NULL
DELETE FROM public.support_tickets;

-- Delete all users from auth.users. 
-- This will trigger ON DELETE CASCADE to remove data from:
-- 1. public.profiles
-- 2. public.notification_logs (cascading from profiles)
-- 3. public.notification_templates (cascading from profiles)
-- 4. public.match_feedback (cascading from profiles)
DELETE FROM auth.users;
