-- Clear all user data to allow testing from a clean state
-- This will allow restarting the onboarding and testing process without conflicts

-- Delete child tables first to avoid any potential constraint issues, 
-- even though CASCADE is configured.

-- Delete profiles (this would normally cascade from auth.users)

