-- Replace domain in existing notification templates
UPDATE notification_templates
SET content = REPLACE(content, 'prime-circle-migration-fd549.goskip.app', 'www.primecircle.app.br');

-- Re-create handle_new_user_templates function to use new domain in default templates
CREATE OR REPLACE FUNCTION public.handle_new_user_templates()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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

Acesse: https://www.primecircle.app.br/dashboard

Dica Prime: Para facilitar seu acesso, abra este link no seu celular (Safari no iOS ou Chrome no Android) e use a opção "Adicionar à Tela de Início". Assim, você terá o Prime Circle como um aplicativo sempre à mão e receberá nossas notificações em tempo real!

Boas vendas,
Equipe Prime Circle'),
    (NEW.id, 'Nova Demanda - WhatsApp', 'whatsapp', 'Olá {{partner_name}}! 🚀 Uma nova demanda foi cadastrada na Prime Circle: {{demand_details}}. Acesse a plataforma para conferir e oferecer seus imóveis: https://www.primecircle.app.br/dashboard');
    
  RETURN NEW;
END;
$function$;

-- Update trigger_validation_whatsapp function to use new domain in generated links
CREATE OR REPLACE FUNCTION public.trigger_validation_whatsapp()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_url text;
  v_body jsonb;
  v_message text;
BEGIN
  -- Only trigger when status changes from pending_validation to active and validated_by is populated
  IF OLD.status = 'pending_validation' AND NEW.status = 'active' AND NEW.validated_by IS NOT NULL THEN
    
    -- Make sure the user has a whatsapp number
    IF NEW.whatsapp_number IS NULL OR NEW.whatsapp_number = '' THEN
      RETURN NEW;
    END IF;

    v_url := current_setting('app.settings.supabase_url', true);
    IF v_url IS NULL OR v_url = '' THEN
      v_url := 'https://lortaowlmktdnttoykfl.supabase.co';
    END IF;
    
    v_url := v_url || '/functions/v1/send-whatsapp';
    
    -- Construct the exact message requested in Acceptance Criteria
    v_message := 'Olá ' || COALESCE(NEW.full_name, 'Parceiro(a)') || '! Sua conta no Prime Circle foi validada com sucesso por um de nossos membros sêniores. 🚀 Acesse agora para conferir as oportunidades exclusivas: https://www.primecircle.app.br/dashboard';

    -- Build the payload for the edge function. Including user_id ensures it gets logged in notification_logs.
    v_body := jsonb_build_object(
      'number', NEW.whatsapp_number,
      'text', v_message,
      'user_id', NEW.id
    );
    
    BEGIN
      PERFORM net.http_post(
          url := v_url,
          headers := '{"Content-Type": "application/json"}'::jsonb,
          body := v_body,
          timeout_milliseconds := 2000
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Error scheduling validation whatsapp pg_net request: %', SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$function$;
