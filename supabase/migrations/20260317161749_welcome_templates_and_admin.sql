-- 1. Update handle_new_user_templates function to include new welcome templates
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
    (NEW.id, 'Boas-vindas - WhatsApp', 'whatsapp', 'Olá {{full_name}}! 🚀 Bem-vindo à Prime Circle. Seu cadastro foi recebido com sucesso. Estamos muito felizes em ter você em nossa rede exclusiva de parcerias imobiliárias. Em breve entraremos em contato!'),
    (NEW.id, 'Boas-vindas - Email', 'email', 'Assunto: Bem-vindo à Prime Circle! 🏠

Olá {{full_name}},

É um prazer ter você conosco! Sua conta foi criada com sucesso. Agora você faz parte de um ecossistema exclusivo projetado para potencializar seus resultados no mercado imobiliário.

Acesse seu painel agora para completar seu perfil e começar a gerar matches.

Boas vendas,
Equipe Prime Circle');
    
  RETURN NEW;
END;
$function$;

-- 2. Insert the new templates for existing users
INSERT INTO public.notification_templates (user_id, name, channel, content)
SELECT id, 'Boas-vindas - WhatsApp', 'whatsapp', 'Olá {{full_name}}! 🚀 Bem-vindo à Prime Circle. Seu cadastro foi recebido com sucesso. Estamos muito felizes em ter você em nossa rede exclusiva de parcerias imobiliárias. Em breve entraremos em contato!'
FROM public.profiles
WHERE NOT EXISTS (
  SELECT 1 FROM public.notification_templates nt WHERE nt.user_id = profiles.id AND nt.name = 'Boas-vindas - WhatsApp'
);

INSERT INTO public.notification_templates (user_id, name, channel, content)
SELECT id, 'Boas-vindas - Email', 'email', 'Assunto: Bem-vindo à Prime Circle! 🏠

Olá {{full_name}},

É um prazer ter você conosco! Sua conta foi criada com sucesso. Agora você faz parte de um ecossistema exclusivo projetado para potencializar seus resultados no mercado imobiliário.

Acesse seu painel agora para completar seu perfil e começar a gerar matches.

Boas vendas,
Equipe Prime Circle'
FROM public.profiles
WHERE NOT EXISTS (
  SELECT 1 FROM public.notification_templates nt WHERE nt.user_id = profiles.id AND nt.name = 'Boas-vindas - Email'
);

-- 3. Elevate the latest user to admin and Founder
DO $$
DECLARE
  latest_user_id uuid;
BEGIN
  -- Get the most recently created user ID
  SELECT id INTO latest_user_id FROM auth.users ORDER BY created_at DESC LIMIT 1;
  
  IF latest_user_id IS NOT NULL THEN
    UPDATE public.profiles
    SET role = 'admin', plan = 'Founder'
    WHERE id = latest_user_id;
  END IF;
END $$;
