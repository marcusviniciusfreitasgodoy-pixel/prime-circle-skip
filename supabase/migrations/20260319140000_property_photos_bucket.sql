-- Create property_photos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('property_photos', 'property_photos', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Storage policies for property_photos bucket
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'property_photos');

CREATE POLICY "Authenticated users can upload photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'property_photos');

CREATE POLICY "Users can update their photos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'property_photos');

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
