-- Clear all user-related data to restart E2E testing

-- 1. Delete all support tickets (as they have ON DELETE SET NULL and might be left behind)
DELETE FROM public.support_tickets;

-- 2. Delete all feedback
DELETE FROM public.match_feedback;

-- 3. Delete all notification logs and templates
DELETE FROM public.notification_logs;
DELETE FROM public.notification_templates;

-- 4. Delete all profiles (although auth.users cascade would do this, being explicit as per AC)
DELETE FROM public.profiles;

-- 5. Delete all auth users (this will reset the registration base and trigger cascades)
DELETE FROM auth.users;

