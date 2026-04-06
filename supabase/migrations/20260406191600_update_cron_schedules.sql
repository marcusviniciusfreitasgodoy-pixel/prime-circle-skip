-- Habilitar a extensão pg_cron caso ainda não esteja
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Remover o agendamento anterior se existir para garantir idempotência
DO $DO$
BEGIN
  PERFORM cron.unschedule('send-24h-reminders');
  PERFORM cron.unschedule('send-activation-reminders');
  PERFORM cron.unschedule('send-invitation-reminders');
  PERFORM cron.unschedule('monitor-partnerships');
  PERFORM cron.unschedule('send-founder-emails');
EXCEPTION WHEN OTHERS THEN
  -- Ignorar erro se o job não existir
END $DO$;

-- 1. Agendar os lembretes de 24h para rodar todos os dias às 09:30 BRT (12:30 UTC)
SELECT cron.schedule(
  'send-24h-reminders',
  '30 12 * * *',
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

-- 2. Agendar os lembretes de ativação (Engajamento) para rodar toda segunda-feira às 09:00 BRT (12:00 UTC)
SELECT cron.schedule(
  'send-activation-reminders',
  '0 12 * * 1',
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url', true) || '/functions/v1/process-activation-reminders',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.service_role_key', true),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- 3. Agendar os lembretes de convites (Invitations) para rodar todos os dias às 09:00 BRT (12:00 UTC)
SELECT cron.schedule(
  'send-invitation-reminders',
  '0 12 * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url', true) || '/functions/v1/process-invitation-reminders',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.service_role_key', true),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- 4. Agendar os lembretes de transição de plano Founder para rodar todos os dias às 09:00 BRT (12:00 UTC)
SELECT cron.schedule(
  'send-founder-emails',
  '0 12 * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url', true) || '/functions/v1/send-founder-transition-email',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.service_role_key', true),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);
