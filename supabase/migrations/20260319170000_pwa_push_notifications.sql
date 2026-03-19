-- Create table for push subscriptions
CREATE TABLE IF NOT EXISTS public.user_push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subscription_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own push subscriptions"
  ON public.user_push_subscriptions
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all push subscriptions"
  ON public.user_push_subscriptions
  FOR SELECT TO authenticated
  USING (is_admin());

-- Update channel constraint in notification logs to allow 'push'
ALTER TABLE public.notification_logs DROP CONSTRAINT IF EXISTS notification_logs_channel_check;
ALTER TABLE public.notification_logs ADD CONSTRAINT notification_logs_channel_check CHECK (channel IN ('whatsapp', 'email', 'push'));

-- Update trigger for new user templates (welcome email)
CREATE OR REPLACE FUNCTION public.handle_new_user_templates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  BEGIN
    INSERT INTO public.notification_templates (user_id, name, channel, content)
    VALUES 
      (NEW.id, 'Notificação de Match - WhatsApp', 'whatsapp', 'Olá {{partner_name}}! 🚀 Acabamos de encontrar um novo match para o imóvel {{property_details}}. Confira agora mesmo no seu painel da Prime Circle!'),
      (NEW.id, 'Notificação de Match - Email', 'email', 'Assunto: Novo Match Identificado! 🏠 

Olá {{partner_name}},

Identificamos uma nova oportunidade de negócio! Um novo match foi gerado para o imóvel {{property_details}}.

Clique no link abaixo para ver os detalhes e entrar em contato:
[Link do Sistema]

Boas vendas,
Equipe Prime Circle'),
      (NEW.id, 'Solicitação de Parceria - WhatsApp', 'whatsapp', 'Olá {{partner_name}}! Você recebeu uma nova solicitação de parceria na Prime Circle. Acesse a plataforma para responder e iniciar essa nova colaboração. 🤝'),
      (NEW.id, 'Solicitação de Parceria - Email', 'email', 'Assunto: Você tem uma nova solicitação de parceria 🤝

Olá {{partner_name}},

Um colega de profissão enviou uma solicitação de parceria para você através da Prime Circle.

Parcerias aumentam suas chances de fechamento! Acesse seu dashboard para revisar a solicitação.

Atenciosamente,
Equipe Prime Circle'),
      (NEW.id, 'Boas-vindas - WhatsApp', 'whatsapp', 'Olá {{full_name}}! 🚀 Bem-vindo à Prime Circle. Seu cadastro foi recebido com sucesso. Estamos muito felizes em ter você em nossa rede exclusiva de parcerias imobiliárias.'),
      (NEW.id, 'Boas-vindas - Email', 'email', 'Assunto: Bem-vindo à Prime Circle! 🏠

Olá {{full_name}},

Bem-vindo à Prime Circle! Agora que sua conta foi criada, utilize o link abaixo para acessar seu painel exclusivo e começar a gerar parcerias.

Acesse: https://prime-circle-migration-fd549.goskip.app/dashboard

Dica Prime: Para facilitar seu acesso, abra este link no seu celular (Safari no iOS ou Chrome no Android) e use a opção "Adicionar à Tela de Início". Assim, você terá o Prime Circle como um aplicativo sempre à mão e receberá nossas notificações em tempo real!

Boas vendas,
Equipe Prime Circle');
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user_templates trigger: %', SQLERRM;
  END;
    
  RETURN NEW;
END;
$function$;

-- Update existing welcome email templates
UPDATE public.notification_templates
SET content = 'Assunto: Bem-vindo à Prime Circle! 🏠

Olá {{full_name}},

Bem-vindo à Prime Circle! Agora que sua conta foi criada, utilize o link abaixo para acessar seu painel exclusivo e começar a gerar parcerias.

Acesse: https://prime-circle-migration-fd549.goskip.app/dashboard

Dica Prime: Para facilitar seu acesso, abra este link no seu celular (Safari no iOS ou Chrome no Android) e use a opção "Adicionar à Tela de Início". Assim, você terá o Prime Circle como um aplicativo sempre à mão e receberá nossas notificações em tempo real!

Boas vendas,
Equipe Prime Circle'
WHERE name = 'Boas-vindas - Email';

-- Trigger for web push on demand creation
CREATE OR REPLACE FUNCTION public.trigger_demand_push_webhook()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_url text;
  v_body jsonb;
BEGIN
  v_url := current_setting('app.settings.supabase_url', true);
  IF v_url IS NULL OR v_url = '' THEN
    v_url := 'https://lortaowlmktdnttoykfl.supabase.co';
  END IF;
  
  v_url := v_url || '/functions/v1/demand-push-webhook';

  IF NEW.metadata->>'type' = 'demanda' THEN
    v_body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'documents',
      'schema', 'public',
      'record', row_to_json(NEW)
    );
    
    BEGIN
      PERFORM net.http_post(
          url := v_url,
          headers := '{"Content-Type": "application/json"}'::jsonb,
          body := v_body,
          timeout_milliseconds := 2000
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Error scheduling demand push webhook pg_net request: %', SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS on_document_created_send_demand_push ON public.documents;
CREATE TRIGGER on_document_created_send_demand_push
AFTER INSERT ON public.documents
FOR EACH ROW EXECUTE FUNCTION trigger_demand_push_webhook();
