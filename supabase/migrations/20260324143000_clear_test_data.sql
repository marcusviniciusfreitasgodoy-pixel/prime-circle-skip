-- Limpeza estratégica da base de dados solicitada para zerar o ambiente de testes
-- e remover todo o ruído de dados antigos para testes do cliente

-- Limpa todas as conexões e interações de matches
TRUNCATE TABLE public.partnerships CASCADE;

-- Limpa os logs de disparo de e-mails e whatsapp
TRUNCATE TABLE public.notification_logs CASCADE;

-- Limpa o histórico de cliques dos links de convite
TRUNCATE TABLE public.referral_clicks CASCADE;
