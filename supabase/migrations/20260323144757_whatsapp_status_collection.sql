-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- PASSO 1: Campos novos em partnerships
ALTER TABLE public.partnerships ADD COLUMN IF NOT EXISTS last_status_check_at TIMESTAMPTZ;
ALTER TABLE public.partnerships ADD COLUMN IF NOT EXISTS status_check_count INTEGER DEFAULT 0;
ALTER TABLE public.partnerships ADD COLUMN IF NOT EXISTS status_check_failed BOOLEAN DEFAULT false;
ALTER TABLE public.partnerships ADD COLUMN IF NOT EXISTS cancelado_by UUID REFERENCES public.profiles(id);
ALTER TABLE public.partnerships ADD COLUMN IF NOT EXISTS cancelamento_motivo TEXT;
ALTER TABLE public.partnerships ADD COLUMN IF NOT EXISTS admin_flagged BOOLEAN DEFAULT false;

-- PASSO 2: Tabela de tokens de ação rápida
CREATE TABLE IF NOT EXISTS public.quick_action_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID REFERENCES public.partnerships(id) ON DELETE CASCADE,
  corretor_id UUID REFERENCES public.profiles(id),
  action INTEGER NOT NULL,
  status_alvo TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  used BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ DEFAULT now() + interval '5 days',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_qat_token ON public.quick_action_tokens(token);
CREATE INDEX IF NOT EXISTS idx_qat_partnership ON public.quick_action_tokens(partnership_id);

ALTER TABLE public.quick_action_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_only" ON public.quick_action_tokens;
CREATE POLICY "service_role_only" ON public.quick_action_tokens USING (false);

-- PASSO 3: pg_cron — detecção principal (9h e 21h todos os dias)
DO $$
BEGIN
  PERFORM cron.unschedule('send-status-checks');
  PERFORM cron.schedule(
    'send-status-checks',
    '0 9,21 * * *',
    $CRON$
    SELECT net.http_post(
      url := 'https://lortaowlmktdnttoykfl.supabase.co/functions/v1/send-status-check',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true),
        'Content-Type', 'application/json'
      ),
      body := (
        SELECT jsonb_build_object('partnerships', COALESCE(json_agg(row_to_json(p)), '[]'::json))
        FROM public.partnerships p
        WHERE p.status NOT IN ('closed', 'cancelled', 'rejeitado')
          AND p.status_check_failed = false
          AND (
            (p.status = 'match'     AND p.updated_at < now() - interval '3 days')  OR
            (p.status = 'contact'   AND p.updated_at < now() - interval '5 days')  OR
            (p.status = 'visit'     AND p.updated_at < now() - interval '7 days')  OR
            (p.status = 'proposal'  AND p.updated_at < now() - interval '10 days')
          )
          AND (
            p.last_status_check_at IS NULL OR
            p.last_status_check_at < now() - interval '24 hours'
          )
      )
    );
    $CRON$
  );
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Could not schedule cron job send-status-checks: %', SQLERRM;
END $$;

-- PASSO 4: pg_cron — escalada (a cada 12h)
DO $$
BEGIN
  PERFORM cron.unschedule('escalate-no-response');
  PERFORM cron.schedule(
    'escalate-no-response',
    '30 */12 * * *',
    $CRON$
    UPDATE public.partnerships
    SET status_check_failed = true, admin_flagged = true
    WHERE last_status_check_at < now() - interval '48 hours'
      AND status NOT IN ('closed','cancelled','rejeitado')
      AND status_check_failed = false
      AND NOT EXISTS (
        SELECT 1 FROM public.quick_action_tokens qt
        WHERE qt.partnership_id = public.partnerships.id
          AND qt.used = true
          AND qt.created_at > public.partnerships.last_status_check_at
      );
    $CRON$
  );
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Could not schedule cron job escalate-no-response: %', SQLERRM;
END $$;

-- Função para o painel admin (Métricas Coleta WhatsApp)
CREATE OR REPLACE FUNCTION public.get_whatsapp_collection_metrics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_checks_enviados INT;
  v_tokens_criados INT;
  v_tokens_usados INT;
  v_taxa_resposta NUMERIC;
BEGIN
  IF NOT is_admin() THEN
    RETURN jsonb_build_object('error', 'Unauthorized');
  END IF;

  SELECT COUNT(*) INTO v_checks_enviados 
  FROM public.partnerships 
  WHERE status_check_count > 0 AND last_status_check_at > now() - interval '30 days';

  SELECT COUNT(*), SUM(CASE WHEN used THEN 1 ELSE 0 END)
  INTO v_tokens_criados, v_tokens_usados
  FROM public.quick_action_tokens
  WHERE created_at > now() - interval '30 days';

  IF v_tokens_criados > 0 THEN
    v_taxa_resposta := ROUND(100.0 * v_tokens_usados / v_tokens_criados, 1);
  ELSE
    v_taxa_resposta := 0;
  END IF;

  RETURN jsonb_build_object(
    'checks_enviados', v_checks_enviados,
    'tokens_criados', v_tokens_criados,
    'tokens_usados', COALESCE(v_tokens_usados, 0),
    'taxa_resposta', v_taxa_resposta
  );
END;
$$;
