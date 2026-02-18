-- ============================================
-- NIUMBA - Test RLS Positif (Montre ce qui EST configuré)
-- Exécutez ce script pour voir les résultats positifs
-- ============================================

-- ============================================
-- 1. TABLES AVEC RLS ACTIVÉ (Résultats positifs)
-- ============================================
SELECT 
  '✅ Tables avec RLS' as status,
  tablename,
  'RLS Activé' as configuration
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = true
  AND tablename IN (
    'profiles', 'properties', 'saved_properties', 'inquiries',
    'appointments', 'reviews', 'conversations', 'messages',
    'notifications', 'search_alerts', 'agents', 'cities',
    'price_history', 'property_views'
  )
ORDER BY tablename;

-- ============================================
-- 2. POLICIES PAR TABLE (Résultats positifs)
-- ============================================
SELECT 
  '✅ Policies configurées' as status,
  tablename,
  COUNT(*) as nombre_policies,
  STRING_AGG(DISTINCT cmd::text, ', ' ORDER BY cmd::text) as operations
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- ============================================
-- 3. DÉTAIL DES POLICIES (Résultats positifs)
-- ============================================
SELECT 
  '✅ Policy' as status,
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
ORDER BY tablename, cmd;

-- ============================================
-- 4. RÉSUMÉ POSITIF
-- ============================================
SELECT 
  '📊 RÉSUMÉ' as type,
  COUNT(CASE WHEN rowsecurity THEN 1 END) as tables_avec_rls,
  (SELECT COUNT(DISTINCT tablename) FROM pg_policies WHERE schemaname = 'public') as tables_avec_policies,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as total_policies,
  CASE 
    WHEN COUNT(CASE WHEN rowsecurity THEN 1 END) >= 10 
      AND (SELECT COUNT(DISTINCT tablename) FROM pg_policies WHERE schemaname = 'public') >= 10
    THEN '✅ RLS PARFAITEMENT CONFIGURÉ'
    ELSE '⚠️ Configuration incomplète'
  END as verdict
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'properties', 'saved_properties', 'inquiries',
    'appointments', 'reviews', 'conversations', 'messages',
    'notifications', 'search_alerts', 'agents', 'cities',
    'price_history', 'property_views'
  );

-- ============================================
-- 5. EXEMPLE DE POLICY POUR CHAQUE TABLE
-- ============================================
SELECT 
  '🔍 Exemple Policy' as type,
  tablename,
  policyname,
  cmd as operation
FROM pg_policies
WHERE schemaname = 'public'
  AND (tablename, cmd) IN (
    SELECT tablename, MIN(cmd)
    FROM pg_policies
    WHERE schemaname = 'public'
    GROUP BY tablename
  )
ORDER BY tablename;



