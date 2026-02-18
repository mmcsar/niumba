-- ============================================
-- NIUMBA - RLS SAFE (ignore tables manquantes)
-- ============================================

-- Cette version ignore les erreurs si une table n'existe pas

-- PROFILES
DO $$ BEGIN
  ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "profiles_select_public" ON profiles;
  DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
  DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
  CREATE POLICY "profiles_select_public" ON profiles FOR SELECT USING (true);
  CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
  CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
  RAISE NOTICE 'profiles ✅';
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'profiles ❌ (table inexistante)';
END $$;

-- PROPERTIES
DO $$ BEGIN
  ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "properties_select_public" ON properties;
  DROP POLICY IF EXISTS "properties_insert_owner" ON properties;
  DROP POLICY IF EXISTS "properties_update_owner" ON properties;
  DROP POLICY IF EXISTS "properties_delete_owner" ON properties;
  CREATE POLICY "properties_select_public" ON properties FOR SELECT USING (true);
  CREATE POLICY "properties_insert_owner" ON properties FOR INSERT WITH CHECK (auth.uid() = owner_id);
  CREATE POLICY "properties_update_owner" ON properties FOR UPDATE USING (auth.uid() = owner_id);
  CREATE POLICY "properties_delete_owner" ON properties FOR DELETE USING (auth.uid() = owner_id);
  RAISE NOTICE 'properties ✅';
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'properties ❌ (table inexistante)';
END $$;

-- SAVED_PROPERTIES
DO $$ BEGIN
  ALTER TABLE saved_properties ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "saved_properties_select_own" ON saved_properties;
  DROP POLICY IF EXISTS "saved_properties_insert_own" ON saved_properties;
  DROP POLICY IF EXISTS "saved_properties_delete_own" ON saved_properties;
  CREATE POLICY "saved_properties_select_own" ON saved_properties FOR SELECT USING (auth.uid() = user_id);
  CREATE POLICY "saved_properties_insert_own" ON saved_properties FOR INSERT WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "saved_properties_delete_own" ON saved_properties FOR DELETE USING (auth.uid() = user_id);
  RAISE NOTICE 'saved_properties ✅';
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'saved_properties ❌ (table inexistante)';
END $$;

-- INQUIRIES
DO $$ BEGIN
  ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "inquiries_select_parties" ON inquiries;
  DROP POLICY IF EXISTS "inquiries_insert_user" ON inquiries;
  DROP POLICY IF EXISTS "inquiries_update_owner" ON inquiries;
  CREATE POLICY "inquiries_select_parties" ON inquiries FOR SELECT USING (auth.uid() = user_id OR auth.uid() = owner_id);
  CREATE POLICY "inquiries_insert_user" ON inquiries FOR INSERT WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "inquiries_update_owner" ON inquiries FOR UPDATE USING (auth.uid() = owner_id);
  RAISE NOTICE 'inquiries ✅';
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'inquiries ❌ (table inexistante)';
END $$;

-- APPOINTMENTS
DO $$ BEGIN
  ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "appointments_select_parties" ON appointments;
  DROP POLICY IF EXISTS "appointments_insert_user" ON appointments;
  DROP POLICY IF EXISTS "appointments_update_parties" ON appointments;
  CREATE POLICY "appointments_select_parties" ON appointments FOR SELECT USING (auth.uid() = user_id OR auth.uid() = owner_id);
  CREATE POLICY "appointments_insert_user" ON appointments FOR INSERT WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "appointments_update_parties" ON appointments FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = owner_id);
  RAISE NOTICE 'appointments ✅';
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'appointments ❌ (table inexistante)';
END $$;

-- REVIEWS
DO $$ BEGIN
  ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "reviews_select_public" ON reviews;
  DROP POLICY IF EXISTS "reviews_insert_auth" ON reviews;
  DROP POLICY IF EXISTS "reviews_update_author" ON reviews;
  DROP POLICY IF EXISTS "reviews_delete_author" ON reviews;
  CREATE POLICY "reviews_select_public" ON reviews FOR SELECT USING (true);
  CREATE POLICY "reviews_insert_auth" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "reviews_update_author" ON reviews FOR UPDATE USING (auth.uid() = user_id);
  CREATE POLICY "reviews_delete_author" ON reviews FOR DELETE USING (auth.uid() = user_id);
  RAISE NOTICE 'reviews ✅';
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'reviews ❌ (table inexistante)';
END $$;

-- CONVERSATIONS
DO $$ BEGIN
  ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "conversations_select_participants" ON conversations;
  DROP POLICY IF EXISTS "conversations_insert_participants" ON conversations;
  DROP POLICY IF EXISTS "conversations_update_participants" ON conversations;
  CREATE POLICY "conversations_select_participants" ON conversations FOR SELECT USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);
  CREATE POLICY "conversations_insert_participants" ON conversations FOR INSERT WITH CHECK (auth.uid() = participant1_id OR auth.uid() = participant2_id);
  CREATE POLICY "conversations_update_participants" ON conversations FOR UPDATE USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);
  RAISE NOTICE 'conversations ✅';
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'conversations ❌ (table inexistante)';
END $$;

-- MESSAGES
DO $$ BEGIN
  ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "messages_select_conversation" ON messages;
  DROP POLICY IF EXISTS "messages_insert_sender" ON messages;
  DROP POLICY IF EXISTS "messages_update_read" ON messages;
  CREATE POLICY "messages_select_conversation" ON messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND (auth.uid() = c.participant1_id OR auth.uid() = c.participant2_id))
  );
  CREATE POLICY "messages_insert_sender" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
  CREATE POLICY "messages_update_read" ON messages FOR UPDATE USING (
    EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND (auth.uid() = c.participant1_id OR auth.uid() = c.participant2_id))
  );
  RAISE NOTICE 'messages ✅';
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'messages ❌ (table inexistante)';
END $$;

-- NOTIFICATIONS
DO $$ BEGIN
  ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
  DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
  DROP POLICY IF EXISTS "notifications_delete_own" ON notifications;
  CREATE POLICY "notifications_select_own" ON notifications FOR SELECT USING (auth.uid() = user_id);
  CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE USING (auth.uid() = user_id);
  CREATE POLICY "notifications_delete_own" ON notifications FOR DELETE USING (auth.uid() = user_id);
  RAISE NOTICE 'notifications ✅';
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'notifications ❌ (table inexistante)';
END $$;

-- SEARCH_ALERTS
DO $$ BEGIN
  ALTER TABLE search_alerts ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "search_alerts_select_own" ON search_alerts;
  DROP POLICY IF EXISTS "search_alerts_insert_own" ON search_alerts;
  DROP POLICY IF EXISTS "search_alerts_update_own" ON search_alerts;
  DROP POLICY IF EXISTS "search_alerts_delete_own" ON search_alerts;
  CREATE POLICY "search_alerts_select_own" ON search_alerts FOR SELECT USING (auth.uid() = user_id);
  CREATE POLICY "search_alerts_insert_own" ON search_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "search_alerts_update_own" ON search_alerts FOR UPDATE USING (auth.uid() = user_id);
  CREATE POLICY "search_alerts_delete_own" ON search_alerts FOR DELETE USING (auth.uid() = user_id);
  RAISE NOTICE 'search_alerts ✅';
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'search_alerts ❌ (table inexistante)';
END $$;

-- RÉSULTAT FINAL
SELECT 
  tablename as "Table",
  CASE WHEN rowsecurity THEN '✅ RLS OK' ELSE '❌' END as "Statut"
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename NOT LIKE 'pg_%'
  AND tablename NOT LIKE 'spatial_%'
ORDER BY tablename;



