-- Clear all referral clicks
DELETE FROM public.referral_clicks;

-- Unlink all referred users (reset referral tracking)
UPDATE public.profiles
SET referred_by_id = NULL;
