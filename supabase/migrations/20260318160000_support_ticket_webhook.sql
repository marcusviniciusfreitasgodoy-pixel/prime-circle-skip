CREATE OR REPLACE FUNCTION public.trigger_support_ticket_webhook()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_url text;
  v_body jsonb;
BEGIN
  v_url := current_setting('app.settings.supabase_url', true);
  
  IF v_url IS NULL OR v_url = '' THEN
    v_url := 'https://lortaowlmktdnttoykfl.supabase.co';
  END IF;
  
  v_url := v_url || '/functions/v1/support-ticket-webhook';
  v_body := jsonb_build_object(
    'type', 'INSERT', 
    'table', 'support_tickets', 
    'schema', 'public', 
    'record', row_to_json(NEW)
  );

  BEGIN
    -- net.http_post puts the request in an async queue handled by the pg_net background worker
    -- This guarantees the transaction commits quickly regardless of the edge function's response time
    PERFORM net.http_post(
        url := v_url,
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := v_body,
        timeout_milliseconds := 2000
    );
  EXCEPTION WHEN OTHERS THEN
    -- Completely swallow any pg_net scheduling errors to avoid aborting insert
    RAISE WARNING 'Error scheduling support ticket webhook pg_net request: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$function$;

CREATE TRIGGER on_support_ticket_created_send_notification
  AFTER INSERT ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_support_ticket_webhook();
