CREATE TABLE IF NOT EXISTS public.broker_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id UUID CONSTRAINT broker_reviews_reviewer_id_fkey REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reviewed_id UUID CONSTRAINT broker_reviews_reviewed_id_fkey REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.broker_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read reviews" ON public.broker_reviews;
CREATE POLICY "Anyone can read reviews" ON public.broker_reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert reviews" ON public.broker_reviews;
CREATE POLICY "Authenticated users can insert reviews" ON public.broker_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = reviewer_id);
