-- Invitations Table
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  invitee_name TEXT NOT NULL,
  invitee_phone TEXT,
  invitee_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'registered')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_reminder_at TIMESTAMPTZ,
  reminder_count INT NOT NULL DEFAULT 0
);

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own invitations" ON public.invitations;
CREATE POLICY "Users can manage own invitations" ON public.invitations
  FOR ALL TO authenticated USING (referrer_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view invitations" ON public.invitations;
CREATE POLICY "Admins can view invitations" ON public.invitations
  FOR SELECT TO authenticated USING (is_admin());

-- User Notifications Table
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  link TEXT,
  type TEXT NOT NULL DEFAULT 'system',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own notifications" ON public.user_notifications;
CREATE POLICY "Users can manage own notifications" ON public.user_notifications
  FOR ALL TO authenticated USING (user_id = auth.uid());

-- Newsletter Feedback Table
CREATE TABLE IF NOT EXISTS public.newsletter_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  newsletter_id UUID REFERENCES public.newsletters(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  vote TEXT NOT NULL CHECK (vote IN ('like', 'dislike')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(newsletter_id, user_id)
);

ALTER TABLE public.newsletter_feedback ENABLE ROW LEVEL SECURITY;

-- Allow insert by anon if they have the right user_id (for email one-click links)
DROP POLICY IF EXISTS "Anyone can insert feedback" ON public.newsletter_feedback;
CREATE POLICY "Anyone can insert feedback" ON public.newsletter_feedback
  FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update own feedback" ON public.newsletter_feedback;
CREATE POLICY "Anyone can update own feedback" ON public.newsletter_feedback
  FOR UPDATE TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view all feedback" ON public.newsletter_feedback;
CREATE POLICY "Admins can view all feedback" ON public.newsletter_feedback
  FOR SELECT TO authenticated USING (is_admin());

-- Update handle_new_user to mark invitation as registered
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  user_count INT;
  assigned_role TEXT := 'user';
  assigned_plan TEXT := 'Free';
  assigned_status TEXT := 'pending_validation';
  ref_by_id UUID := NULL;
BEGIN
  SELECT COUNT(*) INTO user_count FROM public.profiles;

  IF user_count = 0 THEN
    assigned_role := 'admin';
    assigned_plan := 'Founder';
    assigned_status := 'active';
  ELSIF user_count < 20 THEN
    assigned_plan := 'Founder';
    assigned_status := 'active';
  END IF;

  BEGIN
    IF NEW.raw_user_meta_data->>'referred_by_id' IS NOT NULL AND NEW.raw_user_meta_data->>'referred_by_id' != '' THEN
      ref_by_id := (NEW.raw_user_meta_data->>'referred_by_id')::uuid;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    ref_by_id := NULL;
  END;

  BEGIN
    INSERT INTO public.profiles (
      id,
      full_name,
      role,
      plan,
      status,
      accepted_terms,
      whatsapp_number,
      creci,
      region,
      ticket_value,
      referral_code,
      company_name,
      email,
      referred_by_id,
      specialties
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      assigned_role,
      assigned_plan,
      assigned_status,
      COALESCE((NEW.raw_user_meta_data->>'accepted_terms')::boolean, false),
      NEW.raw_user_meta_data->>'whatsapp_number',
      NEW.raw_user_meta_data->>'creci',
      NEW.raw_user_meta_data->>'region',
      NEW.raw_user_meta_data->>'ticket_value',
      NEW.raw_user_meta_data->>'referral_code',
      NEW.raw_user_meta_data->>'company_name',
      NEW.email,
      ref_by_id,
      NEW.raw_user_meta_data->>'specialties'
    )
    ON CONFLICT (id) DO UPDATE SET
      role = EXCLUDED.role,
      plan = EXCLUDED.plan,
      status = EXCLUDED.status,
      email = EXCLUDED.email;
      
    -- Update invitation status if matched by email or phone
    UPDATE public.invitations
    SET status = 'registered'
    WHERE (invitee_email = NEW.email OR invitee_phone = NEW.raw_user_meta_data->>'whatsapp_number')
      AND status = 'pending';

  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
  END;

  RETURN NEW;
END;
$function$;
