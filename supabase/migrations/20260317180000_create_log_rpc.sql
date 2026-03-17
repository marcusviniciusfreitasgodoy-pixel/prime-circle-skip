-- Function to log notifications securely bypassing RLS when session is missing
CREATE OR REPLACE FUNCTION public.log_notification(
  p_user_id UUID,
  p_recipient TEXT,
  p_channel TEXT,
  p_status TEXT,
  p_message_body TEXT,
  p_error_details TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.notification_logs (
    user_id, recipient, channel, status, message_body, error_details
  ) VALUES (
    p_user_id, p_recipient, p_channel, p_status, p_message_body, p_error_details
  );
END;
$$;

-- Function to safely resolve user_id by email during SMTP outages
CREATE OR REPLACE FUNCTION public.get_user_id_by_email(p_email TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email LIMIT 1;
  RETURN v_user_id;
END;
$$;
