-- ============================================
-- NIUMBA - Script de Configuration Rapide
-- Exécutez ce script dans Supabase SQL Editor
-- ============================================

-- PARTIE 1: EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- PARTIE 2: TYPES ENUM
-- ============================================
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'agent', 'owner', 'admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE property_type AS ENUM ('house', 'apartment', 'flat', 'dormitory', 'townhouse', 'land', 'commercial', 'warehouse');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE price_type AS ENUM ('sale', 'rent');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE rent_period AS ENUM ('day', 'week', 'month', 'year');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE property_status AS ENUM ('draft', 'pending', 'active', 'sold', 'rented', 'inactive');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE inquiry_status AS ENUM ('new', 'read', 'responded', 'closed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE currency_type AS ENUM ('USD', 'CDF');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE appointment_type AS ENUM ('in_person', 'video_call', 'phone_call');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- PARTIE 3: TABLES PRINCIPALES
-- ============================================

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  company_name TEXT,
  company_logo TEXT,
  role user_role DEFAULT 'user',
  language TEXT DEFAULT 'fr' CHECK (language IN ('fr', 'en')),
  city TEXT,
  province TEXT CHECK (province IN ('Haut-Katanga', 'Lualaba') OR province IS NULL),
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  push_token TEXT,
  notification_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Properties
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT NOT NULL,
  description_en TEXT,
  type property_type NOT NULL,
  status property_status DEFAULT 'pending',
  price NUMERIC(15, 2) NOT NULL,
  currency currency_type DEFAULT 'USD',
  price_type price_type NOT NULL,
  rent_period rent_period,
  is_negotiable BOOLEAN DEFAULT TRUE,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL CHECK (province IN ('Haut-Katanga', 'Lualaba')),
  neighborhood TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location GEOGRAPHY(POINT, 4326),
  bedrooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 0,
  area NUMERIC(10, 2),
  land_area NUMERIC(10, 2),
  garage INTEGER DEFAULT 0,
  floors INTEGER DEFAULT 1,
  year_built INTEGER,
  features TEXT[] DEFAULT '{}',
  features_en TEXT[] DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  video_url TEXT,
  virtual_tour_url TEXT,
  views INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  inquiries_count INTEGER DEFAULT 0,
  average_rating NUMERIC(2, 1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

-- Saved Properties
CREATE TABLE IF NOT EXISTS saved_properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- Inquiries
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  sender_phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status inquiry_status DEFAULT 'new',
  response TEXT,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_en TEXT,
  body TEXT NOT NULL,
  body_en TEXT,
  type TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  client_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  appointment_type appointment_type DEFAULT 'in_person',
  status appointment_status DEFAULT 'pending',
  notes TEXT,
  cancellation_reason TEXT,
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  reminder_sent BOOLEAN DEFAULT FALSE,
  reminder_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cities
CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_en TEXT,
  province TEXT NOT NULL CHECK (province IN ('Haut-Katanga', 'Lualaba')),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  properties_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  helpful_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(property_id, user_id)
);

-- Messages
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_1 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  participant_2 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant_1, participant_2, property_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  status message_status DEFAULT 'sent',
  attachment_url TEXT,
  attachment_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- Search Alerts
CREATE TABLE IF NOT EXISTS search_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  filters JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  match_count INTEGER DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Property Views (Analytics)
CREATE TABLE IF NOT EXISTS property_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Price History
CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  price NUMERIC(15, 2) NOT NULL,
  currency currency_type DEFAULT 'USD',
  event_type TEXT NOT NULL,
  event_description TEXT,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agents
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  license_number TEXT,
  bio TEXT,
  bio_en TEXT,
  specializations TEXT[] DEFAULT '{}',
  service_areas TEXT[] DEFAULT '{}',
  rating NUMERIC(2, 1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  properties_sold INTEGER DEFAULT 0,
  properties_rented INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PARTIE 4: INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS properties_location_idx ON properties USING GIST(location);
CREATE INDEX IF NOT EXISTS properties_city_idx ON properties(city);
CREATE INDEX IF NOT EXISTS properties_type_idx ON properties(type);
CREATE INDEX IF NOT EXISTS properties_status_idx ON properties(status);
CREATE INDEX IF NOT EXISTS properties_price_idx ON properties(price);
CREATE INDEX IF NOT EXISTS properties_owner_idx ON properties(owner_id);
CREATE INDEX IF NOT EXISTS saved_properties_user_idx ON saved_properties(user_id);
CREATE INDEX IF NOT EXISTS inquiries_property_idx ON inquiries(property_id);
CREATE INDEX IF NOT EXISTS inquiries_owner_idx ON inquiries(owner_id);
CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS appointments_property_idx ON appointments(property_id);
CREATE INDEX IF NOT EXISTS appointments_date_idx ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS messages_conversation_idx ON messages(conversation_id);

-- PARTIE 5: DONNÉES INITIALES - VILLES
-- ============================================
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

-- PARTIE 6: ROW LEVEL SECURITY
-- ============================================
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

-- Profiles Policies
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Properties Policies
DROP POLICY IF EXISTS "properties_select_public" ON properties;
CREATE POLICY "properties_select_public" ON properties FOR SELECT USING (
  status = 'active' OR owner_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "properties_insert_own" ON properties;
CREATE POLICY "properties_insert_own" ON properties FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "properties_update_own" ON properties;
CREATE POLICY "properties_update_own" ON properties FOR UPDATE USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "properties_delete_own" ON properties;
CREATE POLICY "properties_delete_own" ON properties FOR DELETE USING (auth.uid() = owner_id);

-- Saved Properties Policies
DROP POLICY IF EXISTS "saved_select_own" ON saved_properties;
CREATE POLICY "saved_select_own" ON saved_properties FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_insert_own" ON saved_properties;
CREATE POLICY "saved_insert_own" ON saved_properties FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_delete_own" ON saved_properties;
CREATE POLICY "saved_delete_own" ON saved_properties FOR DELETE USING (auth.uid() = user_id);

-- Inquiries Policies
DROP POLICY IF EXISTS "inquiries_select" ON inquiries;
CREATE POLICY "inquiries_select" ON inquiries FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = owner_id OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "inquiries_insert_all" ON inquiries;
CREATE POLICY "inquiries_insert_all" ON inquiries FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "inquiries_update_owner" ON inquiries;
CREATE POLICY "inquiries_update_owner" ON inquiries FOR UPDATE USING (auth.uid() = owner_id);

-- Notifications Policies
DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_insert" ON notifications;
CREATE POLICY "notifications_insert" ON notifications FOR INSERT WITH CHECK (
  auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Appointments Policies
DROP POLICY IF EXISTS "appointments_select" ON appointments;
CREATE POLICY "appointments_select" ON appointments FOR SELECT USING (
  auth.uid() = client_id OR auth.uid() = agent_id OR
  EXISTS (SELECT 1 FROM properties WHERE id = property_id AND owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "appointments_insert_all" ON appointments;
CREATE POLICY "appointments_insert_all" ON appointments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "appointments_update" ON appointments;
CREATE POLICY "appointments_update" ON appointments FOR UPDATE USING (
  auth.uid() = client_id OR auth.uid() = agent_id OR
  EXISTS (SELECT 1 FROM properties WHERE id = property_id AND owner_id = auth.uid())
);

-- Reviews Policies
DROP POLICY IF EXISTS "reviews_select_all" ON reviews;
CREATE POLICY "reviews_select_all" ON reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "reviews_insert_auth" ON reviews;
CREATE POLICY "reviews_insert_auth" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reviews_update_own" ON reviews;
CREATE POLICY "reviews_update_own" ON reviews FOR UPDATE USING (auth.uid() = user_id);

-- Messages Policies
DROP POLICY IF EXISTS "conversations_select" ON conversations;
CREATE POLICY "conversations_select" ON conversations FOR SELECT USING (
  auth.uid() = participant_1 OR auth.uid() = participant_2
);

DROP POLICY IF EXISTS "conversations_insert" ON conversations;
CREATE POLICY "conversations_insert" ON conversations FOR INSERT WITH CHECK (
  auth.uid() = participant_1 OR auth.uid() = participant_2
);

DROP POLICY IF EXISTS "messages_select" ON messages;
CREATE POLICY "messages_select" ON messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM conversations WHERE id = conversation_id AND 
    (participant_1 = auth.uid() OR participant_2 = auth.uid()))
);

DROP POLICY IF EXISTS "messages_insert" ON messages;
CREATE POLICY "messages_insert" ON messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (SELECT 1 FROM conversations WHERE id = conversation_id AND 
    (participant_1 = auth.uid() OR participant_2 = auth.uid()))
);

-- Search Alerts Policies
DROP POLICY IF EXISTS "alerts_select_own" ON search_alerts;
CREATE POLICY "alerts_select_own" ON search_alerts FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "alerts_insert_own" ON search_alerts;
CREATE POLICY "alerts_insert_own" ON search_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "alerts_update_own" ON search_alerts;
CREATE POLICY "alerts_update_own" ON search_alerts FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "alerts_delete_own" ON search_alerts;
CREATE POLICY "alerts_delete_own" ON search_alerts FOR DELETE USING (auth.uid() = user_id);

-- Property Views Policies
DROP POLICY IF EXISTS "views_insert_all" ON property_views;
CREATE POLICY "views_insert_all" ON property_views FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "views_select_owner" ON property_views;
CREATE POLICY "views_select_owner" ON property_views FOR SELECT USING (
  EXISTS (SELECT 1 FROM properties WHERE id = property_id AND owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Agents Policies
DROP POLICY IF EXISTS "agents_select" ON agents;
CREATE POLICY "agents_select" ON agents FOR SELECT USING (is_active = true OR user_id = auth.uid());

DROP POLICY IF EXISTS "agents_insert_own" ON agents;
CREATE POLICY "agents_insert_own" ON agents FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "agents_update_own" ON agents;
CREATE POLICY "agents_update_own" ON agents FOR UPDATE USING (auth.uid() = user_id);

-- PARTIE 7: FONCTIONS ET TRIGGERS
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS properties_updated_at ON properties;
CREATE TRIGGER properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS appointments_updated_at ON appointments;
CREATE TRIGGER appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update property location from lat/lng
CREATE OR REPLACE FUNCTION update_property_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS properties_location_update ON properties;
CREATE TRIGGER properties_location_update BEFORE INSERT OR UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_property_location();

-- Increment property views
CREATE OR REPLACE FUNCTION increment_property_views(property_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE properties SET views = views + 1 WHERE id = property_uuid;
END;
$$ LANGUAGE plpgsql;

-- Get nearby properties
CREATE OR REPLACE FUNCTION get_nearby_properties(
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 10,
  max_results INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  title_en TEXT,
  type property_type,
  price NUMERIC,
  currency currency_type,
  price_type price_type,
  address TEXT,
  city TEXT,
  province TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  bedrooms INTEGER,
  bathrooms INTEGER,
  area NUMERIC,
  images TEXT[],
  is_featured BOOLEAN,
  distance_km DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id, p.title, p.title_en, p.type, p.price, p.currency, p.price_type,
    p.address, p.city, p.province, p.latitude, p.longitude,
    p.bedrooms, p.bathrooms, p.area, p.images, p.is_featured,
    ST_Distance(p.location, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography) / 1000 AS distance_km
  FROM properties p
  WHERE p.status = 'active' AND p.location IS NOT NULL
    AND ST_DWithin(p.location, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography, radius_km * 1000)
  ORDER BY p.is_featured DESC, distance_km ASC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Get available appointment slots
CREATE OR REPLACE FUNCTION get_available_slots(
  p_property_id UUID,
  p_date DATE,
  p_start_hour INTEGER DEFAULT 8,
  p_end_hour INTEGER DEFAULT 17
)
RETURNS TABLE (slot_time TIME) AS $$
DECLARE
  current_slot TIME;
BEGIN
  current_slot := (p_start_hour || ':00')::TIME;
  WHILE current_slot < (p_end_hour || ':00')::TIME LOOP
    IF NOT EXISTS (
      SELECT 1 FROM appointments
      WHERE property_id = p_property_id AND appointment_date = p_date
        AND appointment_time = current_slot AND status NOT IN ('cancelled', 'no_show')
    ) THEN
      slot_time := current_slot;
      RETURN NEXT;
    END IF;
    current_slot := current_slot + INTERVAL '30 minutes';
  END LOOP;
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ✅ CONFIGURATION TERMINÉE !
-- ============================================
SELECT 'Niumba database setup complete!' AS status;

