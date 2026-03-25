-- Migration for Growth Dashboard and Newsletter features

-- 1. Create newsletters table
CREATE TABLE IF NOT EXISTS public.newsletters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  attachment_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent')),
  scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.newsletters ENABLE ROW LEVEL SECURITY;

-- Policies for newsletters
DROP POLICY IF EXISTS "Admins can manage newsletters" ON public.newsletters;
CREATE POLICY "Admins can manage newsletters" ON public.newsletters
  FOR ALL TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "Anyone can read sent newsletters" ON public.newsletters;
CREATE POLICY "Anyone can read sent newsletters" ON public.newsletters
  FOR SELECT TO authenticated USING (status = 'sent');


-- 2. Create RPC for growth metrics
CREATE OR REPLACE FUNCTION public.get_growth_metrics()
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_total_clicks INT;
    v_total_signups INT;
    v_total_active INT;
    v_top_referrers JSONB;
BEGIN
    IF NOT is_admin() THEN RETURN '{"error": "unauthorized"}'::jsonb; END IF;

    SELECT count(*) INTO v_total_clicks FROM public.referral_clicks;
    SELECT count(*) INTO v_total_signups FROM public.profiles WHERE referred_by_id IS NOT NULL;
    SELECT count(*) INTO v_total_active FROM public.profiles WHERE referred_by_id IS NOT NULL AND status = 'active';

    SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb) INTO v_top_referrers
    FROM (
        SELECT
            p.id, p.full_name, p.avatar_url,
            count(r.id) as signups,
            sum(CASE WHEN r.status = 'active' THEN 1 ELSE 0 END) as active_signups
        FROM public.profiles p
        JOIN public.profiles r ON r.referred_by_id = p.id
        GROUP BY p.id, p.full_name, p.avatar_url
        ORDER BY active_signups DESC, signups DESC
        LIMIT 10
    ) t;

    RETURN jsonb_build_object(
        'total_clicks', COALESCE(v_total_clicks, 0),
        'total_signups', COALESCE(v_total_signups, 0),
        'total_active', COALESCE(v_total_active, 0),
        'conversion_rate', CASE WHEN COALESCE(v_total_clicks, 0) > 0 THEN round((COALESCE(v_total_active, 0)::numeric / v_total_clicks) * 100, 1) ELSE 0 END,
        'top_referrers', COALESCE(v_top_referrers, '[]'::jsonb)
    );
END;
$$;


-- 3. Configure Storage Bucket for newsletters
INSERT INTO storage.buckets (id, name, public)
VALUES ('newsletters', 'newsletters', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access newsletters bucket" ON storage.objects;
CREATE POLICY "Public Access newsletters bucket" ON storage.objects 
  FOR SELECT USING (bucket_id = 'newsletters');

DROP POLICY IF EXISTS "Admin Manage newsletters bucket" ON storage.objects;
CREATE POLICY "Admin Manage newsletters bucket" ON storage.objects 
  FOR ALL TO authenticated USING (bucket_id = 'newsletters' AND is_admin());
