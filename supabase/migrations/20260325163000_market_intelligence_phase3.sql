-- ==============================================================================
-- Migration: Phase 3 - Market Intelligence Engine & Automation
-- Description: Creates the `process-market-intelligence` webhook trigger
-- to automatically evaluate demand/offer matches. Creates RPC to fetch
-- consolidated Market Intelligence metrics for the Dashboard.
-- ==============================================================================

-- 1. Webhook trigger for automatic processing of documents
CREATE OR REPLACE FUNCTION public.trigger_process_market_intelligence()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_url text;
  v_body jsonb;
BEGIN
  -- Prevent infinite loops: only trigger on meaningful changes
  IF TG_OP = 'UPDATE' THEN
    IF NEW.metadata->>'valor' = OLD.metadata->>'valor' AND
       NEW.metadata->>'bairro' = OLD.metadata->>'bairro' AND
       NEW.metadata->>'tipo_imovel' = OLD.metadata->>'tipo_imovel' AND
       NEW.metadata->>'nome_condominio' = OLD.metadata->>'nome_condominio' AND
       NEW.condominium_id IS NOT DISTINCT FROM OLD.condominium_id
    THEN
      RETURN NEW;
    END IF;
  END IF;

  v_url := current_setting('app.settings.supabase_url', true);
  IF v_url IS NULL OR v_url = '' THEN
    v_url := 'https://lortaowlmktdnttoykfl.supabase.co';
  END IF;
  
  v_url := v_url || '/functions/v1/process-market-intelligence';
  v_body := jsonb_build_object(
    'type', TG_OP,
    'table', TG_TABLE_NAME,
    'schema', TG_TABLE_SCHEMA,
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
    RAISE WARNING 'Error scheduling process-market-intelligence webhook pg_net request: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_document_market_intelligence ON public.documents;
CREATE TRIGGER on_document_market_intelligence
  AFTER INSERT OR UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_process_market_intelligence();


-- 2. RPC to fetch real-time Market Intelligence metrics
CREATE OR REPLACE FUNCTION public.get_market_intelligence_metrics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
BEGIN
  WITH condo_stats AS (
    SELECT 
      c.id,
      c.name,
      c.neighborhood,
      (SELECT count(*) FROM public.documents d 
       WHERE d.metadata->>'type' = 'oferta' 
       AND (d.condominium_id = c.id OR d.metadata->>'nome_condominio' ILIKE c.name)) as total_offers,
      (SELECT count(*) FROM public.documents d 
       WHERE d.metadata->>'type' = 'demanda' 
       AND (
         d.id IN (SELECT demand_id FROM public.demanda_condominio dc WHERE dc.condominium_id = c.id)
         OR (d.metadata->'condominiums')::text ILIKE '%' || c.name || '%'
       )) as total_demands,
      (
        SELECT COALESCE(AVG((d.metadata->>'valor')::numeric), 0)
        FROM public.documents d
        WHERE (d.metadata->>'type' = 'oferta' AND (d.condominium_id = c.id OR d.metadata->>'nome_condominio' ILIKE c.name))
           OR (d.metadata->>'type' = 'demanda' AND (
                 d.id IN (SELECT demand_id FROM public.demanda_condominio dc WHERE dc.condominium_id = c.id)
                 OR (d.metadata->'condominiums')::text ILIKE '%' || c.name || '%'
              ))
      ) as average_ticket
    FROM public.condominiums c
  )
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', id,
      'name', name,
      'neighborhood', neighborhood,
      'totalOffers', total_offers,
      'totalDemands', total_demands,
      'averageTicket', average_ticket,
      'demandScore', ROUND(
        CASE 
          WHEN total_demands = 0 AND total_offers > 0 THEN 0.10
          WHEN total_demands = 0 AND total_offers = 0 THEN 0.00
          WHEN total_offers = 0 AND total_demands > 0 THEN 0.99
          ELSE LEAST(1.0, (total_demands::numeric / (total_offers + 1)) * 0.5)
        END, 2)
    )
  ), '[]'::jsonb) INTO v_result
  FROM condo_stats;

  RETURN v_result;
END;
$$;
