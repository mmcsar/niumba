-- ============================================
-- NIUMBA - Créer Bucket Storage ET Données d'Exemple
-- ============================================

-- PARTIE 1: Créer le bucket Storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-images',
  'property-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- PARTIE 2: Créer les policies Storage
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

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Allow users to delete their own images'
  ) THEN
    EXECUTE 'CREATE POLICY "Allow users to delete their own images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = ''property-images'')';
  END IF;
END $$;

-- PARTIE 3: Vérifier le bucket
SELECT 
  'Bucket Storage' as verification,
  id,
  name,
  public,
  CASE WHEN public THEN '✅ Créé' ELSE '❌ Erreur' END as status
FROM storage.buckets
WHERE id = 'property-images';

-- PARTIE 4: Message de confirmation
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'property-images') THEN
    RAISE NOTICE '✅ Bucket "property-images" créé avec succès !';
    RAISE NOTICE '✅ Policies Storage configurées !';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Note: Utilisez le bouton "Créer des propriétés d''exemple" dans le dashboard admin pour ajouter des données de test.';
  ELSE
    RAISE NOTICE '❌ Erreur : Le bucket n''a pas été créé.';
  END IF;
END $$;


