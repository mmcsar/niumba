-- ============================================
-- NIUMBA - INTÉGRATION COMPLÈTE SUPABASE
-- Crée tout ce qui manque : tables, RLS, policies, index
-- ============================================
-- 
-- Ce script vérifie et crée tout ce qui manque
-- Exécutez-le dans Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. EXTENSIONS
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 2. TYPES ENUM (Créer seulement s'ils n'existent pas)
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
-- 3. TABLES (Créer seulement si elles n'existent pas)
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
-- 4. INDEX POUR PERFORMANCE (Créer seulement s'ils n'existent pas)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_properties_city_status ON properties(city_id, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_properties_owner ON properties(owner_id, status);
CREATE INDEX IF NOT EXISTS idx_properties_city_type_status ON properties(city_id, type, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at DESC) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_saved_properties_user ON saved_properties(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_properties_property ON saved_properties(property_id);

CREATE INDEX IF NOT EXISTS idx_inquiries_property ON inquiries(property_id, status);
CREATE INDEX IF NOT EXISTS idx_inquiries_owner ON inquiries(owner_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_sender ON inquiries(sender_id, created_at DESC) WHERE sender_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_appointments_client ON appointments(client_id, status, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_agent ON appointments(agent_id, status, appointment_date) WHERE agent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_appointments_property ON appointments(property_id, appointment_date);

CREATE INDEX IF NOT EXISTS idx_reviews_property ON reviews(property_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations(participant1_id, participant2_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_date ON messages(conversation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC) WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_search_alerts_user ON search_alerts(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_agents_active_verified ON agents(is_active, is_verified) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_cities_province_active ON cities(province, is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_property_views_property_date ON property_views(property_id, viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_price_history_property_date ON price_history(property_id, recorded_at DESC);

-- ============================================
-- 5. ACTIVATION RLS (Activer seulement si pas déjà activé)
-- ============================================

DO $$ 
DECLARE
  table_name TEXT;
  tables_to_check TEXT[] := ARRAY[
    'profiles', 'properties', 'saved_properties', 'inquiries',
    'appointments', 'reviews', 'conversations', 'messages',
    'notifications', 'search_alerts', 'agents', 'cities',
    'price_history', 'property_views'
  ];
BEGIN
  FOREACH table_name IN ARRAY tables_to_check
  LOOP
    -- Vérifier si la table existe et activer RLS
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = table_name) THEN
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
    END IF;
  END LOOP;
END $$;

-- ============================================
-- 6. POLICIES RLS (Créer seulement si elles n'existent pas)
-- ============================================

-- PROFILES
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'profiles_select_public') THEN
    CREATE POLICY "profiles_select_public" ON profiles FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'profiles_update_own') THEN
    CREATE POLICY "profiles_update_own" ON profiles 
      FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'profiles_insert_own') THEN
    CREATE POLICY "profiles_insert_own" ON profiles 
      FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- PROPERTIES
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'properties' AND policyname = 'properties_select_public') THEN
    CREATE POLICY "properties_select_public" ON properties 
      FOR SELECT USING (
        status = 'active' 
        OR owner_id = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'properties' AND policyname = 'properties_insert_authenticated') THEN
    CREATE POLICY "properties_insert_authenticated" ON properties 
      FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
        AND auth.uid() = owner_id
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'properties' AND policyname = 'properties_update_own') THEN
    CREATE POLICY "properties_update_own" ON properties 
      FOR UPDATE USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'properties' AND policyname = 'properties_delete_own') THEN
    CREATE POLICY "properties_delete_own" ON properties 
      FOR DELETE USING (auth.uid() = owner_id);
  END IF;
END $$;

-- SAVED_PROPERTIES
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'saved_properties' AND policyname = 'saved_select_authenticated') THEN
    CREATE POLICY "saved_select_authenticated" ON saved_properties 
      FOR SELECT USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'saved_properties' AND policyname = 'saved_insert_authenticated') THEN
    CREATE POLICY "saved_insert_authenticated" ON saved_properties 
      FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'saved_properties' AND policyname = 'saved_delete_authenticated') THEN
    CREATE POLICY "saved_delete_authenticated" ON saved_properties 
      FOR DELETE USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);
  END IF;
END $$;

-- INQUIRIES
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'inquiries' AND policyname = 'inquiries_select_authenticated') THEN
    CREATE POLICY "inquiries_select_authenticated" ON inquiries 
      FOR SELECT USING (
        auth.uid() IS NOT NULL 
        AND (sender_id = auth.uid() OR owner_id = auth.uid())
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'inquiries' AND policyname = 'inquiries_insert_authenticated') THEN
    CREATE POLICY "inquiries_insert_authenticated" ON inquiries 
      FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'inquiries' AND policyname = 'inquiries_update_authenticated') THEN
    CREATE POLICY "inquiries_update_authenticated" ON inquiries 
      FOR UPDATE USING (auth.uid() IS NOT NULL AND owner_id = auth.uid())
      WITH CHECK (auth.uid() IS NOT NULL AND owner_id = auth.uid());
  END IF;
END $$;

-- APPOINTMENTS
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'appointments' AND policyname = 'appointments_select_authenticated') THEN
    CREATE POLICY "appointments_select_authenticated" ON appointments 
      FOR SELECT USING (
        auth.uid() IS NOT NULL 
        AND (client_id = auth.uid() OR agent_id = auth.uid())
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'appointments' AND policyname = 'appointments_insert_authenticated') THEN
    CREATE POLICY "appointments_insert_authenticated" ON appointments 
      FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND client_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'appointments' AND policyname = 'appointments_update_authenticated') THEN
    CREATE POLICY "appointments_update_authenticated" ON appointments 
      FOR UPDATE USING (
        auth.uid() IS NOT NULL 
        AND (client_id = auth.uid() OR agent_id = auth.uid())
      )
      WITH CHECK (
        auth.uid() IS NOT NULL 
        AND (client_id = auth.uid() OR agent_id = auth.uid())
      );
  END IF;
END $$;

-- REVIEWS
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reviews' AND policyname = 'reviews_select_public') THEN
    CREATE POLICY "reviews_select_public" ON reviews FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reviews' AND policyname = 'reviews_insert_authenticated') THEN
    CREATE POLICY "reviews_insert_authenticated" ON reviews 
      FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reviews' AND policyname = 'reviews_update_own') THEN
    CREATE POLICY "reviews_update_own" ON reviews 
      FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- CONVERSATIONS
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'conversations' AND policyname = 'conversations_select_authenticated') THEN
    CREATE POLICY "conversations_select_authenticated" ON conversations 
      FOR SELECT USING (
        auth.uid() IS NOT NULL 
        AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'conversations' AND policyname = 'conversations_insert_authenticated') THEN
    CREATE POLICY "conversations_insert_authenticated" ON conversations 
      FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL 
        AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
      );
  END IF;
END $$;

-- MESSAGES
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'messages' AND policyname = 'messages_select_authenticated') THEN
    CREATE POLICY "messages_select_authenticated" ON messages 
      FOR SELECT USING (
        auth.uid() IS NOT NULL 
        AND EXISTS (
          SELECT 1 FROM conversations c 
          WHERE c.id = messages.conversation_id 
          AND (c.participant1_id = auth.uid() OR c.participant2_id = auth.uid())
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'messages' AND policyname = 'messages_insert_authenticated') THEN
    CREATE POLICY "messages_insert_authenticated" ON messages 
      FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND sender_id = auth.uid());
  END IF;
END $$;

-- NOTIFICATIONS
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'notifications' AND policyname = 'notifications_select_authenticated') THEN
    CREATE POLICY "notifications_select_authenticated" ON notifications 
      FOR SELECT USING (auth.uid() IS NOT NULL AND user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'notifications' AND policyname = 'notifications_update_authenticated') THEN
    CREATE POLICY "notifications_update_authenticated" ON notifications 
      FOR UPDATE USING (auth.uid() IS NOT NULL AND user_id = auth.uid())
      WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());
  END IF;
END $$;

-- SEARCH_ALERTS
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'search_alerts' AND policyname = 'search_alerts_select_authenticated') THEN
    CREATE POLICY "search_alerts_select_authenticated" ON search_alerts 
      FOR SELECT USING (auth.uid() IS NOT NULL AND user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'search_alerts' AND policyname = 'search_alerts_insert_authenticated') THEN
    CREATE POLICY "search_alerts_insert_authenticated" ON search_alerts 
      FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'search_alerts' AND policyname = 'search_alerts_delete_authenticated') THEN
    CREATE POLICY "search_alerts_delete_authenticated" ON search_alerts 
      FOR DELETE USING (auth.uid() IS NOT NULL AND user_id = auth.uid());
  END IF;
END $$;

-- AGENTS
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'agents' AND policyname = 'agents_select_public') THEN
    CREATE POLICY "agents_select_public" ON agents 
      FOR SELECT USING (is_active = true OR user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'agents' AND policyname = 'agents_upsert_own') THEN
    CREATE POLICY "agents_upsert_own" ON agents 
      FOR ALL USING (auth.uid() IS NOT NULL AND user_id = auth.uid())
      WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());
  END IF;
END $$;

-- CITIES
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'cities' AND policyname = 'cities_select_public') THEN
    CREATE POLICY "cities_select_public" ON cities FOR SELECT USING (true);
  END IF;
END $$;

-- PRICE_HISTORY
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'price_history' AND policyname = 'price_history_select_public') THEN
    CREATE POLICY "price_history_select_public" ON price_history FOR SELECT USING (true);
  END IF;
END $$;

-- PROPERTY_VIEWS
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'property_views' AND policyname = 'property_views_insert_public') THEN
    CREATE POLICY "property_views_insert_public" ON property_views 
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'property_views' AND policyname = 'property_views_select_owner') THEN
    CREATE POLICY "property_views_select_owner" ON property_views 
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM properties p 
          WHERE p.id = property_views.property_id 
          AND p.owner_id = auth.uid()
        )
      );
  END IF;
END $$;

-- ============================================
-- 7. DONNÉES INITIALES - VILLES (Lualaba & Haut-Katanga)
-- ============================================

INSERT INTO cities (name, name_en, code, province, is_active) VALUES
  ('Lubumbashi', 'Lubumbashi', 'LUB', 'Haut-Katanga', true),
  ('Likasi', 'Likasi', 'LIK', 'Haut-Katanga', true),
  ('Kipushi', 'Kipushi', 'KIP', 'Haut-Katanga', true),
  ('Kasumbalesa', 'Kasumbalesa', 'KAS', 'Haut-Katanga', true),
  ('Kambove', 'Kambove', 'KAM', 'Haut-Katanga', true),
  ('Kolwezi', 'Kolwezi', 'KOL', 'Lualaba', true),
  ('Fungurume', 'Fungurume', 'FUN', 'Lualaba', true),
  ('Dilolo', 'Dilolo', 'DIL', 'Lualaba', true),
  ('Mutshatsha', 'Mutshatsha', 'MUT', 'Lualaba', true)
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- 8. VÉRIFICATION FINALE
-- ============================================

-- Vérifier les tables créées
SELECT 
  'Tables créées' as verification,
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
  'Policies créées' as verification,
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

-- Vérifier les index créés
SELECT 
  'Index créés' as verification,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'properties', 'saved_properties', 'inquiries',
    'appointments', 'reviews', 'conversations', 'messages',
    'notifications', 'search_alerts', 'agents', 'cities',
    'price_history', 'property_views'
  )
ORDER BY tablename, indexname;

-- ============================================
-- FIN
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Intégration complète terminée !';
  RAISE NOTICE '✅ Toutes les tables ont été créées/vérifiées !';
  RAISE NOTICE '✅ RLS activé sur toutes les tables !';
  RAISE NOTICE '✅ Toutes les policies ont été créées !';
  RAISE NOTICE '✅ Tous les index ont été créés !';
  RAISE NOTICE '✅ Villes de Lualaba & Haut-Katanga ajoutées !';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Votre backend Supabase est maintenant complet !';
  RAISE NOTICE '';
END $$;


