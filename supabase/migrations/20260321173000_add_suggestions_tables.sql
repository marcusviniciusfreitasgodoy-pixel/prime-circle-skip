ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suggestion_points INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT,
    status TEXT NOT NULL DEFAULT 'Em Análise',
    complexity TEXT,
    points INTEGER DEFAULT 0,
    votes INTEGER DEFAULT 1,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read suggestions" ON public.suggestions;
CREATE POLICY "Anyone can read suggestions" ON public.suggestions
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can insert suggestions" ON public.suggestions;
CREATE POLICY "Users can insert suggestions" ON public.suggestions
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Admins can update suggestions" ON public.suggestions;
CREATE POLICY "Admins can update suggestions" ON public.suggestions
    FOR UPDATE TO authenticated USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
