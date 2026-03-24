-- Exclusão do usuário solicitado da base de dados.
-- Devido às restrições ON DELETE CASCADE, isso também removerá o perfil, logs, feedbacks e templates associados.
DELETE FROM auth.users WHERE email = 'marcus@godoyprime.com.br';
