-- Elevate marcus@godoyprime.com.br to admin role
DO $$
DECLARE
  target_user_id uuid;
BEGIN
  SELECT id INTO target_user_id FROM auth.users WHERE email = 'marcus@godoyprime.com.br' LIMIT 1;
  
  IF target_user_id IS NOT NULL THEN
    UPDATE public.profiles
    SET role = 'admin'
    WHERE id = target_user_id;
  END IF;
END $$;

-- Fix missing RLS policies for documents table
CREATE POLICY "authenticated_select_documents" ON public.documents
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_insert_documents" ON public.documents
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "authenticated_update_documents" ON public.documents
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_delete_documents" ON public.documents
  FOR DELETE TO authenticated USING (true);
