-- ============================================
-- Migration 011: Policies pour SEARCH_ALERTS
-- ============================================

-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "search_alerts_select_own" ON search_alerts;
DROP POLICY IF EXISTS "search_alerts_insert_own" ON search_alerts;
DROP POLICY IF EXISTS "search_alerts_update_own" ON search_alerts;
DROP POLICY IF EXISTS "search_alerts_delete_own" ON search_alerts;
DROP POLICY IF EXISTS "search_alerts_all" ON search_alerts;

-- Lecture de ses propres alertes
CREATE POLICY "search_alerts_select_own" ON search_alerts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Création de ses propres alertes
CREATE POLICY "search_alerts_insert_own" ON search_alerts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Modification de ses propres alertes
CREATE POLICY "search_alerts_update_own" ON search_alerts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Suppression de ses propres alertes
CREATE POLICY "search_alerts_delete_own" ON search_alerts
  FOR DELETE
  USING (auth.uid() = user_id);



