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
Equipe Prime Circle'),
    (NEW.id, 'Boas-vindas - WhatsApp', 'whatsapp', 'Olá {{full_name}}! 🚀 Bem-vindo à Prime Circle. Seu cadastro foi recebido com sucesso. Estamos muito felizes em ter você em nossa rede exclusiva de parcerias imobiliárias.

⚠️ *Aviso Importante:* Estamos em nossa fase de lançamento! Caso encontre qualquer problema ou instabilidade, por favor nos avise pelo e-mail contato@primecircle.app.br ou respondendo a este WhatsApp. Seu feedback é fundamental!'),
    (NEW.id, 'Boas-vindas - Email', 'email', 'Assunto: Bem-vindo à Prime Circle! 🏠

Olá {{full_name}},

Bem-vindo à Prime Circle! Agora que sua conta foi criada, utilize o link abaixo para acessar seu painel exclusivo e começar a gerar parcerias.

Acesse: https://www.primecircle.app.br/dashboard

Dica Prime: Para facilitar seu acesso, abra este link no seu celular (Safari no iOS ou Chrome no Android) e use a opção "Adicionar à Tela de Início". Assim, você terá o Prime Circle como um aplicativo sempre à mão e receberá nossas notificações em tempo real!

⚠️ Aviso Importante: Estamos em nossa fase de lançamento! Caso encontre qualquer problema, erro ou instabilidade, é muito importante que você nos informe encaminhando uma mensagem para contato@primecircle.app.br ou pelo nosso WhatsApp de suporte.

Boas vendas,
Equipe Prime Circle'),
    (NEW.id, 'Nova Demanda - WhatsApp', 'whatsapp', 'Olá {{partner_name}}! 🚀 Uma nova demanda foi cadastrada na Prime Circle: {{demand_details}}. Acesse a plataforma para conferir e oferecer seus imóveis: https://www.primecircle.app.br/dashboard');
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing templates for 'Boas-vindas - WhatsApp' and 'Boas-vindas - Email'
UPDATE public.notification_templates
SET content = 'Olá {{full_name}}! 🚀 Bem-vindo à Prime Circle. Seu cadastro foi recebido com sucesso. Estamos muito felizes em ter você em nossa rede exclusiva de parcerias imobiliárias.

⚠️ *Aviso Importante:* Estamos em nossa fase de lançamento! Caso encontre qualquer problema ou instabilidade, por favor nos avise pelo e-mail contato@primecircle.app.br ou respondendo a este WhatsApp. Seu feedback é fundamental!'
WHERE name = 'Boas-vindas - WhatsApp';

UPDATE public.notification_templates
SET content = 'Assunto: Bem-vindo à Prime Circle! 🏠

Olá {{full_name}},

Bem-vindo à Prime Circle! Agora que sua conta foi criada, utilize o link abaixo para acessar seu painel exclusivo e começar a gerar parcerias.

Acesse: https://www.primecircle.app.br/dashboard

Dica Prime: Para facilitar seu acesso, abra este link no seu celular (Safari no iOS ou Chrome no Android) e use a opção "Adicionar à Tela de Início". Assim, você terá o Prime Circle como um aplicativo sempre à mão e receberá nossas notificações em tempo real!

⚠️ Aviso Importante: Estamos em nossa fase de lançamento! Caso encontre qualquer problema, erro ou instabilidade, é muito importante que você nos informe encaminhando uma mensagem para contato@primecircle.app.br ou pelo nosso WhatsApp de suporte.

Boas vendas,
Equipe Prime Circle'
WHERE name = 'Boas-vindas - Email';
