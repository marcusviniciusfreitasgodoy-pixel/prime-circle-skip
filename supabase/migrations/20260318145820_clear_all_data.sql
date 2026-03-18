-- Clear all application data for a clean slate test
-- Child tables are deleted first to avoid any potential foreign key constraint issues, 
-- even though ON DELETE CASCADE is configured for most of them.

DELETE FROM public.support_tickets;
DELETE FROM public.notification_logs;
DELETE FROM public.notification_templates;
DELETE FROM public.profiles;
DELETE FROM auth.users;
