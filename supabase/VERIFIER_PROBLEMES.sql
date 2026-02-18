-- NIUMBA - Vérifier les Problèmes Supabase
-- Exécute ce script pour voir les 43 problèmes

-- 1. Tables sans RLS activé
SELECT 
  '❌ RLS non activé' as probleme,
  tablename,
  'Activez RLS avec: ALTER TABLE ' || tablename || ' ENABLE ROW LEVEL SECURITY;' as solution
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

-- 2. Tables sans policies
SELECT 
  '❌ Pas de policies' as probleme,
  t.tablename,
  'Créez des policies pour cette table' as solution
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND p.schemaname = 'public'
WHERE t.schemaname = 'public'
  AND t.tablename IN (
    'profiles', 'properties', 'saved_properties', 'inquiries',
    'appointments', 'reviews', 'conversations', 'messages',
    'notifications', 'search_alerts', 'agents', 'cities',
    'price_history', 'property_views'
  )
GROUP BY t.tablename
HAVING COUNT(p.policyname) = 0
ORDER BY t.tablename;

-- 3. Résumé
SELECT 
  'RÉSUMÉ' as type,
  COUNT(*) FILTER (WHERE rowsecurity = false) as tables_sans_rls,
  (SELECT COUNT(*) FROM (
    SELECT t.tablename
    FROM pg_tables t
    LEFT JOIN pg_policies p ON t.tablename = p.tablename AND p.schemaname = 'public'
    WHERE t.schemaname = 'public'
      AND t.tablename IN (
        'profiles', 'properties', 'saved_properties', 'inquiries',
        'appointments', 'reviews', 'conversations', 'messages',
        'notifications', 'search_alerts', 'agents', 'cities',
        'price_history', 'property_views'
      )
    GROUP BY t.tablename
    HAVING COUNT(p.policyname) = 0
  ) subquery) as tables_sans_policies
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'properties', 'saved_properties', 'inquiries',
    'appointments', 'reviews', 'conversations', 'messages',
    'notifications', 'search_alerts', 'agents', 'cities',
    'price_history', 'property_views'
  );


