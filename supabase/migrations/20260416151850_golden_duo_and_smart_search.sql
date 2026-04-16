ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS golden_duo_reminder_sent_at TIMESTAMPTZ;

-- Add new templates for the new flows
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
    (NEW.id, 'Nova Demanda - WhatsApp', 'whatsapp', 'Olá {{partner_name}}! 🚀 Uma nova demanda foi cadastrada na Prime Circle: {{demand_details}}. Acesse a plataforma para conferir e oferecer seus imóveis: https://www.primecircle.app.br/dashboard'),
    (NEW.id, 'Duo de Ouro - Falta Demanda', 'whatsapp', 'Olá {{full_name}}! Notamos que você já cadastrou um imóvel, mas ainda não incluiu nenhuma demanda. 🎯 Para ativar o "Duo de Ouro" e maximizar seus matches, cadastre agora o que seu cliente procura: https://www.primecircle.app.br/dashboard'),
    (NEW.id, 'Duo de Ouro - Falta Oferta', 'whatsapp', 'Olá {{full_name}}! Notamos que você já cadastrou uma demanda, mas ainda não incluiu nenhum imóvel. 🏠 Para ativar o "Duo de Ouro" e ser encontrado por outros corretores, cadastre seus imóveis agora: https://www.primecircle.app.br/dashboard'),
    (NEW.id, 'Busca Inteligente - Sem Resultados', 'whatsapp', 'Olá {{full_name}}! Vimos que sua nova demanda para {{demand_details}} ainda não teve matches na rede. 🔍 Que tal convidar um parceiro que atua nessa região? Se ele tiver o imóvel, vocês fecham negócio! Seu link: https://www.primecircle.app.br/?ref={{user_id}}')
  ON CONFLICT DO NOTHING;
    
  RETURN NEW;
END;
$function$;

-- Seed the new templates for existing users
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN SELECT id FROM public.profiles LOOP
    INSERT INTO public.notification_templates (user_id, name, channel, content)
    VALUES 
      (rec.id, 'Duo de Ouro - Falta Demanda', 'whatsapp', 'Olá {{full_name}}! Notamos que você já cadastrou um imóvel, mas ainda não incluiu nenhuma demanda. 🎯 Para ativar o "Duo de Ouro" e maximizar seus matches, cadastre agora o que seu cliente procura: https://www.primecircle.app.br/dashboard'),
      (rec.id, 'Duo de Ouro - Falta Oferta', 'whatsapp', 'Olá {{full_name}}! Notamos que você já cadastrou uma demanda, mas ainda não incluiu nenhum imóvel. 🏠 Para ativar o "Duo de Ouro" e ser encontrado por outros corretores, cadastre seus imóveis agora: https://www.primecircle.app.br/dashboard'),
      (rec.id, 'Busca Inteligente - Sem Resultados', 'whatsapp', 'Olá {{full_name}}! Vimos que sua nova demanda para {{demand_details}} ainda não teve matches na rede. 🔍 Que tal convidar um parceiro que atua nessa região? Se ele tiver o imóvel, vocês fecham negócio! Seu link: https://www.primecircle.app.br/?ref={{user_id}}')
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- Create the trigger for smart search
CREATE OR REPLACE FUNCTION public.trigger_smart_search_webhook()
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
  
  v_url := v_url || '/functions/v1/smart-search-webhook';

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
      RAISE WARNING 'Error scheduling smart search webhook pg_net request: %', SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS on_document_created_smart_search ON public.documents;
CREATE TRIGGER on_document_created_smart_search 
  AFTER INSERT ON public.documents 
  FOR EACH ROW EXECUTE FUNCTION trigger_smart_search_webhook();
