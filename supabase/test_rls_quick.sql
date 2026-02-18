-- ============================================
-- NIUMBA - Test RLS Rapide
-- Vérification en 30 secondes
-- ============================================

-- Test 1 : RLS activé ?
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN '✅' ELSE '❌' END as rls
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'properties', 'saved_properties', 'inquiries', 'appointments', 'reviews')
ORDER BY tablename;

-- Test 2 : Policies existantes ?
SELECT 
  tablename,
  COUNT(*) as policies
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- Test 3 : Résumé
SELECT 
  COUNT(CASE WHEN rowsecurity THEN 1 END) as tables_with_rls,
  (SELECT COUNT(DISTINCT tablename) FROM pg_policies WHERE schemaname = 'public') as tables_with_policies,
  CASE 
    WHEN COUNT(CASE WHEN rowsecurity THEN 1 END) >= 10 
      AND (SELECT COUNT(DISTINCT tablename) FROM pg_policies WHERE schemaname = 'public') >= 10
    THEN '✅ RLS Configuré Correctement'
    ELSE '⚠️ Vérification nécessaire'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'properties', 'saved_properties', 'inquiries', 'appointments', 'reviews', 'conversations', 'messages', 'notifications', 'search_alerts');



