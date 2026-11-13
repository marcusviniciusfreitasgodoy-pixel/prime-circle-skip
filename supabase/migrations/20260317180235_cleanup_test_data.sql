-- Explicitly delete all notification logs to clear message history
-- Delete all users from the authentication table to allow fresh registrations.
-- Due to ON DELETE CASCADE constraints, this will also automatically remove:
-- 1. Related records in public.profiles
-- 2. Related records in public.notification_templates

-- Note: public.objections_sofia and public.documents are intentionally untouched 
-- to preserve application knowledge and document embeddings.
-- All triggers (handle_new_user, handle_new_user_templates) remain intact.
