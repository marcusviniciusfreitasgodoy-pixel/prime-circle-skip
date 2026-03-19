-- Add created_at column as nullable first to allow backfilling
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ;

-- Backfill existing records using updated_at or current time
UPDATE public.profiles 
SET created_at = COALESCE(updated_at, NOW()) 
WHERE created_at IS NULL;

-- Apply constraints and default value for future inserts
ALTER TABLE public.profiles 
ALTER COLUMN created_at SET NOT NULL,
ALTER COLUMN created_at SET DEFAULT NOW();
