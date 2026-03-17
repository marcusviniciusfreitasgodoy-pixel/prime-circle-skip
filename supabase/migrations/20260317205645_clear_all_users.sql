-- Clear all user data to allow testing from a clean state
-- This will allow restarting the onboarding and testing process without conflicts

-- Delete child tables first to avoid any potential constraint issues, 
-- even though CASCADE is configured.
DELETE FROM public.notification_logs;
DELETE FROM public.notification_templates;

-- Delete profiles (this would normally cascade from auth.users)
DELETE FROM public.profiles;

-- Delete all users from auth.users (this cascades to identities and other auth tables)
DELETE FROM auth.users;
