-- 1. Delete fictitious demands from documents table
DELETE FROM public.documents 
WHERE 
  (metadata->>'type' = 'demanda' OR metadata->>'type' IS NULL) AND
  (
    content ILIKE '%Executivo Expatriado%' OR metadata->>'title' ILIKE '%Executivo Expatriado%' OR
    content ILIKE '%Casal aposentado%' OR metadata->>'title' ILIKE '%Casal aposentado%' OR
    content ILIKE '%Investidor%' OR metadata->>'title' ILIKE '%Investidor%' OR
    content ILIKE '%familia grande%' OR metadata->>'title' ILIKE '%familia grande%' OR
    content ILIKE '%cliente corporativo%' OR metadata->>'title' ILIKE '%cliente corporativo%'
  );

-- 2. Update default notification template trigger function to include Dashboard & Magic Link URLs
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

Bem-vindo à Prime Circle! Agora que sua conta foi criada, acesse o nosso Dashboard para começar a gerar parcerias:
Dashboard: https://prime-circle-migration-fd549.goskip.app/dashboard

Caso precise entrar novamente, você pode solicitar um Magic Link na página de Acesso Exclusivo:
Acesso Exclusivo: https://prime-circle-migration-fd549.goskip.app/

Boas vendas,
Equipe Prime Circle');
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user_templates trigger: %', SQLERRM;
  END;
    
  RETURN NEW;
END;
$function$;

-- 3. Update existing welcome email templates to match the new format
UPDATE public.notification_templates
SET content = 'Assunto: Bem-vindo à Prime Circle! 🏠

Olá {{full_name}},

Bem-vindo à Prime Circle! Agora que sua conta foi criada, acesse o nosso Dashboard para começar a gerar parcerias:
Dashboard: https://prime-circle-migration-fd549.goskip.app/dashboard

Caso precise entrar novamente, você pode solicitar um Magic Link na página de Acesso Exclusivo:
Acesso Exclusivo: https://prime-circle-migration-fd549.goskip.app/

Boas vendas,
Equipe Prime Circle'
WHERE name = 'Boas-vindas - Email';

-- 4. Create Storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true) 
ON CONFLICT (id) DO NOTHING;

-- 5. Safe creation of Storage RLS policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Avatar images are publicly accessible'
    ) THEN
        CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Users can upload their own avatars'
    ) THEN
        CREATE POLICY "Users can upload their own avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid() = owner);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Users can update their own avatars'
    ) THEN
        CREATE POLICY "Users can update their own avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid() = owner);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Users can delete their own avatars'
    ) THEN
        CREATE POLICY "Users can delete their own avatars" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid() = owner);
    END IF;
END
$$;
