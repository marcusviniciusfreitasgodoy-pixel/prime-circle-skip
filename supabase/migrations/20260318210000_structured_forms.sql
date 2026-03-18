-- Update existing records to map old fields to new fields to prevent matching engine breakage
UPDATE public.documents
SET metadata = metadata || jsonb_build_object(
  'tipo_imovel', COALESCE(metadata->>'property_type', metadata->>'profile', 'Apartamento'),
  'endereco', COALESCE(metadata->>'location', metadata->>'region', ''),
  'bairro', COALESCE(metadata->>'location', metadata->>'region', ''),
  'valor', COALESCE((NULLIF(REGEXP_REPLACE(COALESCE(metadata->>'price', metadata->>'budget', ''), '[^0-9]', '', 'g'), ''))::numeric, 0),
  'quartos', '1',
  'suites', '1',
  'tamanho_imovel', 0,
  'tamanho_terreno', 0
)
WHERE metadata->>'type' IN ('oferta', 'demanda');
