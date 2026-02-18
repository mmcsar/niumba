-- ============================================
-- NIUMBA - Activation RLS Étape par Étape
-- Exécutez chaque section séparément si nécessaire
-- ============================================

-- ============================================
-- ÉTAPE 1 : Vérifier que les tables existent
-- ============================================
-- Exécutez d'abord cette requête pour voir quelles tables existent
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'properties', 'saved_properties')
ORDER BY tablename;

-- Si cette requête ne retourne rien, les tables n'existent pas encore !
-- Dans ce cas, exécutez d'abord : supabase/schema.sql

-- ============================================
-- ÉTAPE 2 : Activer RLS (une table à la fois pour voir les erreurs)
-- ============================================

-- Test avec une seule table d'abord
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Si ça fonctionne, continuez avec les autres :
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
-- ÉTAPE 3 : Vérifier que RLS est activé
-- ============================================
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'profiles';

-- Si rowsecurity = true, c'est bon ! Sinon, il y a une erreur.

-- ============================================
-- ÉTAPE 4 : Créer les policies (une par une)
-- ============================================

-- PROFILES
CREATE POLICY "profiles_select_public" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- PROPERTIES
CREATE POLICY "properties_select_public" ON properties
  FOR SELECT USING (
    status = 'active' 
    OR owner_id = auth.uid()
  );

CREATE POLICY "properties_insert_authenticated" ON properties
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = owner_id
  );

CREATE POLICY "properties_update_own" ON properties
  FOR UPDATE USING (auth.uid() = owner_id);

-- SAVED_PROPERTIES
CREATE POLICY "saved_select_authenticated" ON saved_properties
  FOR SELECT USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "saved_insert_authenticated" ON saved_properties
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "saved_delete_authenticated" ON saved_properties
  FOR DELETE USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- INQUIRIES
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

-- APPOINTMENTS
CREATE POLICY "appointments_select_authenticated" ON appointments
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (auth.uid() = client_id OR auth.uid() = agent_id)
  );

CREATE POLICY "appointments_insert_authenticated" ON appointments
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = client_id
  );

-- REVIEWS
CREATE POLICY "reviews_select_public" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "reviews_insert_authenticated" ON reviews
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = user_id
  );

-- CONVERSATIONS
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

-- MESSAGES
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

-- NOTIFICATIONS
CREATE POLICY "notifications_select_authenticated" ON notifications
  FOR SELECT USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "notifications_update_authenticated" ON notifications
  FOR UPDATE USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "notifications_insert_system" ON notifications
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- SEARCH_ALERTS
CREATE POLICY "alerts_select_authenticated" ON search_alerts
  FOR SELECT USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "alerts_insert_authenticated" ON search_alerts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- AGENTS
CREATE POLICY "agents_select_public" ON agents
  FOR SELECT USING (is_active = true OR user_id = auth.uid());

CREATE POLICY "agents_insert_authenticated" ON agents
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = user_id
  );

-- CITIES
CREATE POLICY "cities_select_public" ON cities
  FOR SELECT USING (true);

-- PRICE_HISTORY
CREATE POLICY "price_history_select_public" ON price_history
  FOR SELECT USING (true);

-- PROPERTY_VIEWS
CREATE POLICY "views_insert_public" ON property_views
  FOR INSERT WITH CHECK (true);

-- ============================================
-- ÉTAPE 5 : Vérification finale
-- ============================================
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN '✅ RLS Activé' ELSE '❌ RLS Désactivé' END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'properties', 'saved_properties', 'inquiries', 'appointments', 'reviews')
ORDER BY tablename;



