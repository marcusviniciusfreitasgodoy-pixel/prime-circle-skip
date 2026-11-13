-- Clear all user-related data to restart E2E testing

-- 1. Delete all support tickets (as they have ON DELETE SET NULL and might be left behind)
-- 2. Delete all feedback
-- 3. Delete all notification logs and templates
-- 4. Delete all profiles (although auth.users cascade would do this, being explicit as per AC)
-- 5. Delete all auth users (this will reset the registration base and trigger cascades)

