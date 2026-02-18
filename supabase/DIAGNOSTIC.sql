-- ============================================
-- NIUMBA - DIAGNOSTIC
-- Exécutez ce script pour voir ce qui existe
-- ============================================

-- 1. Vérifier quelles tables existent
SELECT 
  'Tables existantes' as info,
  tablename,
  CASE WHEN rowsecurity THEN 'RLS Activé' ELSE 'RLS Désactivé' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Vérifier les permissions
SELECT 
  'Permissions' as info,
  current_user as user_actuel,
  current_database() as database_actuelle;

-- 3. Vérifier les policies existantes
SELECT 
  'Policies existantes' as info,
  tablename,
  policyname,
  cmd as operation
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;


