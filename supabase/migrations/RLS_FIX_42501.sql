-- ============================================
-- NIUMBA - RLS FIX (Erreur 42501)
-- Version corrigée pour permissions
-- ============================================

-- D'abord, désactiver temporairement RLS pour pouvoir modifier
-- (exécutez en tant que postgres/service_role)

-- ============================================
-- OPTION 1: Si vous êtes OWNER des tables
-- ============================================

-- Forcer les permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- ============================================
-- ACTIVER RLS (avec FORCE pour bypass)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles FORCE ROW LEVEL SECURITY;

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties FORCE ROW LEVEL SECURITY;

ALTER TABLE saved_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_properties FORCE ROW LEVEL SECURITY;

ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries FORCE ROW LEVEL SECURITY;

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments FORCE ROW LEVEL SECURITY;

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews FORCE ROW LEVEL SECURITY;

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations FORCE ROW LEVEL SECURITY;

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages FORCE ROW LEVEL SECURITY;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications FORCE ROW LEVEL SECURITY;

ALTER TABLE search_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_alerts FORCE ROW LEVEL SECURITY;

-- Tables optionnelles (peuvent ne pas exister)
DO $$ 
BEGIN
  EXECUTE 'ALTER TABLE agents ENABLE ROW LEVEL SECURITY';
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ 
BEGIN
  EXECUTE 'ALTER TABLE cities ENABLE ROW LEVEL SECURITY';
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ 
BEGIN
  EXECUTE 'ALTER TABLE price_history ENABLE ROW LEVEL SECURITY';
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ 
BEGIN
  EXECUTE 'ALTER TABLE property_views ENABLE ROW LEVEL SECURITY';
EXCEPTION WHEN undefined_table THEN NULL;
END $$;



