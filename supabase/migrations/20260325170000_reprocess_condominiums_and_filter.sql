-- 1. Reprocess existing documents to link them to condominiums
DO $$
DECLARE
  rec RECORD;
  condo_id UUID;
  condo_name TEXT;
  c_name TEXT;
BEGIN
  -- Process Ofertas
  FOR rec IN SELECT id, metadata FROM public.documents WHERE metadata->>'type' = 'oferta' AND metadata->>'nome_condominio' IS NOT NULL AND metadata->>'nome_condominio' != '' LOOP
    condo_name := rec.metadata->>'nome_condominio';
    
    -- Try to find exact or ilike match
    SELECT id INTO condo_id FROM public.condominiums WHERE name ILIKE condo_name LIMIT 1;
    
    IF condo_id IS NULL THEN
      -- Try to find partial match
      SELECT id INTO condo_id FROM public.condominiums WHERE condo_name ILIKE '%' || name || '%' LIMIT 1;
    END IF;

    IF condo_id IS NULL THEN
      -- Insert new condominium
      BEGIN
        INSERT INTO public.condominiums (name, neighborhood, city, state)
        VALUES (
          condo_name, 
          COALESCE(rec.metadata->>'bairro', rec.metadata->>'neighborhood', 'Não informado'),
          COALESCE(rec.metadata->>'cidade', rec.metadata->>'city', 'Rio de Janeiro'),
          COALESCE(rec.metadata->>'estado', rec.metadata->>'state', 'RJ')
        )
        ON CONFLICT (name, neighborhood) DO NOTHING
        RETURNING id INTO condo_id;
        
        IF condo_id IS NULL THEN
          SELECT id INTO condo_id FROM public.condominiums WHERE name = condo_name LIMIT 1;
        END IF;
      EXCEPTION WHEN OTHERS THEN
        -- Ignore
      END;
    END IF;
    
    IF condo_id IS NOT NULL THEN
      -- Update document
      UPDATE public.documents SET condominium_id = condo_id WHERE id = rec.id;
    END IF;
  END LOOP;

  -- Process Demandas
  FOR rec IN SELECT id, metadata FROM public.documents WHERE metadata->>'type' = 'demanda' LOOP
    -- check if condominiums array exists in metadata
    IF rec.metadata ? 'condominiums' AND jsonb_typeof(rec.metadata->'condominiums') = 'array' THEN
      FOR c_name IN SELECT jsonb_array_elements_text(rec.metadata->'condominiums') LOOP
        IF c_name IS NOT NULL AND c_name != '' THEN
          SELECT id INTO condo_id FROM public.condominiums WHERE name ILIKE c_name LIMIT 1;
          
          IF condo_id IS NULL THEN
            SELECT id INTO condo_id FROM public.condominiums WHERE c_name ILIKE '%' || name || '%' LIMIT 1;
          END IF;

          IF condo_id IS NULL THEN
            BEGIN
              INSERT INTO public.condominiums (name, neighborhood, city, state)
              VALUES (
                c_name, 
                COALESCE(rec.metadata->>'bairro', rec.metadata->>'region', 'Não informado'),
                'Rio de Janeiro',
                'RJ'
              )
              ON CONFLICT (name, neighborhood) DO NOTHING
              RETURNING id INTO condo_id;
              
              IF condo_id IS NULL THEN
                SELECT id INTO condo_id FROM public.condominiums WHERE name = c_name LIMIT 1;
              END IF;
            EXCEPTION WHEN OTHERS THEN
              -- Ignore
            END;
          END IF;

          IF condo_id IS NOT NULL THEN
            BEGIN
              INSERT INTO public.demanda_condominio (demand_id, condominium_id, score_compatibilidade, vinculo_tipo)
              VALUES (rec.id, condo_id, 1.0, 'direto')
              ON CONFLICT (demand_id, condominium_id) DO NOTHING;
            EXCEPTION WHEN OTHERS THEN
              -- Ignore
            END;
          END IF;
        END IF;
      END LOOP;
    END IF;
  END LOOP;
END $$;

-- 2. Update the get_market_intelligence_metrics RPC to hide 0-0 condos
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
       AND (d.condominium_id = c.id OR d.metadata->>'nome_condominio' ILIKE '%' || c.name || '%')) as total_offers,
      (SELECT count(*) FROM public.documents d 
       WHERE d.metadata->>'type' = 'demanda' 
       AND (
         d.id IN (SELECT demand_id FROM public.demanda_condominio dc WHERE dc.condominium_id = c.id)
         OR (d.metadata->'condominiums')::text ILIKE '%' || c.name || '%'
       )) as total_demands,
      (
        SELECT COALESCE(AVG((d.metadata->>'valor')::numeric), 0)
        FROM public.documents d
        WHERE (d.metadata->>'type' = 'oferta' AND (d.condominium_id = c.id OR d.metadata->>'nome_condominio' ILIKE '%' || c.name || '%'))
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
    ORDER BY total_demands DESC, total_offers DESC
  ), '[]'::jsonb) INTO v_result
  FROM condo_stats
  WHERE total_offers > 0 OR total_demands > 0;

  RETURN v_result;
END;
$$;
