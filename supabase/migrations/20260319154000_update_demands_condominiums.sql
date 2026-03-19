-- Convert existing nome_condominio to condominiums array in metadata for demands
UPDATE public.documents
SET metadata = metadata - 'nome_condominio' || jsonb_build_object(
  'condominiums', 
  CASE 
    WHEN metadata->>'nome_condominio' IS NOT NULL AND metadata->>'nome_condominio' != '' 
    THEN jsonb_build_array(metadata->>'nome_condominio')
    ELSE '[]'::jsonb
  END
)
WHERE (metadata->>'type' = 'demanda' OR metadata->>'type' = 'procura') AND metadata ? 'nome_condominio';

-- For demands that don't have it yet, ensure condominiums array exists
UPDATE public.documents
SET metadata = metadata || jsonb_build_object('condominiums', '[]'::jsonb)
WHERE (metadata->>'type' = 'demanda' OR metadata->>'type' = 'procura') AND NOT (metadata ? 'condominiums');
