-- ============================================
-- NIUMBA - Vérifier les Tables de l'Application
-- Ignore les tables système comme spatial_ref_sys
-- ============================================

-- Vérifier si les tables de l'application existent
SELECT 
  'Tables de l''application' as type,
  tablename,
  CASE WHEN rowsecurity THEN '✅ RLS Activé' ELSE '❌ RLS Désactivé' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 
    'properties', 
    'saved_properties', 
    'inquiries',
    'appointments', 
    'reviews', 
    'conversations', 
    'messages',
    'notifications', 
    'search_alerts', 
    'agents', 
    'cities',
    'price_history', 
    'property_views'
  )
ORDER BY tablename;

-- Si cette requête ne retourne rien, les tables n'existent pas encore !
-- Dans ce cas, il faut d'abord exécuter : supabase/schema.sql



