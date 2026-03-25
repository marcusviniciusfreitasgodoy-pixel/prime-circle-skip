-- ==============================================================================
-- Migration: Phase 2 - Market Intelligence Data Structure
-- Description: Creates the `condominiums` table and the bridge table 
-- `demanda_condominio` to link demands to condominiums for predictive matching.
-- Ensures existing structure (`documents`) accommodates the new foreign key.
-- ==============================================================================

-- 1. Create Condominiums Table
CREATE TABLE IF NOT EXISTS public.condominiums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  city TEXT DEFAULT 'Rio de Janeiro',
  state TEXT DEFAULT 'RJ',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure uniqueness to prevent duplicate seeds
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'condominiums_name_neighborhood_key'
  ) THEN
    ALTER TABLE public.condominiums ADD CONSTRAINT condominiums_name_neighborhood_key UNIQUE (name, neighborhood);
  END IF;
END $$;

-- 2. Modify Documents Table to support Condominium Reference
-- This allows "Ofertas" to link directly to a specific condominium
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS condominium_id UUID REFERENCES public.condominiums(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_documents_condominium_id ON public.documents(condominium_id);

-- 3. Create Bridge Table for Demands and Condominiums
CREATE TABLE IF NOT EXISTS public.demanda_condominio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demand_id BIGINT NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  condominium_id UUID NOT NULL REFERENCES public.condominiums(id) ON DELETE CASCADE,
  score_compatibilidade DECIMAL(3,2) NOT NULL DEFAULT 0,
  vinculo_tipo TEXT NOT NULL DEFAULT 'inferido',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_score_range CHECK (score_compatibilidade >= 0 AND score_compatibilidade <= 1),
  CONSTRAINT check_vinculo_tipo CHECK (vinculo_tipo IN ('direto', 'inferido')),
  -- A demand should only be linked to the same condominium once
  CONSTRAINT unique_demand_condominium UNIQUE (demand_id, condominium_id)
);

CREATE INDEX IF NOT EXISTS idx_demanda_condominio_demand_id ON public.demanda_condominio(demand_id);
CREATE INDEX IF NOT EXISTS idx_demanda_condominio_condominium_id ON public.demanda_condominio(condominium_id);

-- 4. Set up Row Level Security (RLS)
ALTER TABLE public.condominiums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demanda_condominio ENABLE ROW LEVEL SECURITY;

-- Condominiums Policies
DROP POLICY IF EXISTS "Anyone can read condominiums" ON public.condominiums;
CREATE POLICY "Anyone can read condominiums" ON public.condominiums
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage condominiums" ON public.condominiums;
CREATE POLICY "Admins can manage condominiums" ON public.condominiums
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Demanda Condominio Policies
DROP POLICY IF EXISTS "Anyone can read demanda_condominio" ON public.demanda_condominio;
CREATE POLICY "Anyone can read demanda_condominio" ON public.demanda_condominio
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can create demanda_condominio" ON public.demanda_condominio;
CREATE POLICY "Authenticated users can create demanda_condominio" ON public.demanda_condominio
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update own demanda_condominio" ON public.demanda_condominio;
CREATE POLICY "Authenticated users can update own demanda_condominio" ON public.demanda_condominio
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM documents WHERE documents.id = demand_id AND (documents.metadata->>'user_id')::uuid = auth.uid())
  );

-- 5. Seed Initial Data
INSERT INTO public.condominiums (name, neighborhood, city, state) VALUES
  ('Solar das Acácias', 'Barra da Tijuca', 'Rio de Janeiro', 'RJ'),
  ('Mundo Novo', 'Barra da Tijuca', 'Rio de Janeiro', 'RJ'),
  ('Península', 'Barra da Tijuca', 'Rio de Janeiro', 'RJ'),
  ('Riserva Uno', 'Barra da Tijuca', 'Rio de Janeiro', 'RJ'),
  ('Golden Green', 'Barra da Tijuca', 'Rio de Janeiro', 'RJ')
ON CONFLICT (name, neighborhood) DO NOTHING;
