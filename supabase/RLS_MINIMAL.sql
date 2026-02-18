-- ============================================
-- NIUMBA - RLS MINIMAL
-- Version la plus simple possible
-- ============================================

-- Activer RLS seulement sur les tables principales
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS properties ENABLE ROW LEVEL SECURITY;

-- Policies minimales pour profiles
DROP POLICY IF EXISTS "profiles_select_public" ON profiles;
CREATE POLICY "profiles_select_public" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles 
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Policies minimales pour properties
DROP POLICY IF EXISTS "properties_select_public" ON properties;
CREATE POLICY "properties_select_public" ON properties 
  FOR SELECT USING (status = 'active' OR owner_id = auth.uid());

DROP POLICY IF EXISTS "properties_update_own" ON properties;
CREATE POLICY "properties_update_own" ON properties 
  FOR UPDATE USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- Vérification
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN '✅ RLS Activé' ELSE '❌ RLS Désactivé' END as rls
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'properties')
ORDER BY tablename;


