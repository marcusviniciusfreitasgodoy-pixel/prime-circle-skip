-- Fix: Auditoria de Titularidade (Correção Eugenio Leonetti) & Sincronização do Contador de Corretores

DO $$
DECLARE
  v_admin_id UUID;
BEGIN
  -- Obtém o ID do administrador principal (que realizou todas as indicações)
  SELECT id INTO v_admin_id 
  FROM public.profiles 
  WHERE role = 'admin' 
  ORDER BY created_at ASC 
  LIMIT 1;
  
  IF v_admin_id IS NOT NULL THEN
    -- 1. Transfere todas as indicações para o Admin
    -- Isso remove o Eugenio Leonetti da lista de "Top Embaixadores" (pois o count de indicações dele passará a ser 0)
    -- E garante que todos os 5 corretores cadastrados tenham o referred_by_id preenchido para refletir nos cards de controle.
    UPDATE public.profiles
    SET referred_by_id = v_admin_id
    WHERE id != v_admin_id;

    -- 2. Transfere os registros históricos de cliques no link de convite para o Admin
    UPDATE public.referral_clicks
    SET referrer_id = v_admin_id
    WHERE referrer_id != v_admin_id;
    
    -- 3. Transfere os convites pendentes que receberão lembretes para o Admin
    UPDATE public.invitations
    SET referrer_id = v_admin_id
    WHERE referrer_id != v_admin_id;
  END IF;
END $$;
