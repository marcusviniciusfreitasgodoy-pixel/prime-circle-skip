DO $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Check if user already exists
  SELECT id INTO target_user_id FROM auth.users WHERE email = 'marcus@godoyprime.com.br' LIMIT 1;
  
  -- If user does not exist, insert into auth.users
  IF target_user_id IS NULL THEN
    target_user_id := gen_random_uuid();
    
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      target_user_id,
      '00000000-0000-0000-0000-000000000000',
      'marcus@godoyprime.com.br',
      crypt('GodoyPrime2026!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Marcus Godoy", "full_name": "Marcus Godoy"}',
      false, 'authenticated', 'authenticated',
      '',    -- confirmation_token: MUST be '' not NULL
      '',    -- recovery_token: MUST be '' not NULL
      '',    -- email_change_token_new: MUST be '' not NULL
      '',    -- email_change: MUST be '' not NULL
      '',    -- email_change_token_current: MUST be '' not NULL
      NULL,  -- phone: MUST be NULL (not '') due to UNIQUE constraint
      '',    -- phone_change: MUST be '' not NULL
      '',    -- phone_change_token: MUST be '' not NULL
      ''     -- reauthentication_token: MUST be '' not NULL
    );
  END IF;

  -- Ensure the user's profile is set to admin, active, and Founder
  INSERT INTO public.profiles (
    id, full_name, role, status, plan, accepted_terms
  ) VALUES (
    target_user_id,
    'Marcus Godoy',
    'admin',
    'active',
    'Founder',
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    status = 'active',
    plan = 'Founder';

END $$;
