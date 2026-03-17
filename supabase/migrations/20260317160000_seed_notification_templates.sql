DO $$
DECLARE
  prof RECORD;
BEGIN
  FOR prof IN SELECT id FROM public.profiles LOOP
    IF NOT EXISTS (SELECT 1 FROM public.notification_templates WHERE user_id = prof.id AND name = 'Notificação de Match - WhatsApp') THEN
      INSERT INTO public.notification_templates (user_id, name, channel, content)
      VALUES (prof.id, 'Notificação de Match - WhatsApp', 'whatsapp', 'Olá {{partner_name}}! 🚀 Acabamos de encontrar um novo match para o imóvel {{property_details}}. Confira agora mesmo no seu painel da Prime Circle!');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.notification_templates WHERE user_id = prof.id AND name = 'Notificação de Match - Email') THEN
      INSERT INTO public.notification_templates (user_id, name, channel, content)
      VALUES (prof.id, 'Notificação de Match - Email', 'email', 'Assunto: Novo Match Identificado! 🏠 

Olá {{partner_name}},

Identificamos uma nova oportunidade de negócio! Um novo match foi gerado para o imóvel {{property_details}}.

Clique no link abaixo para ver os detalhes e entrar em contato:
[Link do Sistema]

Boas vendas,
Equipe Prime Circle');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.notification_templates WHERE user_id = prof.id AND name = 'Solicitação de Parceria - WhatsApp') THEN
      INSERT INTO public.notification_templates (user_id, name, channel, content)
      VALUES (prof.id, 'Solicitação de Parceria - WhatsApp', 'whatsapp', 'Olá {{partner_name}}! Você recebeu uma nova solicitação de parceria na Prime Circle. Acesse a plataforma para responder e iniciar essa nova colaboração. 🤝');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.notification_templates WHERE user_id = prof.id AND name = 'Solicitação de Parceria - Email') THEN
      INSERT INTO public.notification_templates (user_id, name, channel, content)
      VALUES (prof.id, 'Solicitação de Parceria - Email', 'email', 'Assunto: Você tem uma nova solicitação de parceria 🤝

Olá {{partner_name}},

Um colega de profissão enviou uma solicitação de parceria para você através da Prime Circle.

Parcerias aumentam suas chances de fechamento! Acesse seu dashboard para revisar a solicitação.

Atenciosamente,
Equipe Prime Circle');
    END IF;
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.handle_new_user_templates()
RETURNS trigger AS $$
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
Equipe Prime Circle');
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_created_add_templates ON public.profiles;
CREATE TRIGGER on_profile_created_add_templates
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_templates();
