DO $$
BEGIN
  -- Drop existing policy if we need to modify it, or just ensure it's correct
  DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
  
  CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
END $$;

DO $$
DECLARE
  first_admin_id uuid;
BEGIN
  SELECT id INTO first_admin_id FROM public.profiles WHERE role = 'admin' ORDER BY id LIMIT 1;
  
  IF first_admin_id IS NOT NULL THEN
    -- Check if they have templates
    IF NOT EXISTS (SELECT 1 FROM public.notification_templates WHERE user_id = first_admin_id AND name = 'Boas-vindas - WhatsApp') THEN
      INSERT INTO public.notification_templates (user_id, name, channel, content)
      VALUES 
        (first_admin_id, 'Boas-vindas - WhatsApp', 'whatsapp', 'Olá {{full_name}}! 🚀 Bem-vindo à Prime Circle. Seu cadastro foi recebido com sucesso. Estamos muito felizes em ter você em nossa rede exclusiva de parcerias imobiliárias. Em breve entraremos em contato!'),
        (first_admin_id, 'Boas-vindas - Email', 'email', 'Assunto: Bem-vindo à Prime Circle! 🏠

Olá {{full_name}},

É um prazer ter você conosco! Sua conta foi criada com sucesso. Agora você faz parte de um ecossistema exclusivo projetado para potencializar seus resultados no mercado imobiliário.

Acesse seu painel agora para completar seu perfil e começar a gerar matches.

Boas vendas,
Equipe Prime Circle');
    END IF;
  END IF;
END $$;
