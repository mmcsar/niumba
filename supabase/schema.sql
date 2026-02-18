-- ============================================
-- NIUMBA - Schéma Base de Données Supabase
-- Real Estate B2B - Haut-Katanga & Lualaba
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================
-- ENUM TYPES
-- ============================================

CREATE TYPE user_role AS ENUM ('user', 'agent', 'owner', 'admin');
CREATE TYPE property_type AS ENUM ('house', 'apartment', 'flat', 'dormitory', 'townhouse', 'land', 'commercial', 'warehouse');
CREATE TYPE price_type AS ENUM ('sale', 'rent');
CREATE TYPE rent_period AS ENUM ('day', 'week', 'month', 'year');
CREATE TYPE property_status AS ENUM ('draft', 'pending', 'active', 'sold', 'rented', 'inactive');
CREATE TYPE inquiry_status AS ENUM ('new', 'read', 'responded', 'closed');
CREATE TYPE currency_type AS ENUM ('USD', 'CDF');
CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read');

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================

CREATE TABLE profiles (
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
  province TEXT CHECK (province IN ('Haut-Katanga', 'Lualaba')),
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  push_token TEXT,
  notification_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROPERTIES TABLE
-- ============================================

CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Basic Info
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT NOT NULL,
  description_en TEXT,
  type property_type NOT NULL,
  status property_status DEFAULT 'pending',
  
  -- Pricing
  price NUMERIC(15, 2) NOT NULL,
  currency currency_type DEFAULT 'USD',
  price_type price_type NOT NULL,
  rent_period rent_period,
  is_negotiable BOOLEAN DEFAULT TRUE,
  
  -- Location
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL CHECK (province IN ('Haut-Katanga', 'Lualaba')),
  neighborhood TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location GEOGRAPHY(POINT, 4326),
  
  -- Details
  bedrooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 0,
  area NUMERIC(10, 2), -- in m²
  land_area NUMERIC(10, 2), -- for land/houses
  garage INTEGER DEFAULT 0,
  floors INTEGER DEFAULT 1,
  year_built INTEGER,
  
  -- Features (stored as arrays)
  features TEXT[] DEFAULT '{}',
  features_en TEXT[] DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}',
  
  -- Media
  images TEXT[] DEFAULT '{}',
  video_url TEXT,
  virtual_tour_url TEXT,
  
  -- Stats
  views INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  inquiries_count INTEGER DEFAULT 0,
  average_rating NUMERIC(2, 1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  
  -- Flags
  is_featured BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

-- Create spatial index
CREATE INDEX properties_location_idx ON properties USING GIST(location);
CREATE INDEX properties_city_idx ON properties(city);
CREATE INDEX properties_type_idx ON properties(type);
CREATE INDEX properties_status_idx ON properties(status);
CREATE INDEX properties_price_idx ON properties(price);
CREATE INDEX properties_owner_idx ON properties(owner_id);

-- ============================================
-- SAVED PROPERTIES (Favorites)
-- ============================================

CREATE TABLE saved_properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

CREATE INDEX saved_properties_user_idx ON saved_properties(user_id);

-- ============================================
-- INQUIRIES (Contact Requests)
-- ============================================

CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Contact Info (for non-logged users)
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  sender_phone TEXT,
  
  -- Message
  subject TEXT,
  message TEXT NOT NULL,
  
  -- Status
  status inquiry_status DEFAULT 'new',
  response TEXT,
  responded_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

CREATE INDEX inquiries_property_idx ON inquiries(property_id);
CREATE INDEX inquiries_owner_idx ON inquiries(owner_id);
CREATE INDEX inquiries_status_idx ON inquiries(status);

-- ============================================
-- REVIEWS / RATINGS
-- ============================================

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  helpful_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(property_id, user_id) -- One review per user per property
);

CREATE INDEX reviews_property_idx ON reviews(property_id);
CREATE INDEX reviews_user_idx ON reviews(user_id);
CREATE INDEX reviews_rating_idx ON reviews(rating);

-- Review helpful votes
CREATE TABLE review_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- ============================================
-- PRICE HISTORY
-- ============================================

CREATE TABLE price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  price NUMERIC(15, 2) NOT NULL,
  currency currency_type DEFAULT 'USD',
  event_type TEXT NOT NULL, -- 'listed', 'price_change', 'sold', 'relisted'
  event_description TEXT,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX price_history_property_idx ON price_history(property_id);
CREATE INDEX price_history_date_idx ON price_history(recorded_at);

-- ============================================
-- CONVERSATIONS & MESSAGES (Chat)
-- ============================================

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_1 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  participant_2 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant_1, participant_2, property_id)
);

CREATE INDEX conversations_participant1_idx ON conversations(participant_1);
CREATE INDEX conversations_participant2_idx ON conversations(participant_2);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  status message_status DEFAULT 'sent',
  attachment_url TEXT,
  attachment_type TEXT, -- 'image', 'document'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

CREATE INDEX messages_conversation_idx ON messages(conversation_id);
CREATE INDEX messages_sender_idx ON messages(sender_id);
CREATE INDEX messages_created_idx ON messages(created_at);

-- ============================================
-- PROPERTY VIEWS (Analytics)
-- ============================================

CREATE TABLE property_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX property_views_property_idx ON property_views(property_id);
CREATE INDEX property_views_date_idx ON property_views(created_at);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_en TEXT,
  body TEXT NOT NULL,
  body_en TEXT,
  type TEXT NOT NULL, -- 'inquiry', 'property', 'system', 'promotion', 'message', 'alert'
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX notifications_user_idx ON notifications(user_id);
CREATE INDEX notifications_unread_idx ON notifications(user_id) WHERE is_read = FALSE;

-- ============================================
-- SEARCH ALERTS (for push notifications)
-- ============================================

CREATE TABLE search_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  filters JSONB NOT NULL, -- Store search criteria
  is_active BOOLEAN DEFAULT TRUE,
  match_count INTEGER DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX search_alerts_user_idx ON search_alerts(user_id);
CREATE INDEX search_alerts_active_idx ON search_alerts(is_active) WHERE is_active = TRUE;

-- ============================================
-- AGENTS (Multi-agent support)
-- ============================================

CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  license_number TEXT,
  bio TEXT,
  bio_en TEXT,
  specializations TEXT[] DEFAULT '{}',
  service_areas TEXT[] DEFAULT '{}', -- Cities
  rating NUMERIC(2, 1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  properties_sold INTEGER DEFAULT 0,
  properties_rented INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX agents_user_idx ON agents(user_id);
CREATE INDEX agents_active_idx ON agents(is_active) WHERE is_active = TRUE;

-- Agent reviews
CREATE TABLE agent_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agent_id, user_id)
);

-- ============================================
-- APPOINTMENTS (Rendez-vous)
-- ============================================

CREATE TYPE appointment_type AS ENUM ('in_person', 'video_call', 'phone_call');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  client_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Client contact info (for non-logged users)
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  
  -- Appointment details
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  appointment_datetime TIMESTAMPTZ GENERATED ALWAYS AS (
    (appointment_date + appointment_time) AT TIME ZONE 'Africa/Lubumbashi'
  ) STORED,
  duration_minutes INTEGER DEFAULT 30,
  appointment_type appointment_type DEFAULT 'in_person',
  
  -- Status & Notes
  status appointment_status DEFAULT 'pending',
  notes TEXT,
  cancellation_reason TEXT,
  
  -- Confirmation tracking
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  reminder_sent BOOLEAN DEFAULT FALSE,
  reminder_sent_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for appointments
CREATE INDEX appointments_property_idx ON appointments(property_id);
CREATE INDEX appointments_agent_idx ON appointments(agent_id);
CREATE INDEX appointments_client_idx ON appointments(client_id);
CREATE INDEX appointments_date_idx ON appointments(appointment_date);
CREATE INDEX appointments_status_idx ON appointments(status);
CREATE INDEX appointments_datetime_idx ON appointments(appointment_datetime);

-- ============================================
-- CITIES / NEIGHBORHOODS
-- ============================================

CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_en TEXT,
  province TEXT NOT NULL CHECK (province IN ('Haut-Katanga', 'Lualaba')),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  properties_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

INSERT INTO cities (name, name_en, province, latitude, longitude) VALUES
  ('Lubumbashi', 'Lubumbashi', 'Haut-Katanga', -11.6876, 27.4847),
  ('Likasi', 'Likasi', 'Haut-Katanga', -10.9833, 26.7333),
  ('Kipushi', 'Kipushi', 'Haut-Katanga', -11.7667, 27.2333),
  ('Kasumbalesa', 'Kasumbalesa', 'Haut-Katanga', -12.2333, 27.8000),
  ('Kambove', 'Kambove', 'Haut-Katanga', -10.8667, 26.6000),
  ('Kolwezi', 'Kolwezi', 'Lualaba', -10.7167, 25.4667),
  ('Fungurume', 'Fungurume', 'Lualaba', -10.6167, 26.3000),
  ('Dilolo', 'Dilolo', 'Lualaba', -10.6833, 22.3500),
  ('Mutshatsha', 'Mutshatsha', 'Lualaba', -10.0000, 25.0000);

-- ============================================
-- ROW LEVEL SECURITY (RLS) - COMPLETE
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Everyone can view profiles (public info)
CREATE POLICY "profiles_select_all" ON profiles
  FOR SELECT USING (true);

-- Users can only update their own profile
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (handled by trigger, but just in case)
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- PROPERTIES POLICIES
-- ============================================

-- Everyone can view active properties, owners can view all their properties
CREATE POLICY "properties_select_public" ON properties
  FOR SELECT USING (
    status = 'active' 
    OR owner_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Authenticated users can insert their own properties
CREATE POLICY "properties_insert_own" ON properties
  FOR INSERT WITH CHECK (
    auth.uid() = owner_id
    AND auth.uid() IS NOT NULL
  );

-- Owners can update their own properties
CREATE POLICY "properties_update_own" ON properties
  FOR UPDATE USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Owners can delete their own properties
CREATE POLICY "properties_delete_own" ON properties
  FOR DELETE USING (auth.uid() = owner_id);

-- Admins have full access
CREATE POLICY "properties_admin_all" ON properties
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- SAVED PROPERTIES POLICIES
-- ============================================

CREATE POLICY "saved_properties_select_own" ON saved_properties
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "saved_properties_insert_own" ON saved_properties
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saved_properties_delete_own" ON saved_properties
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- INQUIRIES POLICIES
-- ============================================

-- Senders and owners can view inquiries
CREATE POLICY "inquiries_select_involved" ON inquiries
  FOR SELECT USING (
    auth.uid() = sender_id 
    OR auth.uid() = owner_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Anyone can create an inquiry (including non-authenticated for contact forms)
CREATE POLICY "inquiries_insert_all" ON inquiries
  FOR INSERT WITH CHECK (true);

-- Owners can update inquiry status
CREATE POLICY "inquiries_update_owner" ON inquiries
  FOR UPDATE USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- ============================================
-- REVIEWS POLICIES
-- ============================================

-- Everyone can read reviews
CREATE POLICY "reviews_select_all" ON reviews
  FOR SELECT USING (true);

-- Authenticated users can create reviews
CREATE POLICY "reviews_insert_auth" ON reviews
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND auth.uid() IS NOT NULL
  );

-- Users can update their own reviews
CREATE POLICY "reviews_update_own" ON reviews
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "reviews_delete_own" ON reviews
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- REVIEW VOTES POLICIES
-- ============================================

CREATE POLICY "review_votes_select_all" ON review_votes
  FOR SELECT USING (true);

CREATE POLICY "review_votes_insert_auth" ON review_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "review_votes_update_own" ON review_votes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "review_votes_delete_own" ON review_votes
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- PRICE HISTORY POLICIES
-- ============================================

-- Everyone can read price history
CREATE POLICY "price_history_select_all" ON price_history
  FOR SELECT USING (true);

-- Only admins and property owners can insert price history
CREATE POLICY "price_history_insert_owner" ON price_history
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM properties WHERE id = property_id AND owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- CONVERSATIONS POLICIES
-- ============================================

-- Users can only see conversations they're part of
CREATE POLICY "conversations_select_participant" ON conversations
  FOR SELECT USING (
    auth.uid() = participant_1 
    OR auth.uid() = participant_2
  );

-- Users can create conversations they're part of
CREATE POLICY "conversations_insert_participant" ON conversations
  FOR INSERT WITH CHECK (
    auth.uid() = participant_1 
    OR auth.uid() = participant_2
  );

-- Participants can update conversations
CREATE POLICY "conversations_update_participant" ON conversations
  FOR UPDATE USING (
    auth.uid() = participant_1 
    OR auth.uid() = participant_2
  );

-- ============================================
-- MESSAGES POLICIES
-- ============================================

-- Users can see messages from their conversations
CREATE POLICY "messages_select_conversation" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE id = conversation_id 
      AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
    )
  );

-- Users can send messages to their conversations
CREATE POLICY "messages_insert_conversation" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations 
      WHERE id = conversation_id 
      AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
    )
  );

-- Users can update their own messages (mark as read, etc.)
CREATE POLICY "messages_update_conversation" ON messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE id = conversation_id 
      AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
    )
  );

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================

CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "notifications_delete_own" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

-- System/Admin can insert notifications for any user
CREATE POLICY "notifications_insert_system" ON notifications
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- SEARCH ALERTS POLICIES
-- ============================================

CREATE POLICY "search_alerts_select_own" ON search_alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "search_alerts_insert_own" ON search_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "search_alerts_update_own" ON search_alerts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "search_alerts_delete_own" ON search_alerts
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- PROPERTY VIEWS POLICIES
-- ============================================

-- Everyone can insert views (for analytics)
CREATE POLICY "property_views_insert_all" ON property_views
  FOR INSERT WITH CHECK (true);

-- Only property owners and admins can see views
CREATE POLICY "property_views_select_owner" ON property_views
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM properties WHERE id = property_id AND owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- AGENTS POLICIES
-- ============================================

-- Everyone can view active agents
CREATE POLICY "agents_select_active" ON agents
  FOR SELECT USING (is_active = true OR user_id = auth.uid());

-- Users can create their own agent profile
CREATE POLICY "agents_insert_own" ON agents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own agent profile
CREATE POLICY "agents_update_own" ON agents
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins have full access
CREATE POLICY "agents_admin_all" ON agents
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- AGENT REVIEWS POLICIES
-- ============================================

CREATE POLICY "agent_reviews_select_all" ON agent_reviews
  FOR SELECT USING (true);

CREATE POLICY "agent_reviews_insert_auth" ON agent_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "agent_reviews_update_own" ON agent_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "agent_reviews_delete_own" ON agent_reviews
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- APPOINTMENTS POLICIES
-- ============================================

-- Users can view appointments they created or are assigned to
CREATE POLICY "appointments_select_involved" ON appointments
  FOR SELECT USING (
    auth.uid() = client_id
    OR auth.uid() = agent_id
    OR EXISTS (SELECT 1 FROM properties WHERE id = property_id AND owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Anyone can create an appointment (even non-authenticated for booking forms)
CREATE POLICY "appointments_insert_all" ON appointments
  FOR INSERT WITH CHECK (true);

-- Clients can update their own appointments (cancel, etc.)
CREATE POLICY "appointments_update_client" ON appointments
  FOR UPDATE USING (
    auth.uid() = client_id
  ) WITH CHECK (
    auth.uid() = client_id
  );

-- Agents and property owners can update appointments assigned to them
CREATE POLICY "appointments_update_agent_owner" ON appointments
  FOR UPDATE USING (
    auth.uid() = agent_id
    OR EXISTS (SELECT 1 FROM properties WHERE id = property_id AND owner_id = auth.uid())
  );

-- Admins have full access
CREATE POLICY "appointments_admin_all" ON appointments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Clients can cancel (delete) their own appointments
CREATE POLICY "appointments_delete_client" ON appointments
  FOR DELETE USING (auth.uid() = client_id);

-- Property owners can delete appointments for their properties
CREATE POLICY "appointments_delete_owner" ON appointments
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM properties WHERE id = property_id AND owner_id = auth.uid())
  );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

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

CREATE TRIGGER properties_location_update
  BEFORE INSERT OR UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_property_location();

-- Increment property views
CREATE OR REPLACE FUNCTION increment_property_views(property_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE properties SET views = views + 1 WHERE id = property_uuid;
END;
$$ LANGUAGE plpgsql;

-- Update saves count
CREATE OR REPLACE FUNCTION update_saves_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE properties SET saves = saves + 1 WHERE id = NEW.property_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE properties SET saves = saves - 1 WHERE id = OLD.property_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER saved_properties_count
  AFTER INSERT OR DELETE ON saved_properties
  FOR EACH ROW EXECUTE FUNCTION update_saves_count();

-- Update review statistics on properties
CREATE OR REPLACE FUNCTION update_property_review_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE properties 
    SET 
      average_rating = (SELECT AVG(rating) FROM reviews WHERE property_id = NEW.property_id),
      review_count = (SELECT COUNT(*) FROM reviews WHERE property_id = NEW.property_id)
    WHERE id = NEW.property_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE properties 
    SET 
      average_rating = COALESCE((SELECT AVG(rating) FROM reviews WHERE property_id = OLD.property_id), 0),
      review_count = (SELECT COUNT(*) FROM reviews WHERE property_id = OLD.property_id)
    WHERE id = OLD.property_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reviews_stats_update
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_property_review_stats();

-- Update review helpful count
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.is_helpful THEN
      UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = NEW.review_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.is_helpful THEN
      UPDATE reviews SET helpful_count = helpful_count - 1 WHERE id = OLD.review_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.is_helpful AND NOT NEW.is_helpful THEN
      UPDATE reviews SET helpful_count = helpful_count - 1 WHERE id = NEW.review_id;
    ELSIF NOT OLD.is_helpful AND NEW.is_helpful THEN
      UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = NEW.review_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER review_votes_count
  AFTER INSERT OR UPDATE OR DELETE ON review_votes
  FOR EACH ROW EXECUTE FUNCTION update_review_helpful_count();

-- Record price changes automatically
CREATE OR REPLACE FUNCTION record_price_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.price IS DISTINCT FROM NEW.price THEN
    INSERT INTO price_history (property_id, price, currency, event_type, event_description)
    VALUES (NEW.id, NEW.price, NEW.currency, 'price_change', 
      CASE 
        WHEN NEW.price < OLD.price THEN 'Price reduced'
        ELSE 'Price increased'
      END
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER properties_price_change
  AFTER UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION record_price_change();

-- Record initial listing
CREATE OR REPLACE FUNCTION record_initial_listing()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO price_history (property_id, price, currency, event_type, event_description)
  VALUES (NEW.id, NEW.price, NEW.currency, 'listed', 'Property listed');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER properties_initial_listing
  AFTER INSERT ON properties
  FOR EACH ROW EXECUTE FUNCTION record_initial_listing();

-- Update conversation last message
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations 
  SET 
    last_message_at = NEW.created_at,
    last_message_preview = LEFT(NEW.content, 100)
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER messages_update_conversation
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

-- Notify property owner when appointment is booked
CREATE OR REPLACE FUNCTION notify_appointment_created()
RETURNS TRIGGER AS $$
DECLARE
  property_owner_id UUID;
  property_title TEXT;
BEGIN
  -- Get property owner and title
  SELECT owner_id, title INTO property_owner_id, property_title
  FROM properties WHERE id = NEW.property_id;
  
  -- Create notification for property owner
  INSERT INTO notifications (user_id, title, title_en, body, body_en, type, data)
  VALUES (
    COALESCE(NEW.agent_id, property_owner_id),
    'Nouveau rendez-vous',
    'New Appointment',
    'Un rendez-vous a été demandé pour ' || property_title || ' le ' || TO_CHAR(NEW.appointment_date, 'DD/MM/YYYY') || ' à ' || TO_CHAR(NEW.appointment_time, 'HH24:MI'),
    'An appointment has been requested for ' || property_title || ' on ' || TO_CHAR(NEW.appointment_date, 'MM/DD/YYYY') || ' at ' || TO_CHAR(NEW.appointment_time, 'HH24:MI'),
    'appointment',
    jsonb_build_object(
      'appointment_id', NEW.id,
      'property_id', NEW.property_id,
      'client_name', NEW.client_name,
      'appointment_date', NEW.appointment_date,
      'appointment_time', NEW.appointment_time,
      'appointment_type', NEW.appointment_type
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER appointments_notify_created
  AFTER INSERT ON appointments
  FOR EACH ROW EXECUTE FUNCTION notify_appointment_created();

-- Notify client when appointment status changes
CREATE OR REPLACE FUNCTION notify_appointment_status_change()
RETURNS TRIGGER AS $$
DECLARE
  property_title TEXT;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.client_id IS NOT NULL THEN
    -- Get property title
    SELECT title INTO property_title FROM properties WHERE id = NEW.property_id;
    
    -- Create notification for client
    INSERT INTO notifications (user_id, title, title_en, body, body_en, type, data)
    VALUES (
      NEW.client_id,
      CASE NEW.status
        WHEN 'confirmed' THEN 'Rendez-vous confirmé'
        WHEN 'cancelled' THEN 'Rendez-vous annulé'
        WHEN 'completed' THEN 'Rendez-vous terminé'
        ELSE 'Mise à jour du rendez-vous'
      END,
      CASE NEW.status
        WHEN 'confirmed' THEN 'Appointment Confirmed'
        WHEN 'cancelled' THEN 'Appointment Cancelled'
        WHEN 'completed' THEN 'Appointment Completed'
        ELSE 'Appointment Update'
      END,
      'Votre rendez-vous pour ' || property_title || ' a été ' || 
      CASE NEW.status
        WHEN 'confirmed' THEN 'confirmé'
        WHEN 'cancelled' THEN 'annulé'
        WHEN 'completed' THEN 'marqué comme terminé'
        ELSE 'mis à jour'
      END,
      'Your appointment for ' || property_title || ' has been ' || 
      CASE NEW.status
        WHEN 'confirmed' THEN 'confirmed'
        WHEN 'cancelled' THEN 'cancelled'
        WHEN 'completed' THEN 'marked as completed'
        ELSE 'updated'
      END,
      'appointment',
      jsonb_build_object(
        'appointment_id', NEW.id,
        'property_id', NEW.property_id,
        'status', NEW.status,
        'appointment_date', NEW.appointment_date,
        'appointment_time', NEW.appointment_time
      )
    );
    
    -- Update timestamp based on status
    IF NEW.status = 'confirmed' THEN
      NEW.confirmed_at = NOW();
    ELSIF NEW.status = 'completed' THEN
      NEW.completed_at = NOW();
    ELSIF NEW.status = 'cancelled' THEN
      NEW.cancelled_at = NOW();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER appointments_notify_status_change
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION notify_appointment_status_change();

-- Function to get available time slots for a property on a specific date
CREATE OR REPLACE FUNCTION get_available_slots(
  p_property_id UUID,
  p_date DATE,
  p_start_hour INTEGER DEFAULT 8,
  p_end_hour INTEGER DEFAULT 17,
  p_duration_minutes INTEGER DEFAULT 30
)
RETURNS TABLE (slot_time TIME) AS $$
DECLARE
  current_slot TIME;
BEGIN
  current_slot := (p_start_hour || ':00')::TIME;
  
  WHILE current_slot < (p_end_hour || ':00')::TIME LOOP
    -- Check if slot is not already booked
    IF NOT EXISTS (
      SELECT 1 FROM appointments
      WHERE property_id = p_property_id
      AND appointment_date = p_date
      AND appointment_time = current_slot
      AND status NOT IN ('cancelled', 'no_show')
    ) THEN
      slot_time := current_slot;
      RETURN NEXT;
    END IF;
    
    current_slot := current_slot + (p_duration_minutes || ' minutes')::INTERVAL;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- GEOSPATIAL FUNCTIONS (PostGIS)
-- ============================================

-- Get nearby properties within a radius
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
    p.id,
    p.title,
    p.title_en,
    p.type,
    p.price,
    p.currency,
    p.price_type,
    p.address,
    p.city,
    p.province,
    p.latitude,
    p.longitude,
    p.bedrooms,
    p.bathrooms,
    p.area,
    p.images,
    p.is_featured,
    ST_Distance(
      p.location,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
    ) / 1000 AS distance_km
  FROM properties p
  WHERE p.status = 'active'
    AND p.location IS NOT NULL
    AND ST_DWithin(
      p.location,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
      radius_km * 1000
    )
  ORDER BY 
    p.is_featured DESC,
    distance_km ASC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Get properties within a bounding box (for map view)
CREATE OR REPLACE FUNCTION get_properties_in_bounds(
  min_lat DOUBLE PRECISION,
  min_lng DOUBLE PRECISION,
  max_lat DOUBLE PRECISION,
  max_lng DOUBLE PRECISION,
  max_results INTEGER DEFAULT 100
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  price NUMERIC,
  currency currency_type,
  price_type price_type,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  type property_type,
  bedrooms INTEGER,
  images TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.price,
    p.currency,
    p.price_type,
    p.latitude,
    p.longitude,
    p.type,
    p.bedrooms,
    p.images
  FROM properties p
  WHERE p.status = 'active'
    AND p.latitude BETWEEN min_lat AND max_lat
    AND p.longitude BETWEEN min_lng AND max_lng
  ORDER BY p.is_featured DESC, p.created_at DESC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ANALYTICS FUNCTIONS
-- ============================================

-- Get property statistics for a date range
CREATE OR REPLACE FUNCTION get_property_stats(
  property_uuid UUID,
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  date DATE,
  views_count BIGINT,
  saves_count BIGINT,
  inquiries_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH dates AS (
    SELECT generate_series(start_date, end_date, '1 day')::DATE AS date
  ),
  views AS (
    SELECT DATE(created_at) AS date, COUNT(*) AS count
    FROM property_views
    WHERE property_id = property_uuid
      AND DATE(created_at) BETWEEN start_date AND end_date
    GROUP BY DATE(created_at)
  ),
  saves AS (
    SELECT DATE(created_at) AS date, COUNT(*) AS count
    FROM saved_properties
    WHERE property_id = property_uuid
      AND DATE(created_at) BETWEEN start_date AND end_date
    GROUP BY DATE(created_at)
  ),
  inqs AS (
    SELECT DATE(created_at) AS date, COUNT(*) AS count
    FROM inquiries
    WHERE property_id = property_uuid
      AND DATE(created_at) BETWEEN start_date AND end_date
    GROUP BY DATE(created_at)
  )
  SELECT 
    d.date,
    COALESCE(v.count, 0) AS views_count,
    COALESCE(s.count, 0) AS saves_count,
    COALESCE(i.count, 0) AS inquiries_count
  FROM dates d
  LEFT JOIN views v ON d.date = v.date
  LEFT JOIN saves s ON d.date = s.date
  LEFT JOIN inqs i ON d.date = i.date
  ORDER BY d.date;
END;
$$ LANGUAGE plpgsql;

-- Get top properties by metric
CREATE OR REPLACE FUNCTION get_top_properties(
  metric TEXT DEFAULT 'views', -- 'views', 'saves', 'inquiries'
  limit_count INTEGER DEFAULT 10,
  days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  city TEXT,
  type property_type,
  price NUMERIC,
  images TEXT[],
  metric_value BIGINT
) AS $$
BEGIN
  IF metric = 'saves' THEN
    RETURN QUERY
    SELECT 
      p.id, p.title, p.city, p.type, p.price, p.images,
      COUNT(sp.id)::BIGINT AS metric_value
    FROM properties p
    LEFT JOIN saved_properties sp ON sp.property_id = p.id
      AND sp.created_at >= CURRENT_DATE - (days_back || ' days')::INTERVAL
    WHERE p.status = 'active'
    GROUP BY p.id
    ORDER BY metric_value DESC
    LIMIT limit_count;
  ELSIF metric = 'inquiries' THEN
    RETURN QUERY
    SELECT 
      p.id, p.title, p.city, p.type, p.price, p.images,
      COUNT(i.id)::BIGINT AS metric_value
    FROM properties p
    LEFT JOIN inquiries i ON i.property_id = p.id
      AND i.created_at >= CURRENT_DATE - (days_back || ' days')::INTERVAL
    WHERE p.status = 'active'
    GROUP BY p.id
    ORDER BY metric_value DESC
    LIMIT limit_count;
  ELSE
    RETURN QUERY
    SELECT 
      p.id, p.title, p.city, p.type, p.price, p.images,
      COUNT(pv.id)::BIGINT AS metric_value
    FROM properties p
    LEFT JOIN property_views pv ON pv.property_id = p.id
      AND pv.created_at >= CURRENT_DATE - (days_back || ' days')::INTERVAL
    WHERE p.status = 'active'
    GROUP BY p.id
    ORDER BY metric_value DESC
    LIMIT limit_count;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SEARCH ALERTS MATCHING
-- ============================================

-- Check if a property matches search alert filters
CREATE OR REPLACE FUNCTION check_alert_matches()
RETURNS TRIGGER AS $$
DECLARE
  alert RECORD;
  filters JSONB;
  matches BOOLEAN;
BEGIN
  -- Only check for newly active properties
  IF NEW.status = 'active' AND (OLD.status IS NULL OR OLD.status != 'active') THEN
    FOR alert IN SELECT * FROM search_alerts WHERE is_active = true
    LOOP
      filters := alert.filters;
      matches := true;
      
      -- Check type filter
      IF filters ? 'type' AND NEW.type != (filters->>'type') THEN
        matches := false;
      END IF;
      
      -- Check city filter
      IF filters ? 'city' AND NEW.city != (filters->>'city') THEN
        matches := false;
      END IF;
      
      -- Check province filter
      IF filters ? 'province' AND NEW.province != (filters->>'province') THEN
        matches := false;
      END IF;
      
      -- Check price range
      IF filters ? 'priceMin' AND NEW.price < (filters->>'priceMin')::NUMERIC THEN
        matches := false;
      END IF;
      
      IF filters ? 'priceMax' AND NEW.price > (filters->>'priceMax')::NUMERIC THEN
        matches := false;
      END IF;
      
      -- Check bedrooms
      IF filters ? 'bedrooms' AND NEW.bedrooms < (filters->>'bedrooms')::INTEGER THEN
        matches := false;
      END IF;
      
      -- If matches, create notification
      IF matches THEN
        INSERT INTO notifications (user_id, title, title_en, body, body_en, type, data)
        VALUES (
          alert.user_id,
          'Nouvelle propriété correspondante',
          'New Matching Property',
          'Une nouvelle propriété correspond à votre alerte "' || alert.name || '"',
          'A new property matches your alert "' || alert.name || '"',
          'alert',
          jsonb_build_object(
            'property_id', NEW.id,
            'alert_id', alert.id,
            'alert_name', alert.name
          )
        );
        
        -- Update alert stats
        UPDATE search_alerts 
        SET match_count = match_count + 1, last_triggered_at = NOW()
        WHERE id = alert.id;
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER properties_check_alerts
  AFTER INSERT OR UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION check_alert_matches();

-- ============================================
-- STORAGE BUCKETS (Run in Supabase Dashboard)
-- ============================================

-- Run these in Supabase Dashboard > Storage:
-- 
-- CREATE BUCKET 'property-images' (public)
-- CREATE BUCKET 'avatars' (public)  
-- CREATE BUCKET 'documents' (private)
-- CREATE BUCKET 'chat-attachments' (private)
--
-- Storage policies:
--
-- property-images:
--   SELECT: public (anyone can view)
--   INSERT: authenticated (auth.role() = 'authenticated')
--   UPDATE: owner only (owner_id in metadata)
--   DELETE: owner only
--
-- avatars:
--   SELECT: public
--   INSERT: authenticated (auth.uid()::text = (storage.foldername(name))[1])
--   UPDATE: own files only
--   DELETE: own files only
--
-- chat-attachments:
--   SELECT: conversation participants only
--   INSERT: authenticated
--   DELETE: owner only

-- ============================================
-- REALTIME SUBSCRIPTIONS
-- ============================================

-- Enable realtime for these tables:
-- ALTER PUBLICATION supabase_realtime ADD TABLE messages;
-- ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
-- ALTER PUBLICATION supabase_realtime ADD TABLE inquiries;
