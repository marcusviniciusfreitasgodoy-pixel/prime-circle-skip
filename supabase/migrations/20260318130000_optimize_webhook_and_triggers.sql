CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Make absolutely sure handle_new_user is fast and non-blocking
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  is_first_user BOOLEAN;
  assigned_role TEXT := 'user';
  assigned_plan TEXT := 'Free';
BEGIN
  -- Use a fast check on public.profiles instead of a full scan count(*) on auth.users
  SELECT NOT EXISTS (SELECT 1 FROM public.profiles LIMIT 1) INTO is_first_user;
  
  IF is_first_user THEN
    assigned_role := 'admin';
    assigned_plan := 'Founder';
  END IF;

  BEGIN
    INSERT INTO public.profiles (
      id, 
      full_name, 
      role, 
      plan, 
      accepted_terms,
      whatsapp_number,
      creci,
      region,
      ticket_value,
      referral_code,
      company_name
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      assigned_role,
      assigned_plan,
      COALESCE((NEW.raw_user_meta_data->>'accepted_terms')::boolean, false),
      NEW.raw_user_meta_data->>'whatsapp_number',
      NEW.raw_user_meta_data->>'creci',
      NEW.raw_user_meta_data->>'region',
      NEW.raw_user_meta_data->>'ticket_value',
      NEW.raw_user_meta_data->>'referral_code',
      NEW.raw_user_meta_data->>'company_name'
    )
    ON CONFLICT (id) DO UPDATE SET
      role = EXCLUDED.role,
      plan = EXCLUDED.plan;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
  END;
    
  RETURN NEW;
END;
$function$;

-- Make handle_new_user_templates fast
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
      (NEW.id, 'Boas-vindas - WhatsApp', 'whatsapp', 'Olá {{full_name}}! 🚀 Bem-vindo à Prime Circle. Seu cadastro foi recebido com sucesso. Estamos muito felizes em ter você em nossa rede exclusiva de parcerias imobiliárias. Em breve entraremos em contato!'),
      (NEW.id, 'Boas-vindas - Email', 'email', 'Assunto: Bem-vindo à Prime Circle! 🏠

Olá {{full_name}},

É um prazer ter você conosco! Sua conta foi criada com sucesso. Agora você faz parte de um ecossistema exclusivo projetado para potencializar seus resultados no mercado imobiliário.

Acesse seu painel agora para completar seu perfil e começar a gerar matches.

Boas vendas,
Equipe Prime Circle');
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user_templates trigger: %', SQLERRM;
  END;
    
  RETURN NEW;
END;
$function$;

-- Optimize trigger_welcome_webhook to use pg_net properly and entirely decouple external calls
CREATE OR REPLACE FUNCTION public.trigger_welcome_webhook()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_url text;
  v_body jsonb;
BEGIN
  v_url := current_setting('app.settings.supabase_url', true);
  
  IF v_url IS NULL OR v_url = '' THEN
    v_url := 'https://lortaowlmktdnttoykfl.supabase.co';
  END IF;
  
  v_url := v_url || '/functions/v1/welcome-webhook';
  v_body := jsonb_build_object(
    'type', 'INSERT', 
    'table', 'profiles', 
    'schema', 'public', 
    'record', row_to_json(NEW)
  );

  BEGIN
    -- net.http_post puts the request in an async queue handled by the pg_net background worker
    -- This guarantees the transaction commits quickly regardless of the edge function's response time
    PERFORM net.http_post(
        url := v_url,
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := v_body,
        timeout_milliseconds := 2000
    );
  EXCEPTION WHEN OTHERS THEN
    -- Completely swallow any pg_net scheduling errors to avoid aborting auth.users insert
    RAISE WARNING 'Error scheduling welcome webhook pg_net request: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$;
