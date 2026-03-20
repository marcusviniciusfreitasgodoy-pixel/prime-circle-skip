-- Create user_actions table to track events like match_accepted
CREATE TABLE IF NOT EXISTS public.user_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_actions ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view own actions" ON public.user_actions;
CREATE POLICY "Users can view own actions" ON public.user_actions 
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can manage user_actions" ON public.user_actions;
CREATE POLICY "System can manage user_actions" ON public.user_actions 
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create a helper function to safely increment the match count for a given month and year
CREATE OR REPLACE FUNCTION public.increment_user_match_count(p_user_id UUID, p_month INT, p_year INT)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_match_count INT;
BEGIN
  -- Upsert: Inserts a new record starting at 1 if new month/year, else increments the existing
  INSERT INTO public.user_matches (user_id, month, year, match_count)
  VALUES (p_user_id, p_month, p_year, 1)
  ON CONFLICT (user_id, month, year)
  DO UPDATE SET match_count = public.user_matches.match_count + 1
  RETURNING match_count INTO v_match_count;
  
  RETURN v_match_count;
END;
$$;
