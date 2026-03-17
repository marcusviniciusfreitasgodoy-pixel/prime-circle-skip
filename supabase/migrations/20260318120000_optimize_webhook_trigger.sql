CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.trigger_welcome_webhook()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_url text;
BEGIN
  v_url := current_setting('app.settings.supabase_url', true);
  
  IF v_url IS NULL OR v_url = '' THEN
    v_url := 'https://lortaowlmktdnttoykfl.supabase.co';
  END IF;
  
  v_url := v_url || '/functions/v1/welcome-webhook';

  BEGIN
    PERFORM net.http_post(
        url := v_url,
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := jsonb_build_object('type', 'INSERT', 'table', 'profiles', 'schema', 'public', 'record', row_to_json(NEW)),
        timeout_milliseconds := 1000
    );
  EXCEPTION WHEN OTHERS THEN
    -- Ensure pg_net failures do not abort the database transaction for the new user registration
    RAISE WARNING 'Error scheduling welcome webhook pg_net request: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$;
