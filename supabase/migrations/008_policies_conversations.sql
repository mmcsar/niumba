-- ============================================
-- Migration 008: Policies pour CONVERSATIONS
-- ============================================

-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "conversations_select_participants" ON conversations;
DROP POLICY IF EXISTS "conversations_insert_participants" ON conversations;
DROP POLICY IF EXISTS "conversations_update_participants" ON conversations;
DROP POLICY IF EXISTS "conversations_select" ON conversations;
DROP POLICY IF EXISTS "conversations_insert" ON conversations;

-- Lecture par les participants uniquement
CREATE POLICY "conversations_select_participants" ON conversations
  FOR SELECT
  USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

-- Création par un des participants
CREATE POLICY "conversations_insert_participants" ON conversations
  FOR INSERT
  WITH CHECK (auth.uid() = participant1_id OR auth.uid() = participant2_id);

-- Modification (pour last_message_at, etc.)
CREATE POLICY "conversations_update_participants" ON conversations
  FOR UPDATE
  USING (auth.uid() = participant1_id OR auth.uid() = participant2_id)
  WITH CHECK (auth.uid() = participant1_id OR auth.uid() = participant2_id);



