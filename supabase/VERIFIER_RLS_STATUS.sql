-- ============================================
-- NIUMBA - Vérification du Statut RLS
-- Exécutez ce script dans Supabase SQL Editor
-- ============================================

-- 1. Vérifier si RLS est activé sur les tables
SELECT 
  '🔒 Statut RLS' as verification_type,
  tablename,
  CASE 
    WHEN rowsecurity THEN '✅ RLS Activé'
    ELSE '❌ RLS Désactivé - ACTION REQUISE'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'properties', 'saved_properties', 'inquiries',
    'appointments', 'reviews', 'conversations', 'messages',
    'notifications', 'search_alerts', 'agents', 'cities',
    'price_history', 'property_views'
  )
ORDER BY 
  CASE WHEN rowsecurity THEN 0 ELSE 1 END,
  tablename;

-- 2. Compter les policies par table
SELECT 
  '📋 Policies' as verification_type,
  tablename,
  COUNT(*) as nb_policies,
  CASE 
    WHEN COUNT(*) = 0 THEN '❌ AUCUNE POLICY - CRITIQUE'
    WHEN COUNT(*) < 2 THEN '⚠️  Peu de policies'
    ELSE '✅ Policies configurées'
  END as status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'properties', 'saved_properties', 'inquiries',
    'appointments', 'reviews', 'conversations', 'messages',
    'notifications', 'search_alerts', 'agents', 'cities',
    'price_history', 'property_views'
  )
GROUP BY tablename
ORDER BY 
  CASE WHEN COUNT(*) = 0 THEN 0 ELSE 1 END,
  tablename;

-- 3. Résumé global
SELECT 
  '📊 Résumé' as verification_type,
  COUNT(CASE WHEN rowsecurity THEN 1 END) as tables_with_rls,
  COUNT(*) as total_tables,
  CASE 
    WHEN COUNT(CASE WHEN rowsecurity THEN 1 END) = COUNT(*) THEN '✅ TOUT EST CONFIGURÉ'
    WHEN COUNT(CASE WHEN rowsecurity THEN 1 END) = 0 THEN '❌ RLS NON CONFIGURÉ - ACTION URGENTE'
    ELSE '⚠️  CONFIGURATION INCOMPLÈTE'
  END as status_global
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'properties', 'saved_properties', 'inquiries',
    'appointments', 'reviews', 'conversations', 'messages',
    'notifications', 'search_alerts', 'agents', 'cities',
    'price_history', 'property_views'
  );

-- 4. Instructions selon le résultat
DO $$
DECLARE
  rls_count INTEGER;
  total_count INTEGER;
BEGIN
  SELECT 
    COUNT(CASE WHEN rowsecurity THEN 1 END),
    COUNT(*)
  INTO rls_count, total_count
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename IN (
      'profiles', 'properties', 'saved_properties', 'inquiries',
      'appointments', 'reviews', 'conversations', 'messages',
      'notifications', 'search_alerts', 'agents', 'cities',
      'price_history', 'property_views'
    );

  IF rls_count = 0 THEN
    RAISE NOTICE '';
    RAISE NOTICE '❌ RLS N''EST PAS ENCORE CONFIGURÉ';
    RAISE NOTICE '';
    RAISE NOTICE '🔴 ACTION URGENTE REQUISE:';
    RAISE NOTICE '   1. Exécutez: supabase/SECURITE_SUPABASE_COMPLETE.sql';
    RAISE NOTICE '   2. Vérifiez avec ce script à nouveau';
    RAISE NOTICE '';
  ELSIF rls_count < total_count THEN
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  CONFIGURATION INCOMPLÈTE';
    RAISE NOTICE '   % tables avec RLS sur % total', rls_count, total_count;
    RAISE NOTICE '   Exécutez: supabase/SECURITE_SUPABASE_COMPLETE.sql';
    RAISE NOTICE '';
  ELSE
    RAISE NOTICE '';
    RAISE NOTICE '✅ RLS EST CONFIGURÉ CORRECTEMENT!';
    RAISE NOTICE '   Toutes les tables ont RLS activé';
    RAISE NOTICE '';
  END IF;
END $$;


