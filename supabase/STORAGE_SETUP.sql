-- ============================================
-- Niumba - Supabase Storage Configuration
-- ============================================
-- Ce script configure les buckets et politiques
-- pour l'upload d'images (propriétés et avatars)
-- ============================================

-- ============================================
-- 1. CRÉER LES BUCKETS
-- ============================================

-- Bucket pour les images des propriétés
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-images',
  'property-images',
  true, -- Public bucket
  10485760, -- 10 MB (10 * 1024 * 1024)
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE
SET 
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

-- Bucket pour les avatars (photos de profil)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true, -- Public bucket
  5242880, -- 5 MB (5 * 1024 * 1024)
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE
SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

-- ============================================
-- 2. POLITIQUES RLS POUR property-images
-- ============================================

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Public can read property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete property images" ON storage.objects;

-- INSERT: Permettre aux utilisateurs authentifiés d'uploader
CREATE POLICY "Users can upload property images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property-images');

-- SELECT: Permettre au public de lire
CREATE POLICY "Public can read property images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'property-images');

-- UPDATE: Permettre aux utilisateurs de mettre à jour leurs images
CREATE POLICY "Users can update property images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'property-images')
WITH CHECK (bucket_id = 'property-images');

-- DELETE: Permettre aux utilisateurs de supprimer leurs images
CREATE POLICY "Users can delete property images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'property-images');

-- ============================================
-- 3. POLITIQUES RLS POUR avatars
-- ============================================

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public can read avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete avatars" ON storage.objects;

-- INSERT: Permettre aux utilisateurs authentifiés d'uploader
CREATE POLICY "Users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- SELECT: Permettre au public de lire
CREATE POLICY "Public can read avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- UPDATE: Permettre aux utilisateurs de mettre à jour leur avatar
CREATE POLICY "Users can update avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');

-- DELETE: Permettre aux utilisateurs de supprimer leur avatar
CREATE POLICY "Users can delete avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');

-- ============================================
-- 4. VÉRIFICATION
-- ============================================

-- Vérifier que les buckets existent
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id IN ('property-images', 'avatars');

-- Vérifier les politiques
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%property%' OR policyname LIKE '%avatar%';

-- ============================================
-- FIN DU SCRIPT
-- ============================================

