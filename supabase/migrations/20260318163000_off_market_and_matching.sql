-- Add is_off_market to some existing seed properties to demonstrate the feature
UPDATE public.documents
SET metadata = jsonb_set(metadata, '{is_off_market}', 'true'::jsonb)
WHERE metadata->>'type' = 'oferta' AND content LIKE '%Luxo%';

-- Update reputation score for the seed user to be high enough for testing (>= 70)
UPDATE public.profiles
SET reputation_score = 85
WHERE email = 'seed@primecircle.app';

-- Create the webhook trigger function to evaluate matches on new property listings
CREATE OR REPLACE FUNCTION public.trigger_match_property_webhook()
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
  
  v_url := v_url || '/functions/v1/match-property-webhook';

  -- Only trigger matching logic if a new 'oferta' (property) is inserted
  IF NEW.metadata->>'type' = 'oferta' THEN
    v_body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'documents',
      'schema', 'public',
      'record', row_to_json(NEW)
    );
    
    BEGIN
      PERFORM net.http_post(
          url := v_url,
          headers := '{"Content-Type": "application/json"}'::jsonb,
          body := v_body,
          timeout_milliseconds := 2000
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Error scheduling match webhook pg_net request: %', SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Attach the trigger to the documents table
DROP TRIGGER IF EXISTS on_document_created_send_match ON public.documents;
CREATE TRIGGER on_document_created_send_match
  AFTER INSERT ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.trigger_match_property_webhook();
