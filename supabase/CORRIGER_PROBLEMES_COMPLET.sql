-- ============================================
-- NIUMBA - Corriger Tous les Problèmes (VERSION COMPLÈTE)
-- Ce script vérifie AVANT de créer, donc pas d'erreur "already exists"
-- ============================================

-- 1. Activer RLS sur toutes les tables
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

-- ============================================
-- 2. POLICIES POUR PROFILES
-- ============================================

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

-- ============================================
-- 3. POLICIES POUR PROPERTIES
-- ============================================

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

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'properties' AND policyname = 'properties_delete_own') THEN
    CREATE POLICY "properties_delete_own" ON properties 
      FOR DELETE USING (auth.uid() = owner_id);
  END IF;
END $$;

-- ============================================
-- 4. POLICIES POUR SAVED_PROPERTIES
-- ============================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'saved_properties' AND policyname = 'saved_select_authenticated') THEN
    CREATE POLICY "saved_select_authenticated" ON saved_properties 
      FOR SELECT USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'saved_properties' AND policyname = 'saved_insert_authenticated') THEN
    CREATE POLICY "saved_insert_authenticated" ON saved_properties 
      FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'saved_properties' AND policyname = 'saved_delete_authenticated') THEN
    CREATE POLICY "saved_delete_authenticated" ON saved_properties 
      FOR DELETE USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);
  END IF;
END $$;

-- ============================================
-- 5. POLICIES POUR INQUIRIES
-- ============================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'inquiries' AND policyname = 'inquiries_select_authenticated') THEN
    CREATE POLICY "inquiries_select_authenticated" ON inquiries 
      FOR SELECT USING (
        auth.uid() IS NOT NULL 
        AND (sender_id = auth.uid() OR owner_id = auth.uid())
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'inquiries' AND policyname = 'inquiries_insert_authenticated') THEN
    CREATE POLICY "inquiries_insert_authenticated" ON inquiries 
      FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'inquiries' AND policyname = 'inquiries_update_authenticated') THEN
    CREATE POLICY "inquiries_update_authenticated" ON inquiries 
      FOR UPDATE USING (auth.uid() IS NOT NULL AND owner_id = auth.uid())
      WITH CHECK (auth.uid() IS NOT NULL AND owner_id = auth.uid());
  END IF;
END $$;

-- ============================================
-- 6. POLICIES POUR APPOINTMENTS
-- ============================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'appointments' AND policyname = 'appointments_select_authenticated') THEN
    CREATE POLICY "appointments_select_authenticated" ON appointments 
      FOR SELECT USING (
        auth.uid() IS NOT NULL 
        AND (client_id = auth.uid() OR agent_id = auth.uid())
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'appointments' AND policyname = 'appointments_insert_authenticated') THEN
    CREATE POLICY "appointments_insert_authenticated" ON appointments 
      FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND client_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'appointments' AND policyname = 'appointments_update_authenticated') THEN
    CREATE POLICY "appointments_update_authenticated" ON appointments 
      FOR UPDATE USING (
        auth.uid() IS NOT NULL 
        AND (client_id = auth.uid() OR agent_id = auth.uid())
      )
      WITH CHECK (
        auth.uid() IS NOT NULL 
        AND (client_id = auth.uid() OR agent_id = auth.uid())
      );
  END IF;
END $$;

-- ============================================
-- 7. POLICIES POUR REVIEWS
-- ============================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reviews' AND policyname = 'reviews_select_public') THEN
    CREATE POLICY "reviews_select_public" ON reviews FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reviews' AND policyname = 'reviews_insert_authenticated') THEN
    CREATE POLICY "reviews_insert_authenticated" ON reviews 
      FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reviews' AND policyname = 'reviews_update_own') THEN
    CREATE POLICY "reviews_update_own" ON reviews 
      FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================
-- 8. POLICIES POUR CONVERSATIONS
-- ============================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'conversations' AND policyname = 'conversations_select_authenticated') THEN
    CREATE POLICY "conversations_select_authenticated" ON conversations 
      FOR SELECT USING (
        auth.uid() IS NOT NULL 
        AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'conversations' AND policyname = 'conversations_insert_authenticated') THEN
    CREATE POLICY "conversations_insert_authenticated" ON conversations 
      FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL 
        AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
      );
  END IF;
END $$;

-- ============================================
-- 9. POLICIES POUR MESSAGES
-- ============================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'messages' AND policyname = 'messages_select_authenticated') THEN
    CREATE POLICY "messages_select_authenticated" ON messages 
      FOR SELECT USING (
        auth.uid() IS NOT NULL 
        AND EXISTS (
          SELECT 1 FROM conversations c 
          WHERE c.id = messages.conversation_id 
          AND (c.participant1_id = auth.uid() OR c.participant2_id = auth.uid())
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'messages' AND policyname = 'messages_insert_authenticated') THEN
    CREATE POLICY "messages_insert_authenticated" ON messages 
      FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND sender_id = auth.uid());
  END IF;
END $$;

-- ============================================
-- 10. POLICIES POUR NOTIFICATIONS
-- ============================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'notifications' AND policyname = 'notifications_select_authenticated') THEN
    CREATE POLICY "notifications_select_authenticated" ON notifications 
      FOR SELECT USING (auth.uid() IS NOT NULL AND user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'notifications' AND policyname = 'notifications_update_authenticated') THEN
    CREATE POLICY "notifications_update_authenticated" ON notifications 
      FOR UPDATE USING (auth.uid() IS NOT NULL AND user_id = auth.uid())
      WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());
  END IF;
END $$;

-- ============================================
-- 11. POLICIES POUR SEARCH_ALERTS
-- ============================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'search_alerts' AND policyname = 'search_alerts_select_authenticated') THEN
    CREATE POLICY "search_alerts_select_authenticated" ON search_alerts 
      FOR SELECT USING (auth.uid() IS NOT NULL AND user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'search_alerts' AND policyname = 'search_alerts_insert_authenticated') THEN
    CREATE POLICY "search_alerts_insert_authenticated" ON search_alerts 
      FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'search_alerts' AND policyname = 'search_alerts_delete_authenticated') THEN
    CREATE POLICY "search_alerts_delete_authenticated" ON search_alerts 
      FOR DELETE USING (auth.uid() IS NOT NULL AND user_id = auth.uid());
  END IF;
END $$;

-- ============================================
-- 12. POLICIES POUR AGENTS
-- ============================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'agents' AND policyname = 'agents_select_public') THEN
    CREATE POLICY "agents_select_public" ON agents 
      FOR SELECT USING (is_active = true OR user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'agents' AND policyname = 'agents_upsert_own') THEN
    CREATE POLICY "agents_upsert_own" ON agents 
      FOR ALL USING (auth.uid() IS NOT NULL AND user_id = auth.uid())
      WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());
  END IF;
END $$;

-- ============================================
-- 13. POLICIES POUR CITIES
-- ============================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'cities' AND policyname = 'cities_select_public') THEN
    CREATE POLICY "cities_select_public" ON cities FOR SELECT USING (true);
  END IF;
END $$;

-- ============================================
-- 14. POLICIES POUR PRICE_HISTORY
-- ============================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'price_history' AND policyname = 'price_history_select_public') THEN
    CREATE POLICY "price_history_select_public" ON price_history FOR SELECT USING (true);
  END IF;
END $$;

-- ============================================
-- 15. POLICIES POUR PROPERTY_VIEWS
-- ============================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'property_views' AND policyname = 'property_views_insert_public') THEN
    CREATE POLICY "property_views_insert_public" ON property_views 
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'property_views' AND policyname = 'property_views_select_owner') THEN
    CREATE POLICY "property_views_select_owner" ON property_views 
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM properties p 
          WHERE p.id = property_views.property_id 
          AND p.owner_id = auth.uid()
        )
      );
  END IF;
END $$;

-- ============================================
-- 16. MESSAGE DE CONFIRMATION
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ RLS activé sur toutes les tables !';
  RAISE NOTICE '✅ Toutes les policies créées/vérifiées !';
  RAISE NOTICE '✅ Problèmes corrigés !';
  RAISE NOTICE '';
END $$;


