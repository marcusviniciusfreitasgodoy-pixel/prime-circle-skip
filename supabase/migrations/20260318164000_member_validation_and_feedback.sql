-- Add validation columns to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending_validation' CHECK (status IN ('pending_validation', 'active', 'rejected')),
  ADD COLUMN IF NOT EXISTS validated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS validation_date TIMESTAMPTZ;

-- Existing users should be active to not disrupt current flow
UPDATE public.profiles SET status = 'active' WHERE status = 'pending_validation';

-- Create match_feedback table
CREATE TABLE IF NOT EXISTS public.match_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_id BIGINT NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('perfect', 'not_suitable')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on match_feedback
ALTER TABLE public.match_feedback ENABLE ROW LEVEL SECURITY;

-- Policies for match_feedback
CREATE POLICY "Users can insert own feedback" ON public.match_feedback 
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select own feedback" ON public.match_feedback 
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Policy to allow elite brokers and admins to update other profiles (for validation)
CREATE POLICY "Admins and Elite can update other profiles" ON public.profiles 
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND (p.role = 'admin' OR p.reputation_score > 80)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND (p.role = 'admin' OR p.reputation_score > 80)
    )
  );
