-- NIUMBA - Corriger Tous les Problèmes (Sans Erreur)
-- Ce script vérifie et corrige seulement ce qui manque

-- 1. Activer RLS sur toutes les tables (seulement si pas déjà activé)
DO $$
DECLARE
  table_name TEXT;
  tables_to_check TEXT[] := ARRAY[
    'profiles', 'properties', 'saved_properties', 'inquiries',
    'appointments', 'reviews', 'conversations', 'messages',
    'notifications', 'search_alerts', 'agents', 'cities',
    'price_history', 'property_views'
  ];
BEGIN
  FOREACH table_name IN ARRAY tables_to_check
  LOOP
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = table_name) THEN
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
    END IF;
  END LOOP;
END $$;

-- 2. Créer les policies manquantes pour profiles (seulement si elles n'existent pas)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'profiles_select_all') THEN
    CREATE POLICY "profiles_select_all" ON profiles FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'profiles_update_own') THEN
    CREATE POLICY "profiles_update_own" ON profiles 
      FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'profiles_insert_own') THEN
    CREATE POLICY "profiles_insert_own" ON profiles 
      FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- 3. Créer les policies manquantes pour properties
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'properties' AND policyname = 'properties_select_public') THEN
    CREATE POLICY "properties_select_public" ON properties 
      FOR SELECT USING (
        status = 'active' 
        OR owner_id = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'properties' AND policyname = 'properties_insert_authenticated') THEN
    CREATE POLICY "properties_insert_authenticated" ON properties 
      FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
        AND auth.uid() = owner_id
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'properties' AND policyname = 'properties_update_own') THEN
    CREATE POLICY "properties_update_own" ON properties 
      FOR UPDATE USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
  END IF;
END $$;

-- 4. Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '✅ RLS activé sur toutes les tables !';
  RAISE NOTICE '✅ Policies créées pour les tables principales !';
  RAISE NOTICE '✅ Problèmes corrigés !';
END $$;


