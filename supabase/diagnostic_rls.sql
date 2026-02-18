-- ============================================
-- NIUMBA - Diagnostic RLS
-- Exécutez ce script pour voir ce qui se passe
-- ============================================

-- 1. Vérifier quelles tables existent
SELECT 
  'Tables existantes' as info,
  tablename,
  CASE WHEN rowsecurity THEN 'RLS Activé' ELSE 'RLS Désactivé' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'properties', 'saved_properties', 'inquiries',
    'appointments', 'reviews', 'conversations', 'messages',
    'notifications', 'search_alerts', 'agents', 'cities',
    'price_history', 'property_views'
  )
ORDER BY tablename;

-- 2. Vérifier toutes les tables publiques (pour voir ce qui existe)
SELECT 
  'Toutes les tables' as info,
  tablename,
  CASE WHEN rowsecurity THEN '✅ RLS' ELSE '❌ Pas RLS' END as rls
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 3. Vérifier les policies existantes
SELECT 
  'Policies existantes' as info,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;

-- 4. Compter
SELECT 
  'Résumé' as info,
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public') as total_tables,
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true) as tables_avec_rls,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as total_policies;



