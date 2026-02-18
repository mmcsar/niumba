-- ============================================
-- NIUMBA - RLS COMPLET
-- Script unique pour activer toute la sécurité
-- Copiez-collez dans Supabase SQL Editor
-- ============================================

-- ============================================
-- ÉTAPE 1: ACTIVER RLS SUR TOUTES LES TABLES
-- ============================================

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
-- ÉTAPE 2: PROFILES
-- ============================================

DROP POLICY IF EXISTS "profiles_select_public" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;

CREATE POLICY "profiles_select_public" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============================================
-- ÉTAPE 3: PROPERTIES
-- ============================================

DROP POLICY IF EXISTS "properties_select_public" ON properties;
DROP POLICY IF EXISTS "properties_insert_owner" ON properties;
DROP POLICY IF EXISTS "properties_update_owner" ON properties;
DROP POLICY IF EXISTS "properties_delete_owner" ON properties;
DROP POLICY IF EXISTS "properties_select" ON properties;
DROP POLICY IF EXISTS "properties_insert" ON properties;
DROP POLICY IF EXISTS "properties_update" ON properties;
DROP POLICY IF EXISTS "properties_delete" ON properties;

CREATE POLICY "properties_select_public" ON properties FOR SELECT USING (true);
CREATE POLICY "properties_insert_owner" ON properties FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "properties_update_owner" ON properties FOR UPDATE USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "properties_delete_owner" ON properties FOR DELETE USING (auth.uid() = owner_id);

-- ============================================
-- ÉTAPE 4: SAVED_PROPERTIES
-- ============================================

DROP POLICY IF EXISTS "saved_properties_select_own" ON saved_properties;
DROP POLICY IF EXISTS "saved_properties_insert_own" ON saved_properties;
DROP POLICY IF EXISTS "saved_properties_delete_own" ON saved_properties;
DROP POLICY IF EXISTS "saved_properties_select" ON saved_properties;
DROP POLICY IF EXISTS "saved_properties_insert" ON saved_properties;
DROP POLICY IF EXISTS "saved_properties_delete" ON saved_properties;

CREATE POLICY "saved_properties_select_own" ON saved_properties FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "saved_properties_insert_own" ON saved_properties FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "saved_properties_delete_own" ON saved_properties FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- ÉTAPE 5: INQUIRIES
-- ============================================

DROP POLICY IF EXISTS "inquiries_select_parties" ON inquiries;
DROP POLICY IF EXISTS "inquiries_insert_user" ON inquiries;
DROP POLICY IF EXISTS "inquiries_update_owner" ON inquiries;
DROP POLICY IF EXISTS "inquiries_select" ON inquiries;
DROP POLICY IF EXISTS "inquiries_insert" ON inquiries;
DROP POLICY IF EXISTS "inquiries_update" ON inquiries;

CREATE POLICY "inquiries_select_parties" ON inquiries FOR SELECT USING (auth.uid() = user_id OR auth.uid() = owner_id);
CREATE POLICY "inquiries_insert_user" ON inquiries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "inquiries_update_owner" ON inquiries FOR UPDATE USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- ============================================
-- ÉTAPE 6: APPOINTMENTS
-- ============================================

DROP POLICY IF EXISTS "appointments_select_parties" ON appointments;
DROP POLICY IF EXISTS "appointments_insert_user" ON appointments;
DROP POLICY IF EXISTS "appointments_update_parties" ON appointments;
DROP POLICY IF EXISTS "appointments_select" ON appointments;
DROP POLICY IF EXISTS "appointments_insert" ON appointments;
DROP POLICY IF EXISTS "appointments_update" ON appointments;

CREATE POLICY "appointments_select_parties" ON appointments FOR SELECT USING (auth.uid() = user_id OR auth.uid() = owner_id);
CREATE POLICY "appointments_insert_user" ON appointments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "appointments_update_parties" ON appointments FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = owner_id) WITH CHECK (auth.uid() = user_id OR auth.uid() = owner_id);

-- ============================================
-- ÉTAPE 7: REVIEWS
-- ============================================

DROP POLICY IF EXISTS "reviews_select_public" ON reviews;
DROP POLICY IF EXISTS "reviews_insert_auth" ON reviews;
DROP POLICY IF EXISTS "reviews_update_author" ON reviews;
DROP POLICY IF EXISTS "reviews_delete_author" ON reviews;
DROP POLICY IF EXISTS "reviews_select" ON reviews;
DROP POLICY IF EXISTS "reviews_insert" ON reviews;
DROP POLICY IF EXISTS "reviews_update" ON reviews;
DROP POLICY IF EXISTS "reviews_delete" ON reviews;

CREATE POLICY "reviews_select_public" ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_auth" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_update_author" ON reviews FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_delete_author" ON reviews FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- ÉTAPE 8: CONVERSATIONS
-- ============================================

DROP POLICY IF EXISTS "conversations_select_participants" ON conversations;
DROP POLICY IF EXISTS "conversations_insert_participants" ON conversations;
DROP POLICY IF EXISTS "conversations_update_participants" ON conversations;
DROP POLICY IF EXISTS "conversations_select" ON conversations;
DROP POLICY IF EXISTS "conversations_insert" ON conversations;

CREATE POLICY "conversations_select_participants" ON conversations FOR SELECT USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);
CREATE POLICY "conversations_insert_participants" ON conversations FOR INSERT WITH CHECK (auth.uid() = participant1_id OR auth.uid() = participant2_id);
CREATE POLICY "conversations_update_participants" ON conversations FOR UPDATE USING (auth.uid() = participant1_id OR auth.uid() = participant2_id) WITH CHECK (auth.uid() = participant1_id OR auth.uid() = participant2_id);

-- ============================================
-- ÉTAPE 9: MESSAGES
-- ============================================

DROP POLICY IF EXISTS "messages_select_conversation" ON messages;
DROP POLICY IF EXISTS "messages_insert_sender" ON messages;
DROP POLICY IF EXISTS "messages_update_read" ON messages;
DROP POLICY IF EXISTS "messages_select" ON messages;
DROP POLICY IF EXISTS "messages_insert" ON messages;

CREATE POLICY "messages_select_conversation" ON messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND (auth.uid() = c.participant1_id OR auth.uid() = c.participant2_id))
);
CREATE POLICY "messages_insert_sender" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "messages_update_read" ON messages FOR UPDATE USING (
  EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND (auth.uid() = c.participant1_id OR auth.uid() = c.participant2_id))
);

-- ============================================
-- ÉTAPE 10: NOTIFICATIONS
-- ============================================

DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
DROP POLICY IF EXISTS "notifications_insert_system" ON notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
DROP POLICY IF EXISTS "notifications_delete_own" ON notifications;
DROP POLICY IF EXISTS "notifications_select" ON notifications;
DROP POLICY IF EXISTS "notifications_update" ON notifications;

CREATE POLICY "notifications_select_own" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_insert_system" ON notifications FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notifications_delete_own" ON notifications FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- ÉTAPE 11: SEARCH_ALERTS
-- ============================================

DROP POLICY IF EXISTS "search_alerts_select_own" ON search_alerts;
DROP POLICY IF EXISTS "search_alerts_insert_own" ON search_alerts;
DROP POLICY IF EXISTS "search_alerts_update_own" ON search_alerts;
DROP POLICY IF EXISTS "search_alerts_delete_own" ON search_alerts;
DROP POLICY IF EXISTS "search_alerts_all" ON search_alerts;

CREATE POLICY "search_alerts_select_own" ON search_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "search_alerts_insert_own" ON search_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "search_alerts_update_own" ON search_alerts FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "search_alerts_delete_own" ON search_alerts FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- ÉTAPE 12: CITIES & AGENTS (Public)
-- ============================================

DROP POLICY IF EXISTS "cities_select_public" ON cities;
DROP POLICY IF EXISTS "agents_select_public" ON agents;
DROP POLICY IF EXISTS "cities_select" ON cities;
DROP POLICY IF EXISTS "agents_select" ON agents;

CREATE POLICY "cities_select_public" ON cities FOR SELECT USING (true);
CREATE POLICY "agents_select_public" ON agents FOR SELECT USING (true);

-- ============================================
-- ÉTAPE 13: PRICE_HISTORY & PROPERTY_VIEWS
-- ============================================

DROP POLICY IF EXISTS "price_history_select_public" ON price_history;
DROP POLICY IF EXISTS "price_history_insert_owner" ON price_history;
DROP POLICY IF EXISTS "property_views_insert_any" ON property_views;
DROP POLICY IF EXISTS "property_views_select_owner" ON property_views;
DROP POLICY IF EXISTS "price_history_select" ON price_history;
DROP POLICY IF EXISTS "property_views_insert" ON property_views;

CREATE POLICY "price_history_select_public" ON price_history FOR SELECT USING (true);
CREATE POLICY "price_history_insert_owner" ON price_history FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM properties p WHERE p.id = price_history.property_id AND p.owner_id = auth.uid())
);
CREATE POLICY "property_views_insert_any" ON property_views FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "property_views_select_owner" ON property_views FOR SELECT USING (
  EXISTS (SELECT 1 FROM properties p WHERE p.id = property_views.property_id AND p.owner_id = auth.uid())
);

-- ============================================
-- VÉRIFICATION FINALE
-- ============================================

SELECT '✅ RLS CONFIGURÉ AVEC SUCCÈS!' as resultat;

SELECT 
  tablename as "Table",
  CASE WHEN rowsecurity THEN '✅' ELSE '❌' END as "RLS",
  (SELECT COUNT(*) FROM pg_policies WHERE pg_policies.tablename = pg_tables.tablename AND schemaname = 'public') as "Policies"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'properties', 'saved_properties', 'inquiries',
    'appointments', 'reviews', 'conversations', 'messages',
    'notifications', 'search_alerts', 'agents', 'cities'
  )
ORDER BY tablename;



