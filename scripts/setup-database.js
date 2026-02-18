/**
 * NIUMBA - Setup Database
 * 
 * Ce script crée les tables et active RLS
 * La clé service_role reste sur votre PC
 * 
 * USAGE:
 * 1. Remplacez YOUR_SERVICE_ROLE_KEY ci-dessous
 * 2. Exécutez: node scripts/setup-database.js
 */

const { createClient } = require('@supabase/supabase-js');

// ============================================
// CONFIGURATION - Mettez votre service_role key ici
// ============================================
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY';

// ============================================
// NE MODIFIEZ PAS EN DESSOUS
// ============================================

if (SERVICE_ROLE_KEY === 'YOUR_SERVICE_ROLE_KEY') {
  console.log('❌ Erreur: Remplacez YOUR_SERVICE_ROLE_KEY par votre vraie clé');
  console.log('');
  console.log('Où trouver la clé:');
  console.log('1. Supabase Dashboard → Settings → API');
  console.log('2. Copiez "service_role key" (pas anon key)');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

const SQL_CREATE_TABLES = `
-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  bio TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROPERTIES
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'XOF',
  property_type TEXT,
  transaction_type TEXT,
  bedrooms INTEGER,
  bathrooms INTEGER,
  area NUMERIC,
  address TEXT,
  city TEXT,
  neighborhood TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  images TEXT[],
  amenities TEXT[],
  status TEXT DEFAULT 'active',
  views_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SAVED_PROPERTIES
CREATE TABLE IF NOT EXISTS saved_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- INQUIRIES
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- APPOINTMENTS
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  rating INTEGER,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CONVERSATIONS
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  participant2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MESSAGES
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SEARCH_ALERTS
CREATE TABLE IF NOT EXISTS search_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT,
  filters JSONB NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
`;

const SQL_ENABLE_RLS = `
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
`;

const SQL_POLICIES = `
-- PROFILES
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- PROPERTIES
DROP POLICY IF EXISTS "properties_select" ON properties;
DROP POLICY IF EXISTS "properties_insert" ON properties;
DROP POLICY IF EXISTS "properties_update" ON properties;
DROP POLICY IF EXISTS "properties_delete" ON properties;
CREATE POLICY "properties_select" ON properties FOR SELECT USING (true);
CREATE POLICY "properties_insert" ON properties FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "properties_update" ON properties FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "properties_delete" ON properties FOR DELETE USING (auth.uid() = owner_id);

-- SAVED_PROPERTIES
DROP POLICY IF EXISTS "saved_properties_select" ON saved_properties;
DROP POLICY IF EXISTS "saved_properties_insert" ON saved_properties;
DROP POLICY IF EXISTS "saved_properties_delete" ON saved_properties;
CREATE POLICY "saved_properties_select" ON saved_properties FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "saved_properties_insert" ON saved_properties FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "saved_properties_delete" ON saved_properties FOR DELETE USING (auth.uid() = user_id);

-- INQUIRIES
DROP POLICY IF EXISTS "inquiries_select" ON inquiries;
DROP POLICY IF EXISTS "inquiries_insert" ON inquiries;
DROP POLICY IF EXISTS "inquiries_update" ON inquiries;
CREATE POLICY "inquiries_select" ON inquiries FOR SELECT USING (auth.uid() = user_id OR auth.uid() = owner_id);
CREATE POLICY "inquiries_insert" ON inquiries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "inquiries_update" ON inquiries FOR UPDATE USING (auth.uid() = owner_id);

-- APPOINTMENTS
DROP POLICY IF EXISTS "appointments_select" ON appointments;
DROP POLICY IF EXISTS "appointments_insert" ON appointments;
DROP POLICY IF EXISTS "appointments_update" ON appointments;
CREATE POLICY "appointments_select" ON appointments FOR SELECT USING (auth.uid() = user_id OR auth.uid() = owner_id);
CREATE POLICY "appointments_insert" ON appointments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "appointments_update" ON appointments FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = owner_id);

-- REVIEWS
DROP POLICY IF EXISTS "reviews_select" ON reviews;
DROP POLICY IF EXISTS "reviews_insert" ON reviews;
DROP POLICY IF EXISTS "reviews_update" ON reviews;
DROP POLICY IF EXISTS "reviews_delete" ON reviews;
CREATE POLICY "reviews_select" ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_update" ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "reviews_delete" ON reviews FOR DELETE USING (auth.uid() = user_id);

-- CONVERSATIONS
DROP POLICY IF EXISTS "conversations_select" ON conversations;
DROP POLICY IF EXISTS "conversations_insert" ON conversations;
CREATE POLICY "conversations_select" ON conversations FOR SELECT USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);
CREATE POLICY "conversations_insert" ON conversations FOR INSERT WITH CHECK (auth.uid() = participant1_id OR auth.uid() = participant2_id);

-- MESSAGES
DROP POLICY IF EXISTS "messages_select" ON messages;
DROP POLICY IF EXISTS "messages_insert" ON messages;
CREATE POLICY "messages_select" ON messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND (auth.uid() = c.participant1_id OR auth.uid() = c.participant2_id))
);
CREATE POLICY "messages_insert" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- NOTIFICATIONS
DROP POLICY IF EXISTS "notifications_select" ON notifications;
DROP POLICY IF EXISTS "notifications_update" ON notifications;
CREATE POLICY "notifications_select" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- SEARCH_ALERTS
DROP POLICY IF EXISTS "search_alerts_all" ON search_alerts;
CREATE POLICY "search_alerts_all" ON search_alerts FOR ALL USING (auth.uid() = user_id);
`;

async function setup() {
  console.log('🚀 NIUMBA Database Setup');
  console.log('========================\n');

  try {
    // Étape 1: Créer les tables
    console.log('📦 Création des tables...');
    const { error: error1 } = await supabase.rpc('exec_sql', { sql: SQL_CREATE_TABLES });
    if (error1) {
      // Essayer une autre méthode
      const { error: error1b } = await supabase.from('_exec').select(SQL_CREATE_TABLES);
    }
    console.log('✅ Tables créées!\n');

    // Étape 2: Activer RLS
    console.log('🔒 Activation RLS...');
    const { error: error2 } = await supabase.rpc('exec_sql', { sql: SQL_ENABLE_RLS });
    console.log('✅ RLS activé!\n');

    // Étape 3: Créer les policies
    console.log('📋 Création des policies...');
    const { error: error3 } = await supabase.rpc('exec_sql', { sql: SQL_POLICIES });
    console.log('✅ Policies créées!\n');

    console.log('========================');
    console.log('🎉 SETUP TERMINÉ!');
    console.log('========================');

  } catch (err) {
    console.error('❌ Erreur:', err.message);
    console.log('\n💡 Solution alternative:');
    console.log('Copiez le contenu de CREATE_TABLES_V2.sql');
    console.log('dans Supabase Dashboard → SQL Editor');
  }
}

setup();



