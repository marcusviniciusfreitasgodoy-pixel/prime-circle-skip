-- Function to trigger a WhatsApp message when a user is validated
CREATE OR REPLACE FUNCTION public.trigger_validation_whatsapp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_url text;
  v_body jsonb;
  v_message text;
BEGIN
  -- Only trigger when status changes from pending_validation to active and validated_by is populated
  IF OLD.status = 'pending_validation' AND NEW.status = 'active' AND NEW.validated_by IS NOT NULL THEN
    
    -- Make sure the user has a whatsapp number
    IF NEW.whatsapp_number IS NULL OR NEW.whatsapp_number = '' THEN
      RETURN NEW;
    END IF;

    v_url := current_setting('app.settings.supabase_url', true);
    IF v_url IS NULL OR v_url = '' THEN
      v_url := 'https://lortaowlmktdnttoykfl.supabase.co';
    END IF;
    
    v_url := v_url || '/functions/v1/send-whatsapp';
    
    -- Construct the exact message requested in Acceptance Criteria
    v_message := 'Olá ' || COALESCE(NEW.full_name, 'Parceiro(a)') || '! Sua conta no Prime Circle foi validada com sucesso por um de nossos membros sêniores. 🚀 Acesse agora para conferir as oportunidades exclusivas: https://prime-circle-migration-fd549.goskip.app/dashboard';

    -- Build the payload for the edge function. Including user_id ensures it gets logged in notification_logs.
    v_body := jsonb_build_object(
      'number', NEW.whatsapp_number,
      'text', v_message,
      'user_id', NEW.id
    );
    
    BEGIN
      PERFORM net.http_post(
          url := v_url,
          headers := '{"Content-Type": "application/json"}'::jsonb,
          body := v_body,
          timeout_milliseconds := 2000
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Error scheduling validation whatsapp pg_net request: %', SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create the trigger on the profiles table
DROP TRIGGER IF EXISTS on_profile_validated_send_whatsapp ON public.profiles;
CREATE TRIGGER on_profile_validated_send_whatsapp
  AFTER UPDATE OF status ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_validation_whatsapp();
