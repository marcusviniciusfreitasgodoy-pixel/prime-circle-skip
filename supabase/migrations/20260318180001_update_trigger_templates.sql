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

Boas vendas,
Equipe Prime Circle');
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user_templates trigger: %', SQLERRM;
  END;
    
  RETURN NEW;
END;
$function$;
