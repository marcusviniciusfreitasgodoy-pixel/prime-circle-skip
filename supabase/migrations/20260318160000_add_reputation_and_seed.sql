-- Base Cleanup to allow fresh onboarding tests
DELETE FROM public.support_tickets;
DELETE FROM public.notification_logs;
DELETE FROM public.notification_templates;
DELETE FROM public.profiles;
DELETE FROM auth.users;

-- Add reputation_score to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS reputation_score integer NOT NULL DEFAULT 0;

-- Seed Data for Stats and Opportunity Radar
DO $seed$
DECLARE
  seed_user_id uuid := '00000000-0000-0000-0000-000000000001'::uuid;
BEGIN
  -- 1. Create a Seed Broker User
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
    is_super_admin, role, aud,
    confirmation_token, recovery_token, email_change_token_new,
    email_change, email_change_token_current,
    phone, phone_change, phone_change_token, reauthentication_token
  ) VALUES (
    seed_user_id,
    '00000000-0000-0000-0000-000000000000',
    'seed@primecircle.app',
    crypt('SeedPassword123!', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Broker Seed Elite", "accepted_terms": true}',
    false, 'authenticated', 'authenticated',
    '', '', '', '', '', NULL, '', '', ''
  );

  -- 2. Update the auto-generated profile with reputation score
  UPDATE public.profiles 
  SET reputation_score = 98, role = 'admin' 
  WHERE id = seed_user_id;

  -- 3. Insert 5 seed properties into the documents table
  INSERT INTO public.documents (content, metadata) VALUES 
  ('Cobertura espetacular na Barra da Tijuca, 4 suítes, 4 vagas, vista mar e acabamento impecável.', '{"type": "oferta", "user_id": "00000000-0000-0000-0000-000000000001", "title": "Cobertura Vista Mar", "price": "R$ 8.500.000", "location": "Barra da Tijuca", "property_type": "Cobertura"}'),
  ('Mansão de luxo em condomínio fechado, segurança 24h, 5 suítes, piscina com borda infinita.', '{"type": "oferta", "user_id": "00000000-0000-0000-0000-000000000001", "title": "Mansão Santa Mônica", "price": "R$ 12.000.000", "location": "Barra da Tijuca", "property_type": "Casa"}'),
  ('Apartamento alto padrão no Leblon, 3 suítes, varanda gourmet, a duas quadras da praia.', '{"type": "oferta", "user_id": "00000000-0000-0000-0000-000000000001", "title": "Apto Leblon Luxo", "price": "R$ 5.200.000", "location": "Leblon", "property_type": "Apartamento"}'),
  ('Casa linear contemporânea conceito aberto, área gourmet integrada e paisagismo.', '{"type": "oferta", "user_id": "00000000-0000-0000-0000-000000000001", "title": "Casa Linear Contemporânea", "price": "R$ 6.800.000", "location": "Recreio", "property_type": "Casa"}'),
  ('Terreno em condomínio de luxo, projeto aprovado, pronto para construir.', '{"type": "oferta", "user_id": "00000000-0000-0000-0000-000000000001", "title": "Terreno Alphaville", "price": "R$ 3.500.000", "location": "Barra da Tijuca", "property_type": "Terreno"}');

  -- 4. Insert 5 seed demands into the documents table
  INSERT INTO public.documents (content, metadata) VALUES 
  ('Cliente empresário busca cobertura na Barra, mínimo 4 vagas e vista indevassável. Pagamento à vista.', '{"type": "demanda", "user_id": "00000000-0000-0000-0000-000000000001", "profile": "Cliente Corporativo", "budget": "Até R$ 10M", "region": "Barra da Tijuca"}'),
  ('Família grande procura casa em condomínio de alto padrão, priorizando segurança e área de lazer.', '{"type": "demanda", "user_id": "00000000-0000-0000-0000-000000000001", "profile": "Família Grande", "budget": "Até R$ 7M", "region": "Barra/Recreio"}'),
  ('Investidor buscando apartamento na Zona Sul para retrofit e posterior locação.', '{"type": "demanda", "user_id": "00000000-0000-0000-0000-000000000001", "profile": "Investidor", "budget": "Até R$ 4M", "region": "Leblon/Ipanema"}'),
  ('Casal de idosos necessita de apartamento linear de fácil acessibilidade e em andar baixo.', '{"type": "demanda", "user_id": "00000000-0000-0000-0000-000000000001", "profile": "Casal Aposentado", "budget": "Até R$ 3.5M", "region": "Ipanema/Leblon"}'),
  ('Executivo expatriado busca imóvel finamente mobiliado e decorado para moradia imediata.', '{"type": "demanda", "user_id": "00000000-0000-0000-0000-000000000001", "profile": "Executivo Expatriado", "budget": "Até R$ 15M", "region": "Zona Sul"}');

END $seed$;
