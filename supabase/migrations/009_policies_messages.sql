-- ============================================
-- Migration 009: Policies pour MESSAGES
-- ============================================

-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "messages_select_conversation" ON messages;
DROP POLICY IF EXISTS "messages_insert_sender" ON messages;
DROP POLICY IF EXISTS "messages_update_read" ON messages;
DROP POLICY IF EXISTS "messages_select" ON messages;
DROP POLICY IF EXISTS "messages_insert" ON messages;

-- Lecture si participant de la conversation
CREATE POLICY "messages_select_conversation" ON messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (auth.uid() = c.participant1_id OR auth.uid() = c.participant2_id)
    )
  );

-- Création par l'expéditeur uniquement
CREATE POLICY "messages_insert_sender" ON messages
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Modification (marquer comme lu) par le destinataire
CREATE POLICY "messages_update_read" ON messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (auth.uid() = c.participant1_id OR auth.uid() = c.participant2_id)
    )
  );



