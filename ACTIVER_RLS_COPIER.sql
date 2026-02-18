-- ============================================
-- NIUMBA - Activer RLS (Copier-Coller dans Supabase)
-- ============================================

-- ÉTAPE 1: Activer RLS sur toutes les tables
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

-- ÉTAPE 2: Policies PROFILES
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ÉTAPE 3: Policies PROPERTIES
DROP POLICY IF EXISTS "properties_select" ON properties;
DROP POLICY IF EXISTS "properties_insert" ON properties;
DROP POLICY IF EXISTS "properties_update" ON properties;
DROP POLICY IF EXISTS "properties_delete" ON properties;
CREATE POLICY "properties_select" ON properties FOR SELECT USING (true);
CREATE POLICY "properties_insert" ON properties FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "properties_update" ON properties FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "properties_delete" ON properties FOR DELETE USING (auth.uid() = owner_id);

-- ÉTAPE 4: Policies SAVED_PROPERTIES
DROP POLICY IF EXISTS "saved_properties_select" ON saved_properties;
DROP POLICY IF EXISTS "saved_properties_insert" ON saved_properties;
DROP POLICY IF EXISTS "saved_properties_delete" ON saved_properties;
CREATE POLICY "saved_properties_select" ON saved_properties FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "saved_properties_insert" ON saved_properties FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "saved_properties_delete" ON saved_properties FOR DELETE USING (auth.uid() = user_id);

-- ÉTAPE 5: Policies INQUIRIES
DROP POLICY IF EXISTS "inquiries_select" ON inquiries;
DROP POLICY IF EXISTS "inquiries_insert" ON inquiries;
DROP POLICY IF EXISTS "inquiries_update" ON inquiries;
CREATE POLICY "inquiries_select" ON inquiries FOR SELECT USING (auth.uid() = user_id OR auth.uid() = owner_id);
CREATE POLICY "inquiries_insert" ON inquiries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "inquiries_update" ON inquiries FOR UPDATE USING (auth.uid() = owner_id);

-- ÉTAPE 6: Policies APPOINTMENTS
DROP POLICY IF EXISTS "appointments_select" ON appointments;
DROP POLICY IF EXISTS "appointments_insert" ON appointments;
DROP POLICY IF EXISTS "appointments_update" ON appointments;
CREATE POLICY "appointments_select" ON appointments FOR SELECT USING (auth.uid() = user_id OR auth.uid() = owner_id);
CREATE POLICY "appointments_insert" ON appointments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "appointments_update" ON appointments FOR UPDATE USING (auth.uid() IN (user_id, owner_id));

-- ÉTAPE 7: Policies REVIEWS
DROP POLICY IF EXISTS "reviews_select" ON reviews;
DROP POLICY IF EXISTS "reviews_insert" ON reviews;
DROP POLICY IF EXISTS "reviews_update" ON reviews;
DROP POLICY IF EXISTS "reviews_delete" ON reviews;
CREATE POLICY "reviews_select" ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_update" ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "reviews_delete" ON reviews FOR DELETE USING (auth.uid() = user_id);

-- ÉTAPE 8: Policies CONVERSATIONS
DROP POLICY IF EXISTS "conversations_select" ON conversations;
DROP POLICY IF EXISTS "conversations_insert" ON conversations;
CREATE POLICY "conversations_select" ON conversations FOR SELECT USING (auth.uid() IN (participant1_id, participant2_id));
CREATE POLICY "conversations_insert" ON conversations FOR INSERT WITH CHECK (auth.uid() IN (participant1_id, participant2_id));

-- ÉTAPE 9: Policies MESSAGES
DROP POLICY IF EXISTS "messages_select" ON messages;
DROP POLICY IF EXISTS "messages_insert" ON messages;
CREATE POLICY "messages_select" ON messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM conversations WHERE id = messages.conversation_id AND auth.uid() IN (participant1_id, participant2_id))
);
CREATE POLICY "messages_insert" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- ÉTAPE 10: Policies NOTIFICATIONS
DROP POLICY IF EXISTS "notifications_select" ON notifications;
DROP POLICY IF EXISTS "notifications_update" ON notifications;
CREATE POLICY "notifications_select" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- ÉTAPE 11: Policies SEARCH_ALERTS
DROP POLICY IF EXISTS "search_alerts_all" ON search_alerts;
CREATE POLICY "search_alerts_all" ON search_alerts FOR ALL USING (auth.uid() = user_id);

-- ÉTAPE 12: Policies CITIES & AGENTS (lecture publique)
DROP POLICY IF EXISTS "cities_select" ON cities;
DROP POLICY IF EXISTS "agents_select" ON agents;
CREATE POLICY "cities_select" ON cities FOR SELECT USING (true);
CREATE POLICY "agents_select" ON agents FOR SELECT USING (true);

-- ÉTAPE 13: Policies PRICE_HISTORY & PROPERTY_VIEWS
DROP POLICY IF EXISTS "price_history_select" ON price_history;
DROP POLICY IF EXISTS "property_views_insert" ON property_views;
CREATE POLICY "price_history_select" ON price_history FOR SELECT USING (true);
CREATE POLICY "property_views_insert" ON property_views FOR INSERT WITH CHECK (true);

-- ============================================
-- VÉRIFICATION FINALE
-- ============================================
SELECT 
  tablename as "Table",
  CASE WHEN rowsecurity THEN '✅ RLS OK' ELSE '❌ RLS NON' END as "Statut"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'properties', 'saved_properties', 'inquiries', 'appointments', 'reviews', 'conversations', 'messages', 'notifications')
ORDER BY tablename;



