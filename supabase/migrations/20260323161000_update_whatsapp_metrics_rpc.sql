-- Adiciona updated_at para rastrear quando os tokens foram usados
ALTER TABLE public.quick_action_tokens ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION update_quick_action_tokens_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_quick_action_tokens_updated_at_trigger ON public.quick_action_tokens;
CREATE TRIGGER update_quick_action_tokens_updated_at_trigger
BEFORE UPDATE ON public.quick_action_tokens
FOR EACH ROW
EXECUTE FUNCTION update_quick_action_tokens_updated_at();

-- Atualiza a função para retornar métricas completas, fila e histórico
DROP FUNCTION IF EXISTS public.get_whatsapp_collection_metrics();

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
  v_fila_count INT;
  v_action_dist jsonb;
  v_fila jsonb;
  v_historico jsonb;
BEGIN
  IF NOT is_admin() THEN
    RETURN jsonb_build_object('error', 'Unauthorized');
  END IF;

  -- 1. Métricas Base
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

  -- 2. Fila Count e Action Dist
  SELECT COUNT(*) INTO v_fila_count
  FROM public.partnerships
  WHERE (status_check_failed = true OR admin_flagged = true)
    AND status NOT IN ('fechado', 'cancelado', 'closed', 'cancelled');

  SELECT jsonb_build_object(
    'action_1', COALESCE(SUM(CASE WHEN action = 1 THEN 1 ELSE 0 END), 0),
    'action_2', COALESCE(SUM(CASE WHEN action = 2 THEN 1 ELSE 0 END), 0),
    'action_3', COALESCE(SUM(CASE WHEN action = 3 THEN 1 ELSE 0 END), 0),
    'total', COALESCE(SUM(CASE WHEN used THEN 1 ELSE 0 END), 0)
  ) INTO v_action_dist
  FROM public.quick_action_tokens
  WHERE used = true AND created_at > now() - interval '30 days';

  -- 3. Fila de atenção
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', p.id,
      'status', p.status,
      'last_status_check_at', p.last_status_check_at,
      'status_check_failed', p.status_check_failed,
      'admin_flagged', p.admin_flagged,
      'broker_demand_name', pd.full_name,
      'broker_property_name', pp.full_name,
      'broker_demand_id', p.broker_demand_id,
      'broker_property_id', p.broker_property_id,
      'property_id', p.property_id,
      'status_check_count', p.status_check_count
    ) ORDER BY p.last_status_check_at ASC
  ), '[]'::jsonb) INTO v_fila
  FROM public.partnerships p
  LEFT JOIN public.profiles pd ON p.broker_demand_id = pd.id
  LEFT JOIN public.profiles pp ON p.broker_property_id = pp.id
  WHERE (p.status_check_failed = true OR p.admin_flagged = true)
    AND p.status NOT IN ('fechado', 'cancelado', 'closed', 'cancelled');

  -- 4. Histórico
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', qt.id,
      'updated_at', COALESCE(qt.updated_at, qt.created_at),
      'action', qt.action,
      'status_alvo', qt.status_alvo,
      'corretor_nome', pf.full_name,
      'partnership_status', p.status
    ) ORDER BY COALESCE(qt.updated_at, qt.created_at) DESC
  ), '[]'::jsonb) INTO v_historico
  FROM (
    SELECT * FROM public.quick_action_tokens WHERE used = true ORDER BY COALESCE(updated_at, created_at) DESC LIMIT 50
  ) qt
  JOIN public.profiles pf ON qt.corretor_id = pf.id
  JOIN public.partnerships p ON qt.partnership_id = p.id;

  -- 5. Retorno Consolidado
  RETURN jsonb_build_object(
    'metrics', jsonb_build_object(
      'checks_enviados', v_checks_enviados,
      'tokens_criados', v_tokens_criados,
      'tokens_usados', COALESCE(v_tokens_usados, 0),
      'taxa_resposta', v_taxa_resposta,
      'fila_count', v_fila_count,
      'action_dist', v_action_dist
    ),
    'fila', v_fila,
    'historico', v_historico
  );
END;
$$;
