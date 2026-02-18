-- ============================================
-- Migration 004: Policies pour SAVED_PROPERTIES (Favoris)
-- ============================================

-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "saved_properties_select_own" ON saved_properties;
DROP POLICY IF EXISTS "saved_properties_insert_own" ON saved_properties;
DROP POLICY IF EXISTS "saved_properties_delete_own" ON saved_properties;
DROP POLICY IF EXISTS "saved_properties_select" ON saved_properties;
DROP POLICY IF EXISTS "saved_properties_insert" ON saved_properties;
DROP POLICY IF EXISTS "saved_properties_delete" ON saved_properties;

-- Voir uniquement ses propres favoris
CREATE POLICY "saved_properties_select_own" ON saved_properties
  FOR SELECT
  USING (auth.uid() = user_id);

-- Ajouter uniquement à ses propres favoris
CREATE POLICY "saved_properties_insert_own" ON saved_properties
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Supprimer uniquement ses propres favoris
CREATE POLICY "saved_properties_delete_own" ON saved_properties
  FOR DELETE
  USING (auth.uid() = user_id);



