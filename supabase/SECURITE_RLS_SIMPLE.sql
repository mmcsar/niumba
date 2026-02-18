-- ============================================
-- NIUMBA - CONFIGURATION RLS SIMPLIFIÉE
-- Version sans privilèges élevés
-- ============================================
-- 
-- Ce script configure le RLS et les policies
-- sans nécessiter de privilèges administrateur
-- ============================================

-- ============================================
-- 1. RLS (Row Level Security) - ACTIVATION
-- ============================================

-- Activer RLS sur toutes les tables importantes
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS saved_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS search_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS property_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS price_history ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. POLICIES RLS (Sécurité au niveau des lignes)
-- ============================================

-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "profiles_select_public" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;

-- Profiles : Lecture publique, modification par propriétaire
CREATE POLICY "profiles_select_public" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Properties : Lecture publique (actives), modification par propriétaire
DROP POLICY IF EXISTS "properties_select_public" ON properties;
DROP POLICY IF EXISTS "properties_insert_authenticated" ON properties;
DROP POLICY IF EXISTS "properties_update_own" ON properties;
DROP POLICY IF EXISTS "properties_delete_own" ON properties;
DROP POLICY IF EXISTS "properties_admin_full" ON properties;

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
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'agent', 'admin'))
  );

CREATE POLICY "properties_update_own" ON properties
  FOR UPDATE USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "properties_delete_own" ON properties
  FOR DELETE USING (auth.uid() = owner_id);

CREATE POLICY "properties_admin_full" ON properties
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Saved Properties : Accès authentifié uniquement
DROP POLICY IF EXISTS "saved_select_authenticated" ON saved_properties;
DROP POLICY IF EXISTS "saved_insert_authenticated" ON saved_properties;
DROP POLICY IF EXISTS "saved_delete_authenticated" ON saved_properties;

CREATE POLICY "saved_select_authenticated" ON saved_properties
  FOR SELECT USING (
    auth.uid() IS NOT NULL 
    AND auth.uid() = user_id
  );

CREATE POLICY "saved_insert_authenticated" ON saved_properties
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid() = user_id
  );

CREATE POLICY "saved_delete_authenticated" ON saved_properties
  FOR DELETE USING (
    auth.uid() IS NOT NULL 
    AND auth.uid() = user_id
  );

-- Inquiries : Accès authentifié
DROP POLICY IF EXISTS "inquiries_select_authenticated" ON inquiries;
DROP POLICY IF EXISTS "inquiries_insert_authenticated" ON inquiries;
DROP POLICY IF EXISTS "inquiries_update_authenticated" ON inquiries;

CREATE POLICY "inquiries_select_authenticated" ON inquiries
  FOR SELECT USING (
    auth.uid() IS NOT NULL 
    AND (
      sender_id = auth.uid() 
      OR owner_id = auth.uid()
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );

CREATE POLICY "inquiries_insert_authenticated" ON inquiries
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND (sender_id = auth.uid() OR sender_id IS NULL)
  );

CREATE POLICY "inquiries_update_authenticated" ON inquiries
  FOR UPDATE USING (
    auth.uid() IS NOT NULL 
    AND (
      owner_id = auth.uid()
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
  )
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND (
      owner_id = auth.uid()
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );

-- Appointments : Accès authentifié
DROP POLICY IF EXISTS "appointments_select_authenticated" ON appointments;
DROP POLICY IF EXISTS "appointments_insert_authenticated" ON appointments;
DROP POLICY IF EXISTS "appointments_update_authenticated" ON appointments;

CREATE POLICY "appointments_select_authenticated" ON appointments
  FOR SELECT USING (
    auth.uid() IS NOT NULL 
    AND (
      client_id = auth.uid() 
      OR agent_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM properties p 
        WHERE p.id = appointments.property_id 
        AND p.owner_id = auth.uid()
      )
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );

CREATE POLICY "appointments_insert_authenticated" ON appointments
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL 
    AND client_id = auth.uid()
  );

CREATE POLICY "appointments_update_authenticated" ON appointments
  FOR UPDATE USING (
    auth.uid() IS NOT NULL 
    AND (
      client_id = auth.uid() 
      OR agent_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM properties p 
        WHERE p.id = appointments.property_id 
        AND p.owner_id = auth.uid()
      )
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
  )
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND (
      client_id = auth.uid() 
      OR agent_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM properties p 
        WHERE p.id = appointments.property_id 
        AND p.owner_id = auth.uid()
      )
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );

-- Reviews : Lecture publique, création authentifiée
DROP POLICY IF EXISTS "reviews_select_public" ON reviews;
DROP POLICY IF EXISTS "reviews_insert_authenticated" ON reviews;
DROP POLICY IF EXISTS "reviews_update_own" ON reviews;

CREATE POLICY "reviews_select_public" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "reviews_insert_authenticated" ON reviews
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
  );

CREATE POLICY "reviews_update_own" ON reviews
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Conversations : Accès authentifié
DROP POLICY IF EXISTS "conversations_select_authenticated" ON conversations;
DROP POLICY IF EXISTS "conversations_insert_authenticated" ON conversations;

CREATE POLICY "conversations_select_authenticated" ON conversations
  FOR SELECT USING (
    auth.uid() IS NOT NULL 
    AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
  );

CREATE POLICY "conversations_insert_authenticated" ON conversations
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL 
    AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
  );

-- Messages : Accès authentifié
DROP POLICY IF EXISTS "messages_select_authenticated" ON messages;
DROP POLICY IF EXISTS "messages_insert_authenticated" ON messages;

CREATE POLICY "messages_select_authenticated" ON messages
  FOR SELECT USING (
    auth.uid() IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM conversations c 
      WHERE c.id = messages.conversation_id 
      AND (c.participant1_id = auth.uid() OR c.participant2_id = auth.uid())
    )
  );

CREATE POLICY "messages_insert_authenticated" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL 
    AND sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversations c 
      WHERE c.id = messages.conversation_id 
      AND (c.participant1_id = auth.uid() OR c.participant2_id = auth.uid())
    )
  );

-- Notifications : Accès authentifié
DROP POLICY IF EXISTS "notifications_select_authenticated" ON notifications;
DROP POLICY IF EXISTS "notifications_update_authenticated" ON notifications;

CREATE POLICY "notifications_select_authenticated" ON notifications
  FOR SELECT USING (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
  );

CREATE POLICY "notifications_update_authenticated" ON notifications
  FOR UPDATE USING (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
  )
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
  );

-- Search Alerts : Accès authentifié
DROP POLICY IF EXISTS "search_alerts_select_authenticated" ON search_alerts;
DROP POLICY IF EXISTS "search_alerts_insert_authenticated" ON search_alerts;
DROP POLICY IF EXISTS "search_alerts_delete_authenticated" ON search_alerts;

CREATE POLICY "search_alerts_select_authenticated" ON search_alerts
  FOR SELECT USING (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
  );

CREATE POLICY "search_alerts_insert_authenticated" ON search_alerts
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
  );

CREATE POLICY "search_alerts_delete_authenticated" ON search_alerts
  FOR DELETE USING (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
  );

-- Agents : Lecture publique (actifs), modification par propriétaire
DROP POLICY IF EXISTS "agents_select_public" ON agents;
DROP POLICY IF EXISTS "agents_upsert_own" ON agents;

CREATE POLICY "agents_select_public" ON agents
  FOR SELECT USING (
    is_active = true 
    OR user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "agents_upsert_own" ON agents
  FOR ALL USING (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
  )
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
  );

-- Cities : Lecture publique, modification admin
DROP POLICY IF EXISTS "cities_select_public" ON cities;
DROP POLICY IF EXISTS "cities_admin_modify" ON cities;

CREATE POLICY "cities_select_public" ON cities
  FOR SELECT USING (true);

CREATE POLICY "cities_admin_modify" ON cities
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Price History : Lecture publique
DROP POLICY IF EXISTS "price_history_select_public" ON price_history;

CREATE POLICY "price_history_select_public" ON price_history
  FOR SELECT USING (true);

-- Property Views : Insertion publique, lecture owner/admin
DROP POLICY IF EXISTS "property_views_insert_public" ON property_views;
DROP POLICY IF EXISTS "property_views_select_owner" ON property_views;

CREATE POLICY "property_views_insert_public" ON property_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "property_views_select_owner" ON property_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties p 
      WHERE p.id = property_views.property_id 
      AND (
        p.owner_id = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
      )
    )
  );

-- ============================================
-- 3. VÉRIFICATION
-- ============================================

-- Vérifier que RLS est activé
SELECT 
  'RLS Status' as check_type,
  tablename,
  CASE WHEN rowsecurity THEN '✅ RLS Activé' ELSE '❌ RLS Désactivé' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'properties', 'saved_properties', 'inquiries',
    'appointments', 'reviews', 'conversations', 'messages',
    'notifications', 'search_alerts', 'agents', 'cities',
    'price_history', 'property_views'
  )
ORDER BY tablename;

-- Vérifier les policies créées
SELECT 
  'Policies' as check_type,
  tablename,
  COUNT(*) as nb_policies
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'properties', 'saved_properties', 'inquiries',
    'appointments', 'reviews', 'conversations', 'messages',
    'notifications', 'search_alerts', 'agents', 'cities',
    'price_history', 'property_views'
  )
GROUP BY tablename
ORDER BY tablename;

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '✅ RLS activé sur toutes les tables !';
  RAISE NOTICE '✅ Toutes les policies de sécurité créées !';
  RAISE NOTICE '🔒 Votre base de données est maintenant sécurisée !';
END $$;


