-- ============================================
-- NIUMBA - CRÉATION BACKEND COMPLET
-- Crée toutes les tables + RLS + Policies en une fois
-- ============================================
-- 
-- INSTRUCTIONS :
-- 1. Exécutez ce script dans Supabase SQL Editor
-- 2. Il crée TOUT : tables, RLS, policies
-- 3. Si une table existe déjà, elle sera ignorée
-- ============================================

-- ============================================
-- 1. EXTENSIONS
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 2. TYPES ENUM
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

-- ============================================
-- 3. TABLES PRINCIPALES
-- ============================================

-- PROFILES
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

-- PROPERTIES
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
  city_id UUID,
  province TEXT NOT NULL CHECK (province IN ('Haut-Katanga', 'Lualaba')),
  neighborhood TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
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
  is_featured BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SAVED_PROPERTIES
CREATE TABLE IF NOT EXISTS saved_properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- INQUIRIES
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

-- APPOINTMENTS
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  appointment_type appointment_type DEFAULT 'in_person',
  status appointment_status DEFAULT 'pending',
  notes TEXT,
  client_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  comment_en TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(property_id, user_id)
);

-- CONVERSATIONS
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  participant2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant1_id, participant2_id, property_id)
);

-- MESSAGES
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  status message_status DEFAULT 'sent',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  title_en TEXT,
  message TEXT NOT NULL,
  message_en TEXT,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SEARCH_ALERTS
CREATE TABLE IF NOT EXISTS search_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  city TEXT,
  province TEXT,
  min_price NUMERIC(15, 2),
  max_price NUMERIC(15, 2),
  property_type property_type,
  price_type price_type,
  bedrooms INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AGENTS
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  agency_name TEXT,
  license_number TEXT,
  bio TEXT,
  bio_en TEXT,
  specializations TEXT[] DEFAULT '{}',
  service_areas TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CITIES
CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_en TEXT,
  code TEXT UNIQUE,
  province TEXT NOT NULL CHECK (province IN ('Haut-Katanga', 'Lualaba')),
  population INTEGER,
  coordinates JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRICE_HISTORY
CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  price NUMERIC(15, 2) NOT NULL,
  currency currency_type DEFAULT 'USD',
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROPERTY_VIEWS
CREATE TABLE IF NOT EXISTS property_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. INDEX POUR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_properties_city_status ON properties(city_id, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_properties_owner ON properties(owner_id, status);
CREATE INDEX IF NOT EXISTS idx_saved_properties_user ON saved_properties(user_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_property ON inquiries(property_id, status);
CREATE INDEX IF NOT EXISTS idx_inquiries_owner ON inquiries(owner_id, status);
CREATE INDEX IF NOT EXISTS idx_appointments_client ON appointments(client_id, status);
CREATE INDEX IF NOT EXISTS idx_reviews_property ON reviews(property_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_cities_province ON cities(province, is_active);

-- ============================================
-- 5. ACTIVATION RLS
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_views ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. POLICIES RLS
-- ============================================

-- PROFILES
DROP POLICY IF EXISTS "profiles_select_public" ON profiles;
CREATE POLICY "profiles_select_public" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles 
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- PROPERTIES
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

-- SAVED_PROPERTIES
DROP POLICY IF EXISTS "saved_select_authenticated" ON saved_properties;
CREATE POLICY "saved_select_authenticated" ON saved_properties 
  FOR SELECT USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_insert_authenticated" ON saved_properties;
CREATE POLICY "saved_insert_authenticated" ON saved_properties 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_delete_authenticated" ON saved_properties;
CREATE POLICY "saved_delete_authenticated" ON saved_properties 
  FOR DELETE USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- INQUIRIES
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

-- APPOINTMENTS
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

-- REVIEWS
DROP POLICY IF EXISTS "reviews_select_public" ON reviews;
CREATE POLICY "reviews_select_public" ON reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "reviews_insert_authenticated" ON reviews;
CREATE POLICY "reviews_insert_authenticated" ON reviews 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

DROP POLICY IF EXISTS "reviews_update_own" ON reviews;
CREATE POLICY "reviews_update_own" ON reviews 
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- CONVERSATIONS
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

-- MESSAGES
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

-- NOTIFICATIONS
DROP POLICY IF EXISTS "notifications_select_authenticated" ON notifications;
CREATE POLICY "notifications_select_authenticated" ON notifications 
  FOR SELECT USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_update_authenticated" ON notifications;
CREATE POLICY "notifications_update_authenticated" ON notifications 
  FOR UPDATE USING (auth.uid() IS NOT NULL AND user_id = auth.uid())
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- SEARCH_ALERTS
DROP POLICY IF EXISTS "search_alerts_select_authenticated" ON search_alerts;
CREATE POLICY "search_alerts_select_authenticated" ON search_alerts 
  FOR SELECT USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

DROP POLICY IF EXISTS "search_alerts_insert_authenticated" ON search_alerts;
CREATE POLICY "search_alerts_insert_authenticated" ON search_alerts 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

DROP POLICY IF EXISTS "search_alerts_delete_authenticated" ON search_alerts;
CREATE POLICY "search_alerts_delete_authenticated" ON search_alerts 
  FOR DELETE USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- AGENTS
DROP POLICY IF EXISTS "agents_select_public" ON agents;
CREATE POLICY "agents_select_public" ON agents 
  FOR SELECT USING (is_active = true OR user_id = auth.uid());

DROP POLICY IF EXISTS "agents_upsert_own" ON agents;
CREATE POLICY "agents_upsert_own" ON agents 
  FOR ALL USING (auth.uid() IS NOT NULL AND user_id = auth.uid())
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- CITIES
DROP POLICY IF EXISTS "cities_select_public" ON cities;
CREATE POLICY "cities_select_public" ON cities FOR SELECT USING (true);

-- PRICE_HISTORY
DROP POLICY IF EXISTS "price_history_select_public" ON price_history;
CREATE POLICY "price_history_select_public" ON price_history FOR SELECT USING (true);

-- PROPERTY_VIEWS
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
-- 7. VÉRIFICATION
-- ============================================

SELECT 
  'Tables créées' as info,
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

-- ============================================
-- FIN
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Backend créé avec succès !';
  RAISE NOTICE '✅ Toutes les tables ont été créées !';
  RAISE NOTICE '✅ RLS activé sur toutes les tables !';
  RAISE NOTICE '✅ Toutes les policies ont été créées !';
  RAISE NOTICE '🚀 Votre backend est prêt !';
END $$;


