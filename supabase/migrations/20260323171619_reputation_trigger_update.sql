-- Substituindo e consolidando o trigger de reputação conforme as especificações
-- Adaptado para usar 'last_updated_by' já existente na estrutura atual

CREATE OR REPLACE FUNCTION public.increment_reputation_on_advance()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o status mudou, não é cancelamento/rejeição e não foi confirmado pelo parceiro
  IF OLD.status IS DISTINCT FROM NEW.status
     AND NEW.status NOT IN ('cancelado', 'cancelled', 'rejeitado')
     AND COALESCE(NEW.confirmed_by_partner, false) = false
     AND NEW.last_updated_by IS NOT NULL
  THEN
    UPDATE public.profiles
    SET reputation_score = COALESCE(reputation_score, 0) + 2
    WHERE id = NEW.last_updated_by;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove triggers antigos caso existam para evitar duplicação
DROP TRIGGER IF EXISTS on_partnership_advanced ON public.partnerships;
DROP TRIGGER IF EXISTS trg_reputation_on_advance ON public.partnerships;

-- Cria o novo trigger consolidado
CREATE TRIGGER trg_reputation_on_advance
  AFTER UPDATE OF status ON public.partnerships
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_reputation_on_advance();
