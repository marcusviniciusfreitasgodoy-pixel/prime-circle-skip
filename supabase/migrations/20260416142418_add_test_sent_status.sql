DO $$
BEGIN
  -- Remove logs for @adapta.org to clear tests
  DELETE FROM public.notification_logs WHERE recipient ILIKE '%@adapta.org%';

  -- Update constraint on notification_logs status to allow test_sent
  ALTER TABLE public.notification_logs DROP CONSTRAINT IF EXISTS notification_logs_status_check;
  ALTER TABLE public.notification_logs ADD CONSTRAINT notification_logs_status_check CHECK (status = ANY (ARRAY['success'::text, 'failed'::text, 'test_sent'::text]));
END $$;
