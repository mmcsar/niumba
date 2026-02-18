-- ============================================
-- NIUMBA - RLS ÉTAPE PAR ÉTAPE
-- Version ultra-simplifiée
-- Exécutez chaque section séparément si nécessaire
-- ============================================

-- ============================================
-- ÉTAPE 1 : Activer RLS sur les tables (une par une)
-- ============================================

-- Si une table n'existe pas, ignorez l'erreur et continuez

ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS properties ENABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS saved_properties ENABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS inquiries ENABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS appointments ENABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS reviews ENABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS conversations ENABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS messages ENABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS search_alerts ENABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS agents ENABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS cities ENABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS price_history ENABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS property_views ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ÉTAPE 2 : Policies pour PROFILES
-- ============================================

DROP POLICY IF EXISTS "profiles_select_public" ON profiles;
CREATE POLICY "profiles_select_public" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles 
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- ÉTAPE 3 : Policies pour PROPERTIES
-- ============================================

DROP POLICY IF EXISTS "properties_select_public" ON properties;
CREATE POLICY "properties_select_public" ON properties 
  FOR SELECT USING (
    status = 'active' 
    OR owner_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "properties_insert_authenticated" ON properties;
CREATE POLICY "properties_insert_authenticated" ON properties 
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = owner_id
  );

DROP POLICY IF EXISTS "properties_update_own" ON properties;
CREATE POLICY "properties_update_own" ON properties 
  FOR UPDATE USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "properties_delete_own" ON properties;
CREATE POLICY "properties_delete_own" ON properties 
  FOR DELETE USING (auth.uid() = owner_id);

-- ============================================
-- ÉTAPE 4 : Policies pour SAVED_PROPERTIES
-- ============================================

DROP POLICY IF EXISTS "saved_select_authenticated" ON saved_properties;
CREATE POLICY "saved_select_authenticated" ON saved_properties 
  FOR SELECT USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_insert_authenticated" ON saved_properties;
CREATE POLICY "saved_insert_authenticated" ON saved_properties 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_delete_authenticated" ON saved_properties;
CREATE POLICY "saved_delete_authenticated" ON saved_properties 
  FOR DELETE USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- ============================================
-- ÉTAPE 5 : Policies pour INQUIRIES
-- ============================================

DROP POLICY IF EXISTS "inquiries_select_authenticated" ON inquiries;
CREATE POLICY "inquiries_select_authenticated" ON inquiries 
  FOR SELECT USING (
    auth.uid() IS NOT NULL 
    AND (sender_id = auth.uid() OR owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "inquiries_insert_authenticated" ON inquiries;
CREATE POLICY "inquiries_insert_authenticated" ON inquiries 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "inquiries_update_authenticated" ON inquiries;
CREATE POLICY "inquiries_update_authenticated" ON inquiries 
  FOR UPDATE USING (auth.uid() IS NOT NULL AND owner_id = auth.uid())
  WITH CHECK (auth.uid() IS NOT NULL AND owner_id = auth.uid());

-- ============================================
-- ÉTAPE 6 : Policies pour APPOINTMENTS
-- ============================================

DROP POLICY IF EXISTS "appointments_select_authenticated" ON appointments;
CREATE POLICY "appointments_select_authenticated" ON appointments 
  FOR SELECT USING (
    auth.uid() IS NOT NULL 
    AND (client_id = auth.uid() OR agent_id = auth.uid())
  );

DROP POLICY IF EXISTS "appointments_insert_authenticated" ON appointments;
CREATE POLICY "appointments_insert_authenticated" ON appointments 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND client_id = auth.uid());

DROP POLICY IF EXISTS "appointments_update_authenticated" ON appointments;
CREATE POLICY "appointments_update_authenticated" ON appointments 
  FOR UPDATE USING (
    auth.uid() IS NOT NULL 
    AND (client_id = auth.uid() OR agent_id = auth.uid())
  )
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND (client_id = auth.uid() OR agent_id = auth.uid())
  );

-- ============================================
-- ÉTAPE 7 : Policies pour REVIEWS
-- ============================================

DROP POLICY IF EXISTS "reviews_select_public" ON reviews;
CREATE POLICY "reviews_select_public" ON reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "reviews_insert_authenticated" ON reviews;
CREATE POLICY "reviews_insert_authenticated" ON reviews 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

DROP POLICY IF EXISTS "reviews_update_own" ON reviews;
CREATE POLICY "reviews_update_own" ON reviews 
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================
-- ÉTAPE 8 : Policies pour CONVERSATIONS
-- ============================================

DROP POLICY IF EXISTS "conversations_select_authenticated" ON conversations;
CREATE POLICY "conversations_select_authenticated" ON conversations 
  FOR SELECT USING (
    auth.uid() IS NOT NULL 
    AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
  );

DROP POLICY IF EXISTS "conversations_insert_authenticated" ON conversations;
CREATE POLICY "conversations_insert_authenticated" ON conversations 
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL 
    AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
  );

-- ============================================
-- ÉTAPE 9 : Policies pour MESSAGES
-- ============================================

DROP POLICY IF EXISTS "messages_select_authenticated" ON messages;
CREATE POLICY "messages_select_authenticated" ON messages 
  FOR SELECT USING (
    auth.uid() IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM conversations c 
      WHERE c.id = messages.conversation_id 
      AND (c.participant1_id = auth.uid() OR c.participant2_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "messages_insert_authenticated" ON messages;
CREATE POLICY "messages_insert_authenticated" ON messages 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND sender_id = auth.uid());

-- ============================================
-- ÉTAPE 10 : Policies pour NOTIFICATIONS
-- ============================================

DROP POLICY IF EXISTS "notifications_select_authenticated" ON notifications;
CREATE POLICY "notifications_select_authenticated" ON notifications 
  FOR SELECT USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_update_authenticated" ON notifications;
CREATE POLICY "notifications_update_authenticated" ON notifications 
  FOR UPDATE USING (auth.uid() IS NOT NULL AND user_id = auth.uid())
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- ============================================
-- ÉTAPE 11 : Policies pour SEARCH_ALERTS
-- ============================================

DROP POLICY IF EXISTS "search_alerts_select_authenticated" ON search_alerts;
CREATE POLICY "search_alerts_select_authenticated" ON search_alerts 
  FOR SELECT USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

DROP POLICY IF EXISTS "search_alerts_insert_authenticated" ON search_alerts;
CREATE POLICY "search_alerts_insert_authenticated" ON search_alerts 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

DROP POLICY IF EXISTS "search_alerts_delete_authenticated" ON search_alerts;
CREATE POLICY "search_alerts_delete_authenticated" ON search_alerts 
  FOR DELETE USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- ============================================
-- ÉTAPE 12 : Policies pour AGENTS
-- ============================================

DROP POLICY IF EXISTS "agents_select_public" ON agents;
CREATE POLICY "agents_select_public" ON agents 
  FOR SELECT USING (is_active = true OR user_id = auth.uid());

DROP POLICY IF EXISTS "agents_upsert_own" ON agents;
CREATE POLICY "agents_upsert_own" ON agents 
  FOR ALL USING (auth.uid() IS NOT NULL AND user_id = auth.uid())
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- ============================================
-- ÉTAPE 13 : Policies pour CITIES
-- ============================================

DROP POLICY IF EXISTS "cities_select_public" ON cities;
CREATE POLICY "cities_select_public" ON cities FOR SELECT USING (true);

-- ============================================
-- ÉTAPE 14 : Policies pour PRICE_HISTORY
-- ============================================

DROP POLICY IF EXISTS "price_history_select_public" ON price_history;
CREATE POLICY "price_history_select_public" ON price_history FOR SELECT USING (true);

-- ============================================
-- ÉTAPE 15 : Policies pour PROPERTY_VIEWS
-- ============================================

DROP POLICY IF EXISTS "property_views_insert_public" ON property_views;
CREATE POLICY "property_views_insert_public" ON property_views 
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "property_views_select_owner" ON property_views;
CREATE POLICY "property_views_select_owner" ON property_views 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties p 
      WHERE p.id = property_views.property_id 
      AND p.owner_id = auth.uid()
    )
  );

-- ============================================
-- VÉRIFICATION
-- ============================================

SELECT 
  tablename,
  CASE WHEN rowsecurity THEN '✅ RLS Activé' ELSE '❌ RLS Désactivé' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'properties', 'saved_properties', 'inquiries', 'appointments', 'reviews')
ORDER BY tablename;


