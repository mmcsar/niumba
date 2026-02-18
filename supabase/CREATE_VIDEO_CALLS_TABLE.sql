-- NIUMBA - Table pour les appels vidéo
-- Crée la table video_calls pour gérer les appels vidéo des rendez-vous

-- 1. Créer la table video_calls
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

-- 2. Créer les index
CREATE INDEX IF NOT EXISTS idx_video_calls_appointment ON video_calls(appointment_id);
CREATE INDEX IF NOT EXISTS idx_video_calls_meeting_id ON video_calls(meeting_id);
CREATE INDEX IF NOT EXISTS idx_video_calls_status ON video_calls(status);
CREATE INDEX IF NOT EXISTS idx_video_calls_created ON video_calls(created_at DESC);

-- 3. Activer RLS
ALTER TABLE video_calls ENABLE ROW LEVEL SECURITY;

-- 4. Policies RLS
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

-- 5. Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_video_calls_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger pour updated_at
DROP TRIGGER IF EXISTS trigger_update_video_calls_updated_at ON video_calls;
CREATE TRIGGER trigger_update_video_calls_updated_at
  BEFORE UPDATE ON video_calls
  FOR EACH ROW
  EXECUTE FUNCTION update_video_calls_updated_at();

-- 7. Commentaires
COMMENT ON TABLE video_calls IS 'Gère les appels vidéo pour les rendez-vous';
COMMENT ON COLUMN video_calls.appointment_id IS 'ID du rendez-vous associé';
COMMENT ON COLUMN video_calls.meeting_url IS 'URL de la réunion vidéo';
COMMENT ON COLUMN video_calls.meeting_id IS 'ID unique de la réunion';
COMMENT ON COLUMN video_calls.provider IS 'Fournisseur du service vidéo (zoom, google_meet, custom)';
COMMENT ON COLUMN video_calls.status IS 'Statut de l''appel (scheduled, active, completed, cancelled)';


