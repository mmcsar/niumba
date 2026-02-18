-- ============================================
-- Migration 003: Policies pour PROPERTIES
-- ============================================

-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "properties_select_public" ON properties;
DROP POLICY IF EXISTS "properties_insert_owner" ON properties;
DROP POLICY IF EXISTS "properties_update_owner" ON properties;
DROP POLICY IF EXISTS "properties_delete_owner" ON properties;
DROP POLICY IF EXISTS "properties_select" ON properties;
DROP POLICY IF EXISTS "properties_insert" ON properties;
DROP POLICY IF EXISTS "properties_update" ON properties;
DROP POLICY IF EXISTS "properties_delete" ON properties;

-- Lecture publique (tout le monde peut voir les annonces)
CREATE POLICY "properties_select_public" ON properties
  FOR SELECT
  USING (true);

-- Création par le propriétaire uniquement
CREATE POLICY "properties_insert_owner" ON properties
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Modification par le propriétaire uniquement
CREATE POLICY "properties_update_owner" ON properties
  FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Suppression par le propriétaire uniquement
CREATE POLICY "properties_delete_owner" ON properties
  FOR DELETE
  USING (auth.uid() = owner_id);



