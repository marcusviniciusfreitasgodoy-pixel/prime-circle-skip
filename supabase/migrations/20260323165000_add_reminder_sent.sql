ALTER TABLE public.partnerships ADD COLUMN IF NOT EXISTS reminder_sent boolean DEFAULT false;
