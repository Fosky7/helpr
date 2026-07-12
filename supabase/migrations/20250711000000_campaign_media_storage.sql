-- Module 2: campaign media storage.
-- Accepted image types and the 5 MB size limit are mirrored in src/lib/campaigns.ts.
-- Object paths must start with the authenticated user's UUID, e.g.
-- <user-id>/covers/<random-file-name>.webp.

INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'campaign-media',
  'campaign-media',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA storage TO anon, authenticated;
GRANT SELECT ON storage.buckets TO anon, authenticated;
GRANT SELECT ON storage.objects TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON storage.objects TO authenticated;

DROP POLICY IF EXISTS "Campaign media public read" ON storage.objects;
CREATE POLICY "Campaign media public read"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'campaign-media');

DROP POLICY IF EXISTS "Campaign media user-prefixed upload" ON storage.objects;
CREATE POLICY "Campaign media user-prefixed upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'campaign-media'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Campaign media owner update" ON storage.objects;
CREATE POLICY "Campaign media owner update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'campaign-media'
  AND auth.uid() IS NOT NULL
  AND (
    owner = auth.uid()
    OR owner_id = auth.uid()::text
    OR (storage.foldername(name))[1] = auth.uid()::text
  )
)
WITH CHECK (
  bucket_id = 'campaign-media'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Campaign media owner delete" ON storage.objects;
CREATE POLICY "Campaign media owner delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'campaign-media'
  AND auth.uid() IS NOT NULL
  AND (
    owner = auth.uid()
    OR owner_id = auth.uid()::text
    OR (storage.foldername(name))[1] = auth.uid()::text
  )
);
