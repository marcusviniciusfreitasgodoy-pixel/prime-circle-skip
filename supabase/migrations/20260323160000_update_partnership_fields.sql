-- Adiciona campos necessários para o novo fluxo de quick actions
ALTER TABLE public.partnerships ADD COLUMN IF NOT EXISTS confirmed_by_partner BOOLEAN DEFAULT false;
ALTER TABLE public.partnerships ADD COLUMN IF NOT EXISTS vgv_confirmado_a NUMERIC;
ALTER TABLE public.partnerships ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Cria index opcional para melhorar performance em buscas de status
CREATE INDEX IF NOT EXISTS idx_partnerships_status ON public.partnerships(status);
