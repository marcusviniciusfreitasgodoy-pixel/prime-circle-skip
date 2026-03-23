-- 1. A extensão pg_net precisa estar ativa para que as chamadas HTTP (como os triggers) funcionem
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Configuração das variáveis de ambiente no banco (necessário para o pg_cron e triggers)
DO $$
BEGIN
  -- Definimos a URL base do projeto no banco de dados. 
  -- NOTA: O app.settings.service_role_key DEVE ser definido manualmente no SQL Editor pelo administrador do banco.
  EXECUTE 'ALTER DATABASE postgres SET "app.settings.supabase_url" TO ''https://lortaowlmktdnttoykfl.supabase.co''';
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Could not set app.settings.supabase_url: %', SQLERRM;
END $$;

-- 5. O trigger de reputação (+2 pontos)
-- Primeiro, adicionamos a coluna para rastrear quem atualizou por último
ALTER TABLE public.partnerships ADD COLUMN IF NOT EXISTS last_updated_by UUID REFERENCES public.profiles(id);

CREATE OR REPLACE FUNCTION public.handle_partnership_advance_reputation()
RETURNS trigger AS $FUNC$
BEGIN
  -- Se o status avançou e ainda não foi confirmado pelo parceiro (Ação 1 do Quick Update)
  IF OLD.status IS DISTINCT FROM NEW.status 
     AND NEW.status IN ('contact', 'visit', 'proposal', 'aguardando_vgv', 'closed')
     AND NEW.confirmed_by_partner = false 
     AND NEW.last_updated_by IS NOT NULL THEN
     
     UPDATE public.profiles 
     SET reputation_score = reputation_score + 2
     WHERE id = NEW.last_updated_by;
     
  END IF;
  RETURN NEW;
END;
$FUNC$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_partnership_advanced ON public.partnerships;
CREATE TRIGGER on_partnership_advanced
  AFTER UPDATE OF status ON public.partnerships
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_partnership_advance_reputation();

-- 6. A notificação de parabéns por novo nível de desconto
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS discount_tier TEXT;

CREATE OR REPLACE FUNCTION public.trigger_discount_tier_whatsapp()
RETURNS trigger AS $FUNC$
DECLARE
  v_url text;
  v_body jsonb;
BEGIN
  IF OLD.discount_tier IS DISTINCT FROM NEW.discount_tier AND NEW.discount_tier IS NOT NULL THEN
    IF NEW.whatsapp_number IS NOT NULL AND NEW.whatsapp_number != '' THEN
      v_url := current_setting('app.settings.supabase_url', true);
      IF v_url IS NULL OR v_url = '' THEN
        v_url := 'https://lortaowlmktdnttoykfl.supabase.co';
      END IF;
      v_url := v_url || '/functions/v1/send-whatsapp';
      
      v_body := jsonb_build_object(
        'number', NEW.whatsapp_number,
        'text', 'Parabéns ' || COALESCE(NEW.full_name, 'Corretor') || '! 🎉 Você alcançou um novo nível de desconto na Prime Circle: ' || NEW.discount_tier || '. Aproveite seus benefícios!',
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
        RAISE WARNING 'Error scheduling discount tier whatsapp: %', SQLERRM;
      END;
    END IF;
  END IF;
  RETURN NEW;
END;
$FUNC$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_discount_tier_changed ON public.profiles;
CREATE TRIGGER on_discount_tier_changed
  AFTER UPDATE OF discount_tier ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_discount_tier_whatsapp();

