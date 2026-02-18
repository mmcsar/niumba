-- ============================================
-- NIUMBA - Diagnostic Complet
-- Exécutez ce script pour identifier tous les problèmes
-- ============================================

-- 1. Vérifier les tables et RLS
SELECT 
  'Tables & RLS' as verification,
  tablename,
  CASE WHEN rowsecurity THEN '✅ RLS Activé' ELSE '❌ RLS Désactivé' END as rls_status,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = pg_tables.tablename) as nb_policies
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'properties', 'saved_properties', 'inquiries',
    'appointments', 'reviews', 'conversations', 'messages',
    'notifications', 'search_alerts', 'agents', 'cities',
    'price_history', 'property_views'
  )
ORDER BY tablename;

-- 2. Vérifier le bucket Storage
SELECT 
  'Storage Bucket' as verification,
  id,
  name,
  public,
  CASE WHEN public THEN '✅ Public' ELSE '❌ Privé' END as status
FROM storage.buckets
WHERE id = 'property-images';

-- 3. Vérifier les policies Storage
SELECT 
  'Storage Policies' as verification,
  policyname,
  cmd as operation,
  roles
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND (policyname LIKE '%property-images%' OR policyname LIKE '%images%')
ORDER BY policyname;

-- 4. Vérifier les données d'exemple
SELECT 
  'Données Exemple' as verification,
  'properties' as table_name,
  COUNT(*) as count
FROM properties
UNION ALL
SELECT 
  'Données Exemple',
  'profiles',
  COUNT(*)
FROM profiles
UNION ALL
SELECT 
  'Données Exemple',
  'cities',
  COUNT(*)
FROM cities;

-- 5. Vérifier les extensions
SELECT 
  'Extensions' as verification,
  extname as extension_name,
  CASE WHEN extname IN ('uuid-ossp', 'postgis') THEN '✅ Installée' ELSE '⚠️ Manquante' END as status
FROM pg_extension
WHERE extname IN ('uuid-ossp', 'postgis');

-- 6. Résumé des problèmes
DO $$
DECLARE
  tables_count INTEGER;
  policies_count INTEGER;
  bucket_exists BOOLEAN;
  storage_policies_count INTEGER;
  properties_count INTEGER;
BEGIN
  -- Compter les tables avec RLS
  SELECT COUNT(*) INTO tables_count
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename IN (
      'profiles', 'properties', 'saved_properties', 'inquiries',
      'appointments', 'reviews', 'conversations', 'messages',
      'notifications', 'search_alerts', 'agents', 'cities',
      'price_history', 'property_views'
    )
    AND rowsecurity = true;

  -- Compter les policies
  SELECT COUNT(*) INTO policies_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename IN (
      'profiles', 'properties', 'saved_properties', 'inquiries',
      'appointments', 'reviews', 'conversations', 'messages',
      'notifications', 'search_alerts', 'agents', 'cities',
      'price_history', 'property_views'
    );

  -- Vérifier le bucket
  SELECT EXISTS(SELECT 1 FROM storage.buckets WHERE id = 'property-images') INTO bucket_exists;

  -- Compter les policies Storage
  SELECT COUNT(*) INTO storage_policies_count
  FROM pg_policies
  WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND (policyname LIKE '%property-images%' OR policyname LIKE '%images%');

  -- Compter les propriétés
  SELECT COUNT(*) INTO properties_count FROM properties;

  -- Afficher le résumé
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RÉSUMÉ DU DIAGNOSTIC';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables avec RLS activé: % / 14', tables_count;
  RAISE NOTICE 'Policies créées: %', policies_count;
  RAISE NOTICE 'Bucket Storage existe: %', CASE WHEN bucket_exists THEN '✅ OUI' ELSE '❌ NON' END;
  RAISE NOTICE 'Policies Storage: %', storage_policies_count;
  RAISE NOTICE 'Propriétés dans la base: %', properties_count;
  RAISE NOTICE '';
  
  IF tables_count = 14 AND policies_count > 0 AND bucket_exists AND storage_policies_count >= 3 AND properties_count > 0 THEN
    RAISE NOTICE '✅ TOUT EST CONFIGURÉ CORRECTEMENT !';
  ELSE
    RAISE NOTICE '⚠️ IL Y A DES PROBLÈMES À CORRIGER :';
    IF tables_count < 14 THEN
      RAISE NOTICE '  - Certaines tables n''ont pas RLS activé';
    END IF;
    IF policies_count = 0 THEN
      RAISE NOTICE '  - Aucune policy RLS créée';
    END IF;
    IF NOT bucket_exists THEN
      RAISE NOTICE '  - Le bucket Storage "property-images" n''existe pas';
    END IF;
    IF storage_policies_count < 3 THEN
      RAISE NOTICE '  - Les policies Storage ne sont pas toutes créées';
    END IF;
    IF properties_count = 0 THEN
      RAISE NOTICE '  - Aucune propriété dans la base de données';
    END IF;
  END IF;
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
END $$;


