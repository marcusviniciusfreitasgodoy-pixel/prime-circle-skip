-- Habilitar a extensão pg_cron caso ainda não esteja
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Remover o agendamento anterior se existir (garante idempotência)
DO $DO$
BEGIN
  PERFORM cron.unschedule('send-24h-reminders');
EXCEPTION WHEN OTHERS THEN
  -- Ignorar erro se o job não existir
END $DO$;

-- Agendar o envio dos lembretes de 24h para rodar todos os dias às 12:00
SELECT cron.schedule(
  'send-24h-reminders',
  '0 12 * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url', true) || '/functions/v1/send-reminder-24h',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.service_role_key', true),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);
