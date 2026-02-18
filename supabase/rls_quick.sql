-- ============================================
-- NIUMBA - RLS Quick Setup (Version Simplifiée)
-- Exécutez ce script dans SQL Editor si rls_with_auth.sql est trop long
-- ============================================

-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES - Policies de base
-- ============================================
CREATE POLICY "profiles_select_public" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- PROPERTIES - Policies de base
-- ============================================
CREATE POLICY "properties_select_public" ON properties
  FOR SELECT USING (
    status = 'active' 
    OR owner_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "properties_insert_authenticated" ON properties
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = owner_id
  );

CREATE POLICY "properties_update_own" ON properties
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "properties_delete_own" ON properties
  FOR DELETE USING (auth.uid() = owner_id);

-- ============================================
-- SAVED_PROPERTIES - Favoris (COMPTE REQUIS)
-- ============================================
CREATE POLICY "saved_select_authenticated" ON saved_properties
  FOR SELECT USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "saved_insert_authenticated" ON saved_properties
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "saved_delete_authenticated" ON saved_properties
  FOR DELETE USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- ============================================
-- INQUIRIES - Demandes (COMPTE REQUIS)
-- ============================================
CREATE POLICY "inquiries_select_authenticated" ON inquiries
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (auth.uid() = sender_id OR auth.uid() = owner_id)
  );

CREATE POLICY "inquiries_insert_authenticated" ON inquiries
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = sender_id
  );

CREATE POLICY "inquiries_update_owner" ON inquiries
  FOR UPDATE USING (auth.uid() = owner_id);

-- ============================================
-- APPOINTMENTS - Rendez-vous (COMPTE REQUIS)
-- ============================================
CREATE POLICY "appointments_select_authenticated" ON appointments
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (
      auth.uid() = client_id 
      OR auth.uid() = agent_id
      OR EXISTS (SELECT 1 FROM properties WHERE id = property_id AND owner_id = auth.uid())
    )
  );

CREATE POLICY "appointments_insert_authenticated" ON appointments
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = client_id
  );

CREATE POLICY "appointments_update_authenticated" ON appointments
  FOR UPDATE USING (
    auth.uid() IS NOT NULL
    AND (
      auth.uid() = client_id 
      OR auth.uid() = agent_id
      OR EXISTS (SELECT 1 FROM properties WHERE id = property_id AND owner_id = auth.uid())
    )
  );

-- ============================================
-- REVIEWS - Avis
-- ============================================
CREATE POLICY "reviews_select_public" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "reviews_insert_authenticated" ON reviews
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = user_id
  );

CREATE POLICY "reviews_update_own" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- CONVERSATIONS & MESSAGES (COMPTE REQUIS)
-- ============================================
CREATE POLICY "conversations_select_authenticated" ON conversations
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (auth.uid() = participant_1 OR auth.uid() = participant_2)
  );

CREATE POLICY "conversations_insert_authenticated" ON conversations
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND (auth.uid() = participant_1 OR auth.uid() = participant_2)
  );

CREATE POLICY "messages_select_authenticated" ON messages
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM conversations 
      WHERE id = conversation_id 
      AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
    )
  );

CREATE POLICY "messages_insert_authenticated" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = sender_id
  );

-- ============================================
-- NOTIFICATIONS (COMPTE REQUIS)
-- ============================================
CREATE POLICY "notifications_select_authenticated" ON notifications
  FOR SELECT USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "notifications_update_authenticated" ON notifications
  FOR UPDATE USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "notifications_insert_system" ON notifications
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- SEARCH_ALERTS - Alertes (COMPTE REQUIS)
-- ============================================
CREATE POLICY "alerts_select_authenticated" ON search_alerts
  FOR SELECT USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "alerts_insert_authenticated" ON search_alerts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "alerts_update_authenticated" ON search_alerts
  FOR UPDATE USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "alerts_delete_authenticated" ON search_alerts
  FOR DELETE USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- ============================================
-- AGENTS
-- ============================================
CREATE POLICY "agents_select_public" ON agents
  FOR SELECT USING (is_active = true OR user_id = auth.uid());

CREATE POLICY "agents_insert_authenticated" ON agents
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = user_id
  );

-- ============================================
-- CITIES - Villes (Public)
-- ============================================
CREATE POLICY "cities_select_public" ON cities
  FOR SELECT USING (true);

-- ============================================
-- PRICE_HISTORY - Historique prix (Public)
-- ============================================
CREATE POLICY "price_history_select_public" ON price_history
  FOR SELECT USING (true);

-- ============================================
-- PROPERTY_VIEWS - Vues (Public insertion)
-- ============================================
CREATE POLICY "views_insert_public" ON property_views
  FOR INSERT WITH CHECK (true);

-- ✅ RLS activé et policies créées !

