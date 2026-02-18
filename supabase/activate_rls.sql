-- ============================================
-- NIUMBA - Activation complète du RLS
-- Exécutez ce script dans Supabase SQL Editor
-- ============================================

-- ============================================
-- ÉTAPE 1 : Activer RLS sur toutes les tables
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
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ÉTAPE 2 : Supprimer les anciennes policies (si existantes)
-- ============================================

-- Profiles
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;

-- Properties
DROP POLICY IF EXISTS "properties_select_public" ON properties;
DROP POLICY IF EXISTS "properties_select" ON properties;
DROP POLICY IF EXISTS "properties_insert_own" ON properties;
DROP POLICY IF EXISTS "properties_insert" ON properties;
DROP POLICY IF EXISTS "properties_insert_authenticated" ON properties;
DROP POLICY IF EXISTS "properties_update_own" ON properties;
DROP POLICY IF EXISTS "properties_update" ON properties;
DROP POLICY IF EXISTS "properties_delete_own" ON properties;
DROP POLICY IF EXISTS "properties_delete" ON properties;
DROP POLICY IF EXISTS "properties_admin_all" ON properties;
DROP POLICY IF EXISTS "properties_admin_full" ON properties;

-- Saved Properties
DROP POLICY IF EXISTS "saved_properties_select_own" ON saved_properties;
DROP POLICY IF EXISTS "saved_select_own" ON saved_properties;
DROP POLICY IF EXISTS "saved_select" ON saved_properties;
DROP POLICY IF EXISTS "saved_select_authenticated" ON saved_properties;
DROP POLICY IF EXISTS "saved_properties_insert_own" ON saved_properties;
DROP POLICY IF EXISTS "saved_insert_own" ON saved_properties;
DROP POLICY IF EXISTS "saved_insert" ON saved_properties;
DROP POLICY IF EXISTS "saved_insert_authenticated" ON saved_properties;
DROP POLICY IF EXISTS "saved_properties_delete_own" ON saved_properties;
DROP POLICY IF EXISTS "saved_delete_own" ON saved_properties;
DROP POLICY IF EXISTS "saved_delete" ON saved_properties;
DROP POLICY IF EXISTS "saved_delete_authenticated" ON saved_properties;

-- Inquiries
DROP POLICY IF EXISTS "inquiries_select_involved" ON inquiries;
DROP POLICY IF EXISTS "inquiries_select" ON inquiries;
DROP POLICY IF EXISTS "inquiries_select_authenticated" ON inquiries;
DROP POLICY IF EXISTS "inquiries_insert_all" ON inquiries;
DROP POLICY IF EXISTS "inquiries_insert" ON inquiries;
DROP POLICY IF EXISTS "inquiries_insert_authenticated" ON inquiries;
DROP POLICY IF EXISTS "inquiries_update_owner" ON inquiries;
DROP POLICY IF EXISTS "inquiries_update" ON inquiries;
DROP POLICY IF EXISTS "inquiries_admin_select" ON inquiries;

-- Appointments
DROP POLICY IF EXISTS "appointments_select_involved" ON appointments;
DROP POLICY IF EXISTS "appointments_select" ON appointments;
DROP POLICY IF EXISTS "appointments_select_authenticated" ON appointments;
DROP POLICY IF EXISTS "appointments_insert_all" ON appointments;
DROP POLICY IF EXISTS "appointments_insert" ON appointments;
DROP POLICY IF EXISTS "appointments_insert_authenticated" ON appointments;
DROP POLICY IF EXISTS "appointments_update_involved" ON appointments;
DROP POLICY IF EXISTS "appointments_update" ON appointments;
DROP POLICY IF EXISTS "appointments_update_authenticated" ON appointments;
DROP POLICY IF EXISTS "appointments_delete_involved" ON appointments;
DROP POLICY IF EXISTS "appointments_delete_authenticated" ON appointments;
DROP POLICY IF EXISTS "appointments_admin_full" ON appointments;

-- Reviews
DROP POLICY IF EXISTS "reviews_select_all" ON reviews;
DROP POLICY IF EXISTS "reviews_select" ON reviews;
DROP POLICY IF EXISTS "reviews_select_public" ON reviews;
DROP POLICY IF EXISTS "reviews_insert_auth" ON reviews;
DROP POLICY IF EXISTS "reviews_insert" ON reviews;
DROP POLICY IF EXISTS "reviews_insert_authenticated" ON reviews;
DROP POLICY IF EXISTS "reviews_update_own" ON reviews;
DROP POLICY IF EXISTS "reviews_update" ON reviews;
DROP POLICY IF EXISTS "reviews_delete_own" ON reviews;

-- Conversations
DROP POLICY IF EXISTS "conversations_select" ON conversations;
DROP POLICY IF EXISTS "conversations_select_authenticated" ON conversations;
DROP POLICY IF EXISTS "conversations_insert" ON conversations;
DROP POLICY IF EXISTS "conversations_insert_authenticated" ON conversations;

-- Messages
DROP POLICY IF EXISTS "messages_select" ON messages;
DROP POLICY IF EXISTS "messages_select_authenticated" ON messages;
DROP POLICY IF EXISTS "messages_insert" ON messages;
DROP POLICY IF EXISTS "messages_insert_authenticated" ON messages;

-- Notifications
DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
DROP POLICY IF EXISTS "notifications_select" ON notifications;
DROP POLICY IF EXISTS "notifications_select_authenticated" ON notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
DROP POLICY IF EXISTS "notifications_update" ON notifications;
DROP POLICY IF EXISTS "notifications_update_authenticated" ON notifications;
DROP POLICY IF EXISTS "notifications_insert" ON notifications;
DROP POLICY IF EXISTS "notifications_insert_system" ON notifications;

-- Search Alerts
DROP POLICY IF EXISTS "alerts_select_own" ON search_alerts;
DROP POLICY IF EXISTS "alerts_select" ON search_alerts;
DROP POLICY IF EXISTS "alerts_select_authenticated" ON search_alerts;
DROP POLICY IF EXISTS "alerts_insert_own" ON search_alerts;
DROP POLICY IF EXISTS "alerts_insert" ON search_alerts;
DROP POLICY IF EXISTS "alerts_insert_authenticated" ON search_alerts;
DROP POLICY IF EXISTS "alerts_update_own" ON search_alerts;
DROP POLICY IF EXISTS "alerts_update" ON search_alerts;
DROP POLICY IF EXISTS "alerts_update_authenticated" ON search_alerts;
DROP POLICY IF EXISTS "alerts_delete_own" ON search_alerts;
DROP POLICY IF EXISTS "alerts_delete" ON search_alerts;
DROP POLICY IF EXISTS "alerts_delete_authenticated" ON search_alerts;

-- Property Views
DROP POLICY IF EXISTS "views_insert_all" ON property_views;
DROP POLICY IF EXISTS "views_insert" ON property_views;
DROP POLICY IF EXISTS "views_insert_public" ON property_views;
DROP POLICY IF EXISTS "views_select_owner" ON property_views;
DROP POLICY IF EXISTS "views_select_authorized" ON property_views;

-- Agents
DROP POLICY IF EXISTS "agents_select" ON agents;
DROP POLICY IF EXISTS "agents_select_public" ON agents;
DROP POLICY IF EXISTS "agents_insert_own" ON agents;
DROP POLICY IF EXISTS "agents_insert" ON agents;
DROP POLICY IF EXISTS "agents_insert_authenticated" ON agents;
DROP POLICY IF EXISTS "agents_update_own" ON agents;
DROP POLICY IF EXISTS "agents_update" ON agents;
DROP POLICY IF EXISTS "agents_update_authenticated" ON agents;
DROP POLICY IF EXISTS "agents_admin_full" ON agents;

-- Cities
DROP POLICY IF EXISTS "cities_select_all" ON cities;
DROP POLICY IF EXISTS "cities_select" ON cities;
DROP POLICY IF EXISTS "cities_select_public" ON cities;
DROP POLICY IF EXISTS "cities_admin_full" ON cities;

-- Price History
DROP POLICY IF EXISTS "price_history_select" ON price_history;
DROP POLICY IF EXISTS "price_history_select_public" ON price_history;

-- ============================================
-- ÉTAPE 3 : Créer les nouvelles policies (depuis rls_with_auth.sql)
-- ============================================
-- Note: Les policies détaillées sont dans rls_with_auth.sql
-- Exécutez rls_with_auth.sql après ce script pour créer toutes les policies

-- ============================================
-- VÉRIFICATION
-- ============================================

-- Vérifier que RLS est activé
SELECT 
  tablename,
  CASE 
    WHEN rowsecurity THEN '✅ RLS Activé'
    ELSE '❌ RLS Désactivé'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'properties', 'saved_properties', 'inquiries',
    'appointments', 'reviews', 'conversations', 'messages',
    'notifications', 'search_alerts', 'agents', 'cities',
    'price_history', 'property_views'
  )
ORDER BY tablename;

-- Compter les policies par table
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;



