-- Delete all support tickets to reset support management history
DELETE FROM public.support_tickets;

-- Delete all notification logs to clear the history of sent messages
DELETE FROM public.notification_logs;

-- Delete all notification templates to allow the trigger to recreate them correctly for new users
DELETE FROM public.notification_templates;

-- Delete all records from the profiles table
DELETE FROM public.profiles;

-- Delete all records from the auth.users table (this would also cascade to profiles, logs, and templates)
DELETE FROM auth.users;
