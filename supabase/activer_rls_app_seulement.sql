-- ============================================
-- NIUMBA - Activer RLS UNIQUEMENT sur les tables de l'application
-- Ignore les tables système (spatial_ref_sys, etc.)
-- ============================================

-- Activer RLS sur les tables de l'application uniquement
-- (Ignore spatial_ref_sys qui est une table système PostGIS)

DO $$
DECLARE
  table_name TEXT;
  tables_to_activate TEXT[] := ARRAY[
    'profiles', 
    'properties', 
    'saved_properties', 
    'inquiries',
    'notifications', 
    'appointments', 
    'reviews', 
    'conversations', 
    'messages',
    'search_alerts', 
    'property_views', 
    'agents', 
    'cities',
    'price_history'
  ];
BEGIN
  FOREACH table_name IN ARRAY tables_to_activate
  LOOP
    -- Vérifier que la table existe avant d'activer RLS
    IF EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename = table_name
    ) THEN
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
      RAISE NOTICE 'RLS activé sur: %', table_name;
    ELSE
      RAISE NOTICE 'Table non trouvée: % (peut-être pas encore créée)', table_name;
    END IF;
  END LOOP;
END $$;

-- Vérification après activation
SELECT 
  'Vérification' as type,
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



