-- ============================================
-- Migration 010: Policies pour NOTIFICATIONS
-- ============================================

-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
DROP POLICY IF EXISTS "notifications_insert_system" ON notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
DROP POLICY IF EXISTS "notifications_delete_own" ON notifications;
DROP POLICY IF EXISTS "notifications_select" ON notifications;
DROP POLICY IF EXISTS "notifications_update" ON notifications;

-- Lecture de ses propres notifications
CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Insertion (par le système ou l'utilisateur concerné)
CREATE POLICY "notifications_insert_system" ON notifications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);

-- Modification (marquer comme lu)
CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Suppression de ses propres notifications
CREATE POLICY "notifications_delete_own" ON notifications
  FOR DELETE
  USING (auth.uid() = user_id);



