CREATE TABLE public.partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demand_id BIGINT REFERENCES public.documents(id) ON DELETE CASCADE,
  property_id BIGINT,
  CONSTRAINT partnerships_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.documents(id) ON DELETE CASCADE,
  broker_demand_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  broker_property_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'match' CHECK (status IN ('match', 'contact', 'visit', 'proposal', 'closed', 'cancelled')),
  last_interaction_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  update_token UUID NOT NULL DEFAULT gen_random_uuid()
);

ALTER TABLE public.partnerships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own partnerships"
ON public.partnerships FOR SELECT TO authenticated
USING (auth.uid() = broker_demand_id OR auth.uid() = broker_property_id);

CREATE POLICY "Users can update their own partnerships"
ON public.partnerships FOR UPDATE TO authenticated
USING (auth.uid() = broker_demand_id OR auth.uid() = broker_property_id)
WITH CHECK (auth.uid() = broker_demand_id OR auth.uid() = broker_property_id);

CREATE POLICY "Users can insert their own partnerships"
ON public.partnerships FOR INSERT TO authenticated
WITH CHECK (auth.uid() = broker_demand_id OR auth.uid() = broker_property_id);

CREATE OR REPLACE FUNCTION public.quick_update_partnership(p_token UUID, p_status TEXT, p_broker_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_partnership public.partnerships%ROWTYPE;
  v_other_broker_id UUID;
  v_broker_name TEXT;
  v_other_broker_phone TEXT;
  v_property_title TEXT;
  v_url TEXT;
  v_body JSONB;
BEGIN
  SELECT * INTO v_partnership FROM public.partnerships WHERE update_token = p_token;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  IF p_status NOT IN ('match', 'contact', 'visit', 'proposal', 'closed', 'cancelled') THEN
    RETURN FALSE;
  END IF;

  UPDATE public.partnerships 
  SET status = p_status, last_interaction_at = NOW() 
  WHERE id = v_partnership.id;

  UPDATE public.profiles
  SET reputation_score = reputation_score + 5
  WHERE id = p_broker_id;

  IF p_broker_id = v_partnership.broker_demand_id THEN
    v_other_broker_id := v_partnership.broker_property_id;
  ELSE
    v_other_broker_id := v_partnership.broker_demand_id;
  END IF;

  SELECT full_name INTO v_broker_name FROM public.profiles WHERE id = p_broker_id;
  SELECT whatsapp_number INTO v_other_broker_phone FROM public.profiles WHERE id = v_other_broker_id;
  SELECT COALESCE(metadata->>'title', metadata->>'tipo_imovel', 'Imóvel') INTO v_property_title FROM public.documents WHERE id = v_partnership.property_id;

  IF p_status IN ('visit', 'proposal', 'closed') AND v_other_broker_phone IS NOT NULL THEN
    v_url := current_setting('app.settings.supabase_url', true);
    IF v_url IS NULL OR v_url = '' THEN
      v_url := 'https://lortaowlmktdnttoykfl.supabase.co';
    END IF;
    v_url := v_url || '/functions/v1/send-whatsapp';

    v_body := jsonb_build_object(
      'number', v_other_broker_phone,
      'text', 'Broker ' || COALESCE(v_broker_name, 'Parceiro') || ' informou que o status da negociação do imóvel ' || COALESCE(v_property_title, '') || ' mudou para: ' || p_status || '. Você confirma? Acesse o painel para validar: https://www.primecircle.app.br/dashboard',
      'user_id', v_other_broker_id
    );

    BEGIN
      PERFORM net.http_post(
          url := v_url,
          headers := '{"Content-Type": "application/json"}'::jsonb,
          body := v_body,
          timeout_milliseconds := 2000
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Error scheduling double verification whatsapp: %', SQLERRM;
    END;
  END IF;

  RETURN TRUE;
END;
$$;
