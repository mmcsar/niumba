-- ============================================
-- Migration 002: Policies pour PROFILES
-- ============================================

-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "profiles_select_public" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;

-- Lecture publique (pour voir les noms/avatars des autres utilisateurs)
CREATE POLICY "profiles_select_public" ON profiles
  FOR SELECT
  USING (true);

-- Insertion uniquement pour son propre profil
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Modification uniquement de son propre profil
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);



