-- Update any existing 'in_progress' statuses to 'pending'
UPDATE public.support_tickets 
SET status = 'pending' 
WHERE status = 'in_progress';

-- Remove any existing constraint just in case
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'support_tickets_status_check') THEN
        ALTER TABLE public.support_tickets DROP CONSTRAINT support_tickets_status_check;
    END IF;
END
$$;

-- Add constraint to ensure valid status values
ALTER TABLE public.support_tickets 
ADD CONSTRAINT support_tickets_status_check 
CHECK (status IN ('open', 'pending', 'resolved'));
