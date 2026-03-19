-- Create property_photos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('property_photos', 'property_photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for property_photos bucket
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'property_photos');

DROP POLICY IF EXISTS "Authenticated users can upload photos" ON storage.objects;
CREATE POLICY "Authenticated users can upload photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'property_photos');

DROP POLICY IF EXISTS "Users can update their photos" ON storage.objects;
CREATE POLICY "Users can update their photos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'property_photos');

DROP POLICY IF EXISTS "Users can delete their photos" ON storage.objects;
CREATE POLICY "Users can delete their photos" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'property_photos');

-- Fix documents delete RLS policy to be secure
DROP POLICY IF EXISTS "authenticated_delete_documents" ON public.documents;
CREATE POLICY "authenticated_delete_documents" ON public.documents
  FOR DELETE TO authenticated
  USING (
    (auth.uid()::text = (metadata->>'user_id')::text) OR is_admin()
  );

