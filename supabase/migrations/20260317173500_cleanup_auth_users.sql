-- Removal of existing test users from the database to allow a fresh start with the corrected SMTP settings.
-- Due to ON DELETE CASCADE, this will also clean up related profiles and templates.
DELETE FROM auth.users;
