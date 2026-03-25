-- Backfill existing property and demand records to include banheiros and vagas fields with default values
UPDATE public.documents
SET metadata = metadata || jsonb_build_object(
  'banheiros', COALESCE(metadata->>'banheiros', '1'),
  'vagas', COALESCE(metadata->>'vagas', '0')
)
WHERE metadata->>'type' IN ('oferta', 'demanda');
