-- ============================================
-- NIUMBA - Créer le Bucket Storage pour les Images
-- ============================================
-- 
-- Ce script crée le bucket "property-images" dans Supabase Storage
-- et configure les permissions pour permettre l'upload d'images
-- ============================================

-- 1. Créer le bucket "property-images" (si il n'existe pas)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-images',
  'property-images',
  true, -- Public pour permettre l'accès aux images
  5242880, -- 5MB max par fichier
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- 2. Créer la policy pour permettre l'upload (authenticated users)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Allow authenticated users to upload images'
  ) THEN
    EXECUTE 'CREATE POLICY "Allow authenticated users to upload images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = ''property-images'')';
  END IF;
END $$;

-- 3. Créer la policy pour permettre la lecture publique
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Allow public read access to images'
  ) THEN
    EXECUTE 'CREATE POLICY "Allow public read access to images" ON storage.objects FOR SELECT TO public USING (bucket_id = ''property-images'')';
  END IF;
END $$;

-- 4. Créer la policy pour permettre la suppression (propriétaire ou admin)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Allow users to delete their own images'
  ) THEN
    EXECUTE 'CREATE POLICY "Allow users to delete their own images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = ''property-images'' AND ((storage.foldername(name))[2] = auth.uid()::text OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = ''admin'')))';
  END IF;
END $$;

-- 5. Vérifier que le bucket a été créé
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets
WHERE id = 'property-images';

-- 6. Message de confirmation
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'property-images') THEN
    RAISE NOTICE '✅ Bucket "property-images" créé avec succès !';
    RAISE NOTICE '✅ Permissions configurées pour l''upload d''images !';
  ELSE
    RAISE NOTICE '❌ Erreur : Le bucket n''a pas été créé.';
  END IF;
END $$;

