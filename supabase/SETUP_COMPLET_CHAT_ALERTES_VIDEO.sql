-- ============================================
-- NIUMBA - Setup Complet Supabase
-- Chat, Alertes, Appels Vidéo
-- ============================================
-- Ce script crée toutes les tables nécessaires pour :
-- 1. Chat/Messagerie (conversations, messages)
-- 2. Alertes de recherche (property_alerts)
-- 3. Appels vidéo (video_calls)
-- ============================================

-- ============================================
-- 1. TABLES CHAT/MESSAGERIE
-- ============================================

-- Table CONVERSATIONS
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  participant_2 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_participants UNIQUE(participant_1, participant_2, property_id)
);

-- Index pour conversations
CREATE INDEX IF NOT EXISTS idx_conversations_participant_1 ON conversations(participant_1);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_2 ON conversations(participant_2);
CREATE INDEX IF NOT EXISTS idx_conversations_property ON conversations(property_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);

-- Table MESSAGES
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  attachment_type TEXT CHECK (attachment_type IN ('text', 'image', 'file', 'location')),
  attachment_url TEXT,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- Index pour messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);

-- ============================================
-- 2. TABLE ALERTES DE RECHERCHE
-- ============================================

CREATE TABLE IF NOT EXISTS property_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  property_type TEXT CHECK (property_type IN ('house', 'apartment', 'land', 'commercial', 'other')),
  transaction_type TEXT CHECK (transaction_type IN ('sale', 'rent')),
  min_price NUMERIC,
  max_price NUMERIC,
  min_bedrooms INTEGER,
  max_bedrooms INTEGER,
  min_bathrooms INTEGER,
  max_bathrooms INTEGER,
  min_area NUMERIC,
  max_area NUMERIC,
  city TEXT,
  neighborhood TEXT,
  match_count INTEGER DEFAULT 0,
  last_notified TIMESTAMPTZ,
  last_checked TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour property_alerts
CREATE INDEX IF NOT EXISTS idx_property_alerts_user ON property_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_property_alerts_enabled ON property_alerts(enabled);
CREATE INDEX IF NOT EXISTS idx_property_alerts_city ON property_alerts(city);
CREATE INDEX IF NOT EXISTS idx_property_alerts_type ON property_alerts(property_type);

-- ============================================
-- 3. TABLE APPELS VIDÉO
-- ============================================

CREATE TABLE IF NOT EXISTS video_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  meeting_url TEXT NOT NULL,
  meeting_id TEXT NOT NULL UNIQUE,
  meeting_password TEXT,
  provider TEXT NOT NULL DEFAULT 'custom' CHECK (provider IN ('zoom', 'google_meet', 'custom')),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour video_calls
CREATE INDEX IF NOT EXISTS idx_video_calls_appointment ON video_calls(appointment_id);
CREATE INDEX IF NOT EXISTS idx_video_calls_meeting_id ON video_calls(meeting_id);
CREATE INDEX IF NOT EXISTS idx_video_calls_status ON video_calls(status);
CREATE INDEX IF NOT EXISTS idx_video_calls_created ON video_calls(created_at DESC);

-- ============================================
-- 4. ACTIVATION RLS (Row Level Security)
-- ============================================

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_calls ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. POLICIES RLS - CONVERSATIONS
-- ============================================

-- Les utilisateurs peuvent voir leurs conversations
DROP POLICY IF EXISTS "conversations_select_own" ON conversations;
CREATE POLICY "conversations_select_own" ON conversations
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL 
    AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
  );

-- Les utilisateurs peuvent créer des conversations
DROP POLICY IF EXISTS "conversations_insert_own" ON conversations;
CREATE POLICY "conversations_insert_own" ON conversations
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
  );

-- Les utilisateurs peuvent mettre à jour leurs conversations
DROP POLICY IF EXISTS "conversations_update_own" ON conversations;
CREATE POLICY "conversations_update_own" ON conversations
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL 
    AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
  )
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
  );

-- ============================================
-- 6. POLICIES RLS - MESSAGES
-- ============================================

-- Les utilisateurs peuvent voir les messages de leurs conversations
DROP POLICY IF EXISTS "messages_select_own" ON messages;
CREATE POLICY "messages_select_own" ON messages
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM conversations c 
      WHERE c.id = messages.conversation_id 
      AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  );

-- Les utilisateurs peuvent envoyer des messages
DROP POLICY IF EXISTS "messages_insert_own" ON messages;
CREATE POLICY "messages_insert_own" ON messages
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversations c 
      WHERE c.id = messages.conversation_id 
      AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  );

-- Les utilisateurs peuvent mettre à jour leurs messages
DROP POLICY IF EXISTS "messages_update_own" ON messages;
CREATE POLICY "messages_update_own" ON messages
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM conversations c 
      WHERE c.id = messages.conversation_id 
      AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  )
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM conversations c 
      WHERE c.id = messages.conversation_id 
      AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  );

-- Les utilisateurs peuvent supprimer leurs messages
DROP POLICY IF EXISTS "messages_delete_own" ON messages;
CREATE POLICY "messages_delete_own" ON messages
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL 
    AND sender_id = auth.uid()
  );

-- ============================================
-- 7. POLICIES RLS - PROPERTY_ALERTS
-- ============================================

-- Les utilisateurs peuvent voir leurs alertes
DROP POLICY IF EXISTS "property_alerts_select_own" ON property_alerts;
CREATE POLICY "property_alerts_select_own" ON property_alerts
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
  );

-- Les utilisateurs peuvent créer des alertes
DROP POLICY IF EXISTS "property_alerts_insert_own" ON property_alerts;
CREATE POLICY "property_alerts_insert_own" ON property_alerts
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
  );

-- Les utilisateurs peuvent mettre à jour leurs alertes
DROP POLICY IF EXISTS "property_alerts_update_own" ON property_alerts;
CREATE POLICY "property_alerts_update_own" ON property_alerts
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
  )
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
  );

-- Les utilisateurs peuvent supprimer leurs alertes
DROP POLICY IF EXISTS "property_alerts_delete_own" ON property_alerts;
CREATE POLICY "property_alerts_delete_own" ON property_alerts
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
  );

-- ============================================
-- 8. POLICIES RLS - VIDEO_CALLS
-- ============================================

-- Les utilisateurs peuvent voir les appels vidéo de leurs rendez-vous
DROP POLICY IF EXISTS "video_calls_select_own" ON video_calls;
CREATE POLICY "video_calls_select_own" ON video_calls
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.id = video_calls.appointment_id
      AND (a.client_id = auth.uid() OR a.agent_id = auth.uid())
    )
  );

-- Les utilisateurs peuvent créer des appels vidéo pour leurs rendez-vous
DROP POLICY IF EXISTS "video_calls_insert_own" ON video_calls;
CREATE POLICY "video_calls_insert_own" ON video_calls
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.id = video_calls.appointment_id
      AND (a.client_id = auth.uid() OR a.agent_id = auth.uid())
    )
  );

-- Les utilisateurs peuvent mettre à jour les appels vidéo de leurs rendez-vous
DROP POLICY IF EXISTS "video_calls_update_own" ON video_calls;
CREATE POLICY "video_calls_update_own" ON video_calls
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.id = video_calls.appointment_id
      AND (a.client_id = auth.uid() OR a.agent_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.id = video_calls.appointment_id
      AND (a.client_id = auth.uid() OR a.agent_id = auth.uid())
    )
  );

-- ============================================
-- 9. TRIGGERS ET FONCTIONS
-- ============================================

-- Fonction pour mettre à jour last_message_at automatiquement
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET 
    last_message_at = NEW.created_at,
    last_message_preview = LEFT(NEW.content, 100),
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour messages
DROP TRIGGER IF EXISTS trigger_update_conversation_last_message ON messages;
CREATE TRIGGER trigger_update_conversation_last_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- Fonction pour mettre à jour updated_at automatiquement (property_alerts)
CREATE OR REPLACE FUNCTION update_property_alerts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour property_alerts
DROP TRIGGER IF EXISTS trigger_update_property_alerts_updated_at ON property_alerts;
CREATE TRIGGER trigger_update_property_alerts_updated_at
  BEFORE UPDATE ON property_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_property_alerts_updated_at();

-- Fonction pour mettre à jour updated_at automatiquement (video_calls)
CREATE OR REPLACE FUNCTION update_video_calls_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour video_calls
DROP TRIGGER IF EXISTS trigger_update_video_calls_updated_at ON video_calls;
CREATE TRIGGER trigger_update_video_calls_updated_at
  BEFORE UPDATE ON video_calls
  FOR EACH ROW
  EXECUTE FUNCTION update_video_calls_updated_at();

-- ============================================
-- 10. COMMENTAIRES
-- ============================================

COMMENT ON TABLE conversations IS 'Conversations entre utilisateurs pour le chat';
COMMENT ON TABLE messages IS 'Messages dans les conversations';
COMMENT ON TABLE property_alerts IS 'Alertes de recherche personnalisées pour les utilisateurs';
COMMENT ON TABLE video_calls IS 'Appels vidéo pour les rendez-vous';

-- ============================================
-- FIN DU SCRIPT
-- ============================================
-- Ce script crée toutes les tables nécessaires pour :
-- ✅ Chat/Messagerie (conversations, messages)
-- ✅ Alertes de recherche (property_alerts)
-- ✅ Appels vidéo (video_calls)
-- 
-- Toutes les tables ont :
-- ✅ RLS activé
-- ✅ Policies de sécurité configurées
-- ✅ Index pour les performances
-- ✅ Triggers pour la mise à jour automatique
-- ============================================


