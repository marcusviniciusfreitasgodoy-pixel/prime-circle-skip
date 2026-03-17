ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ticket_value TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS creci TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code TEXT;
