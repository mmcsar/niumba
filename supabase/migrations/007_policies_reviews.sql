-- ============================================
-- Migration 007: Policies pour REVIEWS (Avis)
-- ============================================

-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "reviews_select_public" ON reviews;
DROP POLICY IF EXISTS "reviews_insert_auth" ON reviews;
DROP POLICY IF EXISTS "reviews_update_author" ON reviews;
DROP POLICY IF EXISTS "reviews_delete_author" ON reviews;
DROP POLICY IF EXISTS "reviews_select" ON reviews;
DROP POLICY IF EXISTS "reviews_insert" ON reviews;
DROP POLICY IF EXISTS "reviews_update" ON reviews;
DROP POLICY IF EXISTS "reviews_delete" ON reviews;

-- Lecture publique (tout le monde peut voir les avis)
CREATE POLICY "reviews_select_public" ON reviews
  FOR SELECT
  USING (true);

-- Création par un utilisateur authentifié (auteur)
CREATE POLICY "reviews_insert_auth" ON reviews
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Modification par l'auteur uniquement
CREATE POLICY "reviews_update_author" ON reviews
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Suppression par l'auteur uniquement
CREATE POLICY "reviews_delete_author" ON reviews
  FOR DELETE
  USING (auth.uid() = user_id);



