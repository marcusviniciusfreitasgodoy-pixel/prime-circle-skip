-- Exclusão do usuário solicitado da base de dados.
-- Removendo dependências que não possuem CASCADE e, em seguida, o usuário.
DO $$ 
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'marcusviniciusfreitasgodoy@gmail.com';
  
  IF v_user_id IS NOT NULL THEN
    -- Remove referências em parcerias que não possuem CASCADE
    UPDATE public.partnerships SET cancelado_by = NULL WHERE cancelado_by = v_user_id;
    UPDATE public.partnerships SET last_updated_by = NULL WHERE last_updated_by = v_user_id;
    
    -- Remove referências em tokens de ação rápida
    UPDATE public.quick_action_tokens SET corretor_id = NULL WHERE corretor_id = v_user_id;
    
    -- Deleta o usuário da tabela auth.users. Devido ao ON DELETE CASCADE configurado
    -- em (profiles_id_fkey), o profile e outros dados associados serão removidos automaticamente.
    DELETE FROM auth.users WHERE id = v_user_id;
  END IF;
END $$;
