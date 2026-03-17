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

  PERFORM net.http_post(
      url := v_url,
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := jsonb_build_object('type', 'INSERT', 'table', 'profiles', 'schema', 'public', 'record', row_to_json(NEW))
  );
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created_send_welcome ON public.profiles;
CREATE TRIGGER on_profile_created_send_welcome
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.trigger_welcome_webhook();
