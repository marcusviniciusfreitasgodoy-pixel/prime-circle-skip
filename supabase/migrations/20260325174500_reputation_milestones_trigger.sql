DO $BODY$
BEGIN
  -- Create or Replace Function for Milestone Check
  CREATE OR REPLACE FUNCTION public.check_reputation_milestones()
  RETURNS TRIGGER AS $FUNC$
  DECLARE
    v_10th_score INT;
    v_message TEXT;
    v_url TEXT;
    v_body JSONB;
  BEGIN
    -- Se a reputação aumentou
    IF NEW.reputation_score > OLD.reputation_score THEN
      
      -- Check milestones (20, 50, 100)
      IF OLD.reputation_score < 20 AND NEW.reputation_score >= 20 THEN
        v_message := '🎉 Parabéns! Você atingiu o nível Bronze (20+ pts) de reputação na Prime Circle!';
      ELSIF OLD.reputation_score < 50 AND NEW.reputation_score >= 50 THEN
        v_message := '🥈 Incrível! Você alcançou o nível Prata (50+ pts) de reputação na Prime Circle!';
      ELSIF OLD.reputation_score < 100 AND NEW.reputation_score >= 100 THEN
        v_message := '🥇 Excepcional! Você agora é nível Elite Ouro (100+ pts) de reputação na Prime Circle!';
      END IF;

      -- Send Whatsapp notification for milestones
      IF v_message IS NOT NULL AND NEW.whatsapp_number IS NOT NULL THEN
        v_url := current_setting('app.settings.supabase_url', true);
        IF v_url IS NULL OR v_url = '' THEN
          v_url := 'https://lortaowlmktdnttoykfl.supabase.co';
        END IF;
        v_url := v_url || '/functions/v1/send-whatsapp';
        v_body := jsonb_build_object('number', NEW.whatsapp_number, 'text', v_message, 'user_id', NEW.id);
        
        BEGIN
          PERFORM net.http_post(
            url := v_url, 
            headers := '{"Content-Type": "application/json"}'::jsonb, 
            body := v_body, 
            timeout_milliseconds := 2000
          );
        EXCEPTION WHEN OTHERS THEN
          RAISE WARNING 'Error scheduling whatsapp milestone: %', SQLERRM;
        END;
      END IF;

      -- Check Top 10 entry
      -- Pega o score do 10º colocado (se houver menos de 10, pega o menor)
      SELECT min(reputation_score) INTO v_10th_score FROM (
        SELECT reputation_score FROM public.profiles WHERE status = 'active' ORDER BY reputation_score DESC LIMIT 10
      ) t;

      -- Se o user não estava no top 10 (OLD < 10th score) e agora está (NEW >= 10th score)
      IF OLD.reputation_score < COALESCE(v_10th_score, 0) AND NEW.reputation_score >= COALESCE(v_10th_score, 0) AND NEW.whatsapp_number IS NOT NULL THEN
        v_message := '🏆 Você acaba de entrar no TOP 10 do Ranking de Reputação da Prime Circle! Continue o excelente trabalho.';
        v_url := current_setting('app.settings.supabase_url', true);
        IF v_url IS NULL OR v_url = '' THEN
          v_url := 'https://lortaowlmktdnttoykfl.supabase.co';
        END IF;
        v_url := v_url || '/functions/v1/send-whatsapp';
        v_body := jsonb_build_object('number', NEW.whatsapp_number, 'text', v_message, 'user_id', NEW.id);
        
        BEGIN
          PERFORM net.http_post(
            url := v_url, 
            headers := '{"Content-Type": "application/json"}'::jsonb, 
            body := v_body, 
            timeout_milliseconds := 2000
          );
        EXCEPTION WHEN OTHERS THEN
          RAISE WARNING 'Error scheduling whatsapp top10: %', SQLERRM;
        END;
      END IF;

    END IF;

    RETURN NEW;
  END;
  $FUNC$ LANGUAGE plpgsql SECURITY DEFINER;

  DROP TRIGGER IF EXISTS trg_reputation_milestones ON public.profiles;
  CREATE TRIGGER trg_reputation_milestones
    AFTER UPDATE OF reputation_score ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.check_reputation_milestones();

END;
$BODY$;
