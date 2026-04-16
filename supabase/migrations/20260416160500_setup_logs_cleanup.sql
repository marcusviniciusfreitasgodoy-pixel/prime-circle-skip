-- Function to clean old logs directly (alternative to edge function if invoked locally)
CREATE OR REPLACE FUNCTION public.clean_old_logs(days_to_keep int DEFAULT 90)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_count int;
BEGIN
  DELETE FROM public.notification_logs
  WHERE created_at < NOW() - (days_to_keep || ' days')::interval;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$function$;

-- Setup pg_cron job to call the clean_old_logs function every day at 3 AM
-- This will only work if the pg_cron extension is enabled and accessible by the current user
DO $DO$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
  ) THEN
    BEGIN
      PERFORM cron.schedule(
        'clean_old_logs_job',
        '0 3 * * *',
        $$SELECT public.clean_old_logs(90)$$
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Could not schedule pg_cron job: %', SQLERRM;
    END;
  END IF;
END $DO$;
