-- ============================================
-- NIUMBA - Vérification RLS Rapide
-- Copiez et exécutez dans Supabase SQL Editor
-- ============================================

-- 1. Vérifier les tables de l'application (ignore spatial_ref_sys)
SELECT 
  tablename as "Table",
  CASE WHEN rowsecurity THEN '✅ RLS Activé' ELSE '❌ RLS Désactivé' END as "Statut RLS"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'properties', 'saved_properties', 'inquiries',
    'appointments', 'reviews', 'conversations', 'messages',
    'notifications', 'search_alerts', 'agents', 'cities',
    'price_history', 'property_views'
  )
ORDER BY tablename;

-- 2. Compter les policies
SELECT 
  tablename as "Table",
  COUNT(*) as "Nombre Policies"
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- 3. Résumé rapide
SELECT 
  '📊 Résumé' as "Type",
  COUNT(CASE WHEN rowsecurity THEN 1 END) as "Tables avec RLS",
  (SELECT COUNT(DISTINCT tablename) FROM pg_policies WHERE schemaname = 'public') as "Tables avec Policies",
  CASE 
    WHEN COUNT(CASE WHEN rowsecurity THEN 1 END) >= 10 THEN '✅ RLS OK'
    WHEN COUNT(CASE WHEN rowsecurity THEN 1 END) > 0 THEN '⚠️ RLS Partiel'
    ELSE '❌ RLS Non Activé'
  END as "Verdict"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'properties', 'saved_properties', 'inquiries', 'appointments', 'reviews', 'conversations', 'messages', 'notifications', 'search_alerts', 'agents', 'cities');



