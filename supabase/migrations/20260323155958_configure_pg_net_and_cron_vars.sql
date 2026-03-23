-- PASSO 1: Ativar pg_net
CREATE EXTENSION IF NOT EXISTS pg_net;

-- PASSO 2: Configurar variáveis que o pg_cron usa
DO $DO$
BEGIN
  -- Definindo a URL do Supabase para o projeto atual
  EXECUTE 'ALTER DATABASE postgres SET "app.supabase_url" = ''https://lortaowlmktdnttoykfl.supabase.co''';
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Could not set app.supabase_url: %', SQLERRM;
END $DO$;

-- NOTA IMPORTANTÍSSIMA:
-- A app.service_role_key precisa ser configurada MANUALMENTE no SQL Editor do Supabase por questões de segurança.
-- Copie e cole o comando abaixo no SQL Editor, substituindo [SUA_SERVICE_ROLE_KEY] pela chave real (service_role) do projeto:
-- 
-- ALTER DATABASE postgres SET "app.service_role_key" = '[SUA_SERVICE_ROLE_KEY]';

-- PASSO 3: Confirmar que as configurações e pg_cron estão ativos
-- Para verificar se tudo funcionou, execute os comandos abaixo no SQL Editor do Supabase:
--
-- SELECT current_setting('app.supabase_url', true);
-- SELECT current_setting('app.service_role_key', true);
-- SELECT * FROM cron.job;
