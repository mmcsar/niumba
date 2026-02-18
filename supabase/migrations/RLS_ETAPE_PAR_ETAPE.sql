-- ============================================
-- NIUMBA - RLS ÉTAPE PAR ÉTAPE
-- Si erreur 42501, essayez table par table
-- ============================================

-- ==========================================
-- ÉTAPE 1: PROFILES (testez d'abord celle-ci)
-- ==========================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_public" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;

CREATE POLICY "profiles_select_public" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Vérifier
SELECT 'profiles' as table_name, rowsecurity as rls_enabled FROM pg_tables WHERE tablename = 'profiles';



