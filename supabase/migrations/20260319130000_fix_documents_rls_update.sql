-- Refine RLS policy to ensure users can only modify their own documents securely
DROP POLICY IF EXISTS "authenticated_update_documents" ON public.documents;

CREATE POLICY "authenticated_update_documents" ON public.documents
  FOR UPDATE TO authenticated
  USING (
    (auth.uid()::text = (metadata->>'user_id')::text) OR is_admin()
  )
  WITH CHECK (
    (auth.uid()::text = (metadata->>'user_id')::text) OR is_admin()
  );
