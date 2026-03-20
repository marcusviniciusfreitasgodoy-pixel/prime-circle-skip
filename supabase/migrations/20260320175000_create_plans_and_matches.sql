-- Migration for plans, user_plans, and user_matches

CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  price_base NUMERIC(10, 2) NOT NULL DEFAULT 0,
  description TEXT,
  features_json JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_founder BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  match_count INT NOT NULL DEFAULT 0,
  month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure unique constraint on user_matches for month and year
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'user_matches_user_id_month_year_key'
  ) THEN
    ALTER TABLE public.user_matches ADD CONSTRAINT user_matches_user_id_month_year_key UNIQUE (user_id, month, year);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_matches ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Anyone can select plans" ON public.plans;
CREATE POLICY "Anyone can select plans" ON public.plans FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view own plans" ON public.user_plans;
CREATE POLICY "Users can view own plans" ON public.user_plans FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can manage user_plans" ON public.user_plans;
CREATE POLICY "System can manage user_plans" ON public.user_plans FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own matches" ON public.user_matches;
CREATE POLICY "Users can view own matches" ON public.user_matches FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can manage user_matches" ON public.user_matches;
CREATE POLICY "System can manage user_matches" ON public.user_matches FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Seed Plans
INSERT INTO public.plans (name, price_base, description, features_json) VALUES
  ('FREE', 0, 'Para iniciantes na rede.', '[{"text": "3 Demandas/mês", "included": true}, {"text": "3 Imóveis", "included": true}, {"text": "10 Conexões/mês", "included": true}, {"text": "Suporte", "included": false}, {"text": "Badge Founder", "included": false}]'::jsonb),
  ('PROFESSIONAL', 97, 'Para corretores de alta performance.', '[{"text": "Demandas Ilimitadas", "included": true}, {"text": "Imóveis Ilimitados", "included": true}, {"text": "Conexões Ilimitadas", "included": true}, {"text": "Suporte em até 4h", "included": true}, {"text": "Desconto por matches", "included": true}]'::jsonb),
  ('FOUNDER', 47, 'Condição especial permanente.', '[{"text": "Demandas Ilimitadas", "included": true}, {"text": "Imóveis Ilimitados", "included": true}, {"text": "Conexões Ilimitadas", "included": true}, {"text": "Suporte em até 2h", "included": true}, {"text": "Badge Founder Exclusivo", "included": true}]'::jsonb)
ON CONFLICT (name) DO UPDATE SET
  price_base = EXCLUDED.price_base,
  description = EXCLUDED.description,
  features_json = EXCLUDED.features_json;
