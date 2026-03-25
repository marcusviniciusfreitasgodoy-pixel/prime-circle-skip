-- Migration for Referral Automation Triggers

-- Trigger 1: On Demand Created
CREATE OR REPLACE FUNCTION public.trigger_referral_prompt_on_demand()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_url text;
  v_body jsonb;
  v_user record;
  v_message text;
  v_email_subject text;
  v_email_body text;
  v_demand_count int;
BEGIN
  IF NEW.metadata->>'type' = 'demanda' THEN
    -- Check how many demands the user has created
    SELECT count(*) INTO v_demand_count FROM public.documents 
    WHERE metadata->>'user_id' = NEW.metadata->>'user_id' AND metadata->>'type' = 'demanda';
    
    -- Only send on the 1st and 3rd demand to avoid spam
    IF v_demand_count IN (1, 3) THEN
      SELECT * INTO v_user FROM public.profiles WHERE id = (NEW.metadata->>'user_id')::uuid;
      
      IF v_user.whatsapp_number IS NOT NULL THEN
        v_message := 'Olá ' || split_part(COALESCE(v_user.full_name, 'Parceiro'), ' ', 1) || '! Notamos que você acabou de cadastrar uma demanda na rede. 🎯 ' ||
                     'Ainda não encontrou o imóvel ideal? Convide um corretor de confiança que atua nessa região! ' ||
                     'Quanto maior nossa rede, mais negócios fechamos juntos. Envie seu link exclusivo: https://www.primecircle.app.br/apply?ref=' || v_user.id;
                     
        v_url := current_setting('app.settings.supabase_url', true);
        IF v_url IS NULL OR v_url = '' THEN
          v_url := 'https://lortaowlmktdnttoykfl.supabase.co';
        END IF;
        
        -- Send WhatsApp
        v_body := jsonb_build_object('number', v_user.whatsapp_number, 'text', v_message, 'user_id', v_user.id);
        BEGIN
          PERFORM net.http_post(
              url := v_url || '/functions/v1/send-whatsapp',
              headers := '{"Content-Type": "application/json"}'::jsonb,
              body := v_body,
              timeout_milliseconds := 2000
          );
        EXCEPTION WHEN OTHERS THEN
          RAISE WARNING 'Error scheduling referral prompt on demand WA: %', SQLERRM;
        END;
        
        -- Send Email
        IF v_user.email IS NOT NULL THEN
          v_email_subject := 'Não encontrou o imóvel ideal?';
          v_email_body := 'Olá ' || split_part(COALESCE(v_user.full_name, 'Parceiro'), ' ', 1) || ',

Notamos que você acabou de cadastrar uma nova demanda no Prime Circle. 🎯

Ainda não encontrou o imóvel perfeito para o seu cliente na nossa rede? Nossa dica de ouro: convide o corretor que você sabe que tem esse imóvel para se juntar ao Prime Circle!

Ao trazê-lo para a rede, vocês fecham a parceria com segurança (50/50) e você nos ajuda a expandir as oportunidades para todos.

Envie seu link exclusivo para ele:
https://www.primecircle.app.br/apply?ref=' || v_user.id || '

Boas vendas,
Equipe Prime Circle';

          v_body := jsonb_build_object('to', v_user.email, 'subject', v_email_subject, 'text', v_email_body, 'user_id', v_user.id);
          BEGIN
            PERFORM net.http_post(
                url := v_url || '/functions/v1/send-email',
                headers := '{"Content-Type": "application/json"}'::jsonb,
                body := v_body,
                timeout_milliseconds := 2000
            );
          EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Error scheduling referral prompt on demand Email: %', SQLERRM;
          END;
        END IF;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_demand_referral_prompt ON public.documents;
CREATE TRIGGER on_demand_referral_prompt
  AFTER INSERT ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.trigger_referral_prompt_on_demand();


-- Trigger 2: On Partnership Closed
CREATE OR REPLACE FUNCTION public.trigger_referral_prompt_on_closed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_url text;
  v_body jsonb;
  v_user1 record;
  v_user2 record;
  v_message text;
  v_email_subject text;
  v_email_body text;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status IN ('closed', 'aguardando_vgv') THEN
    SELECT * INTO v_user1 FROM public.profiles WHERE id = NEW.broker_property_id;
    SELECT * INTO v_user2 FROM public.profiles WHERE id = NEW.broker_demand_id;
    
    v_url := current_setting('app.settings.supabase_url', true);
    IF v_url IS NULL OR v_url = '' THEN
      v_url := 'https://lortaowlmktdnttoykfl.supabase.co';
    END IF;
    
    -- Process for Broker Property
    IF v_user1.whatsapp_number IS NOT NULL THEN
      v_message := 'Parabéns pelo fechamento, ' || split_part(COALESCE(v_user1.full_name, 'Parceiro'), ' ', 1) || '! 🎉 ' ||
                   'Você acabou de ver na prática o poder do Prime Circle. ' ||
                   'Que tal multiplicar esses resultados? Convide seus parceiros de confiança para a rede e aumente seu portfólio de oportunidades! ' ||
                   'Seu link: https://www.primecircle.app.br/apply?ref=' || v_user1.id;
      v_body := jsonb_build_object('number', v_user1.whatsapp_number, 'text', v_message, 'user_id', v_user1.id);
      BEGIN
        PERFORM net.http_post(url := v_url || '/functions/v1/send-whatsapp', headers := '{"Content-Type": "application/json"}'::jsonb, body := v_body, timeout_milliseconds := 2000);
      EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Error scheduling referral prompt on closed (user1 WA): %', SQLERRM;
      END;
      
      IF v_user1.email IS NOT NULL THEN
        v_email_subject := 'Parabéns pelo fechamento! Multiplique seus resultados 🚀';
        v_email_body := 'Olá ' || split_part(COALESCE(v_user1.full_name, 'Parceiro'), ' ', 1) || ',

Parabéns pelo fechamento de negócio através do Prime Circle! 🎉

Você acaba de comprovar o poder da nossa rede exclusiva. Para que você continue fechando parcerias de alto nível com segurança e rapidez, precisamos da sua ajuda para crescer o nosso ecossistema.

Quanto mais corretores de confiança na rede, mais rápido ocorrem os matches.

Convide seus parceiros utilizando seu link exclusivo:
https://www.primecircle.app.br/apply?ref=' || v_user1.id || '

Boas vendas,
Equipe Prime Circle';

        v_body := jsonb_build_object('to', v_user1.email, 'subject', v_email_subject, 'text', v_email_body, 'user_id', v_user1.id);
        BEGIN
          PERFORM net.http_post(url := v_url || '/functions/v1/send-email', headers := '{"Content-Type": "application/json"}'::jsonb, body := v_body, timeout_milliseconds := 2000);
        EXCEPTION WHEN OTHERS THEN
          RAISE WARNING 'Error scheduling referral prompt on closed (user1 Email): %', SQLERRM;
        END;
      END IF;
    END IF;

    -- Process for Broker Demand
    IF v_user2.whatsapp_number IS NOT NULL THEN
      v_message := 'Parabéns pelo fechamento, ' || split_part(COALESCE(v_user2.full_name, 'Parceiro'), ' ', 1) || '! 🎉 ' ||
                   'Você acabou de ver na prática o poder do Prime Circle. ' ||
                   'Que tal multiplicar esses resultados? Convide seus parceiros de confiança para a rede e aumente seu portfólio de oportunidades! ' ||
                   'Seu link: https://www.primecircle.app.br/apply?ref=' || v_user2.id;
      v_body := jsonb_build_object('number', v_user2.whatsapp_number, 'text', v_message, 'user_id', v_user2.id);
      BEGIN
        PERFORM net.http_post(url := v_url || '/functions/v1/send-whatsapp', headers := '{"Content-Type": "application/json"}'::jsonb, body := v_body, timeout_milliseconds := 2000);
      EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Error scheduling referral prompt on closed (user2 WA): %', SQLERRM;
      END;
      
      IF v_user2.email IS NOT NULL THEN
        v_email_subject := 'Parabéns pelo fechamento! Multiplique seus resultados 🚀';
        v_email_body := 'Olá ' || split_part(COALESCE(v_user2.full_name, 'Parceiro'), ' ', 1) || ',

Parabéns pelo fechamento de negócio através do Prime Circle! 🎉

Você acaba de comprovar o poder da nossa rede exclusiva. Para que você continue fechando parcerias de alto nível com segurança e rapidez, precisamos da sua ajuda para crescer o nosso ecossistema.

Quanto mais corretores de confiança na rede, mais rápido ocorrem os matches.

Convide seus parceiros utilizando seu link exclusivo:
https://www.primecircle.app.br/apply?ref=' || v_user2.id || '

Boas vendas,
Equipe Prime Circle';

        v_body := jsonb_build_object('to', v_user2.email, 'subject', v_email_subject, 'text', v_email_body, 'user_id', v_user2.id);
        BEGIN
          PERFORM net.http_post(url := v_url || '/functions/v1/send-email', headers := '{"Content-Type": "application/json"}'::jsonb, body := v_body, timeout_milliseconds := 2000);
        EXCEPTION WHEN OTHERS THEN
          RAISE WARNING 'Error scheduling referral prompt on closed (user2 Email): %', SQLERRM;
        END;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_partnership_closed_referral ON public.partnerships;
CREATE TRIGGER on_partnership_closed_referral
  AFTER UPDATE OF status ON public.partnerships
  FOR EACH ROW EXECUTE FUNCTION public.trigger_referral_prompt_on_closed();
