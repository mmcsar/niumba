-- ============================================
-- NIUMBA - PARTIE 4 : DONNÉES ET RLS
-- Copiez et exécutez ce script après la partie 3
-- ============================================

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_owner ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_saved_user ON saved_properties(user_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_property ON inquiries(property_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_property ON appointments(property_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);

-- VILLES DU HAUT-KATANGA ET LUALABA
INSERT INTO cities (name, name_en, province, latitude, longitude) VALUES
  ('Lubumbashi', 'Lubumbashi', 'Haut-Katanga', -11.6876, 27.4847),
  ('Likasi', 'Likasi', 'Haut-Katanga', -10.9833, 26.7333),
  ('Kipushi', 'Kipushi', 'Haut-Katanga', -11.7667, 27.2333),
  ('Kasumbalesa', 'Kasumbalesa', 'Haut-Katanga', -12.2333, 27.8000),
  ('Kambove', 'Kambove', 'Haut-Katanga', -10.8667, 26.6000),
  ('Kolwezi', 'Kolwezi', 'Lualaba', -10.7167, 25.4667),
  ('Fungurume', 'Fungurume', 'Lualaba', -10.6167, 26.3000),
  ('Dilolo', 'Dilolo', 'Lualaba', -10.6833, 22.3500),
  ('Mutshatsha', 'Mutshatsha', 'Lualaba', -10.0000, 25.0000)
ON CONFLICT DO NOTHING;

-- ROW LEVEL SECURITY
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

-- PROFILES POLICIES
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- PROPERTIES POLICIES
CREATE POLICY "properties_select" ON properties FOR SELECT USING (
  status = 'active' OR owner_id = auth.uid()
);
CREATE POLICY "properties_insert" ON properties FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "properties_update" ON properties FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "properties_delete" ON properties FOR DELETE USING (auth.uid() = owner_id);

-- SAVED PROPERTIES POLICIES
CREATE POLICY "saved_select" ON saved_properties FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "saved_insert" ON saved_properties FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "saved_delete" ON saved_properties FOR DELETE USING (auth.uid() = user_id);

-- INQUIRIES POLICIES
CREATE POLICY "inquiries_select" ON inquiries FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = owner_id
);
CREATE POLICY "inquiries_insert" ON inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "inquiries_update" ON inquiries FOR UPDATE USING (auth.uid() = owner_id);

-- NOTIFICATIONS POLICIES
CREATE POLICY "notifications_select" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notifications_insert" ON notifications FOR INSERT WITH CHECK (true);

-- APPOINTMENTS POLICIES
CREATE POLICY "appointments_select" ON appointments FOR SELECT USING (
  auth.uid() = client_id OR auth.uid() = agent_id
);
CREATE POLICY "appointments_insert" ON appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "appointments_update" ON appointments FOR UPDATE USING (
  auth.uid() = client_id OR auth.uid() = agent_id
);

-- REVIEWS POLICIES
CREATE POLICY "reviews_select" ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_update" ON reviews FOR UPDATE USING (auth.uid() = user_id);

-- CONVERSATIONS POLICIES
CREATE POLICY "conversations_select" ON conversations FOR SELECT USING (
  auth.uid() = participant_1 OR auth.uid() = participant_2
);
CREATE POLICY "conversations_insert" ON conversations FOR INSERT WITH CHECK (
  auth.uid() = participant_1 OR auth.uid() = participant_2
);

-- MESSAGES POLICIES
CREATE POLICY "messages_select" ON messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM conversations WHERE id = conversation_id AND 
    (participant_1 = auth.uid() OR participant_2 = auth.uid()))
);
CREATE POLICY "messages_insert" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- SEARCH ALERTS POLICIES
CREATE POLICY "alerts_select" ON search_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "alerts_insert" ON search_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "alerts_update" ON search_alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "alerts_delete" ON search_alerts FOR DELETE USING (auth.uid() = user_id);

-- PROPERTY VIEWS POLICIES
CREATE POLICY "views_insert" ON property_views FOR INSERT WITH CHECK (true);

-- AGENTS POLICIES
CREATE POLICY "agents_select" ON agents FOR SELECT USING (is_active = true OR user_id = auth.uid());
CREATE POLICY "agents_insert" ON agents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "agents_update" ON agents FOR UPDATE USING (auth.uid() = user_id);

