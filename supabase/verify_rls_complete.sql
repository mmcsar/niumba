-- ============================================
-- NIUMBA - Vérification Complète du RLS
-- Exécutez ce script dans Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. VÉRIFIER QUE RLS EST ACTIVÉ
-- ============================================
SELECT 
  '🔒 RLS Status' as check_type,
  tablename,
  CASE 
    WHEN rowsecurity THEN '✅ Activé'
    ELSE '❌ DÉSACTIVÉ - À ACTIVER!'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'properties', 'saved_properties', 'inquiries',
    'appointments', 'reviews', 'conversations', 'messages',
    'notifications', 'search_alerts', 'agents', 'cities',
    'price_history', 'property_views'
  )
ORDER BY tablename;

-- ============================================
-- 2. COMPTER LES POLICIES PAR TABLE
-- ============================================
SELECT 
  '📋 Policies Count' as check_type,
  tablename,
  COUNT(*) as policy_count,
  CASE 
    WHEN COUNT(*) = 0 THEN '❌ Aucune policy - CRITIQUE!'
    WHEN COUNT(*) < 2 THEN '⚠️ Policies incomplètes'
    ELSE '✅ Policies OK'
  END as status
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- ============================================
-- 3. LISTER TOUTES LES POLICIES EXISTANTES
-- ============================================
SELECT 
  '📝 Existing Policies' as check_type,
  tablename,
  policyname,
  CASE 
    WHEN cmd = 'SELECT' THEN '📖 Lecture'
    WHEN cmd = 'INSERT' THEN '➕ Insertion'
    WHEN cmd = 'UPDATE' THEN '✏️ Modification'
    WHEN cmd = 'DELETE' THEN '🗑️ Suppression'
    WHEN cmd = 'ALL' THEN '🔐 Tous droits'
    ELSE cmd
  END as operation
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd, policyname;

-- ============================================
-- 4. TABLES SANS RLS ACTIVÉ (PROBLÈME!)
-- ============================================
SELECT 
  '⚠️ SÉCURITÉ' as check_type,
  tablename,
  'RLS non activé - RISQUE DE SÉCURITÉ!' as warning
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'properties', 'saved_properties', 'inquiries',
    'appointments', 'reviews', 'conversations', 'messages',
    'notifications', 'search_alerts', 'agents', 'cities',
    'price_history', 'property_views'
  )
  AND rowsecurity = false
ORDER BY tablename;

-- ============================================
-- 5. TABLES SANS POLICIES (RLS activé mais pas de règles)
-- ============================================
SELECT 
  '⚠️ CONFIGURATION' as check_type,
  t.tablename,
  'RLS activé mais aucune policy - ACCÈS BLOQUÉ!' as warning
FROM pg_tables t
WHERE t.schemaname = 'public'
  AND t.rowsecurity = true
  AND t.tablename IN (
    'profiles', 'properties', 'saved_properties', 'inquiries',
    'appointments', 'reviews', 'conversations', 'messages',
    'notifications', 'search_alerts', 'agents', 'cities',
    'price_history', 'property_views'
  )
  AND NOT EXISTS (
    SELECT 1 FROM pg_policies p 
    WHERE p.schemaname = 'public' 
    AND p.tablename = t.tablename
  )
ORDER BY t.tablename;

-- ============================================
-- 6. RÉSUMÉ GLOBAL
-- ============================================
SELECT 
  '📊 RÉSUMÉ GLOBAL' as check_type,
  COUNT(CASE WHEN rowsecurity THEN 1 END) as tables_with_rls,
  COUNT(CASE WHEN NOT rowsecurity THEN 1 END) as tables_without_rls,
  (SELECT COUNT(DISTINCT tablename) FROM pg_policies WHERE schemaname = 'public') as tables_with_policies,
  CASE 
    WHEN COUNT(CASE WHEN NOT rowsecurity THEN 1 END) > 0 
      THEN '❌ RLS non activé sur certaines tables'
    WHEN (SELECT COUNT(DISTINCT tablename) FROM pg_policies WHERE schemaname = 'public') < 10
      THEN '⚠️ Policies incomplètes'
    ELSE '✅ RLS correctement configuré'
  END as overall_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'properties', 'saved_properties', 'inquiries',
    'appointments', 'reviews', 'conversations', 'messages',
    'notifications', 'search_alerts', 'agents', 'cities',
    'price_history', 'property_views'
  );

-- ============================================
-- 7. DÉTAIL DES POLICIES PAR TABLE
-- ============================================
SELECT 
  '🔍 Détail Policies' as check_type,
  tablename,
  STRING_AGG(DISTINCT cmd::text, ', ' ORDER BY cmd::text) as operations_available,
  COUNT(*) as total_policies
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- ============================================
-- 8. TEST RAPIDE : Vérifier une table spécifique
-- ============================================
SELECT 
  '🧪 TEST' as check_type,
  'properties' as table_tested,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename = 'properties' 
      AND rowsecurity = true
    ) THEN '✅ RLS activé'
    ELSE '❌ RLS non activé'
  END as rls_status,
  (
    SELECT COUNT(*) 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'properties'
  ) as policies_count;



