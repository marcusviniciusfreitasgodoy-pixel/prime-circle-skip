DO $body$
BEGIN
  -- Atualiza o perfil do usuário atual para administrador com base no email da auth
  UPDATE public.profiles
  SET 
    role = 'admin', 
    status = 'active', 
    plan = 'Founder'
  WHERE id IN (
    SELECT id FROM auth.users 
    WHERE email IN (
      'marcusviniciusfreitasgodoy@gmail.com',
      'marcus@godoyprime.com.br'
    )
  );

  -- Atualiza também pelo email do profile (caso o registro auth tenha um email diferente do profile)
  UPDATE public.profiles
  SET 
    role = 'admin', 
    status = 'active', 
    plan = 'Founder'
  WHERE email IN (
    'marcusviniciusfreitasgodoy@gmail.com',
    'marcus@godoyprime.com.br'
  );
END $body$;
