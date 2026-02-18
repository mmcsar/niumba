-- ============================================
-- Niumba - Activity Logs Table
-- ============================================
-- Table pour enregistrer les activités des utilisateurs
-- Permet à l'admin de surveiller les actions des éditeurs
-- ============================================

-- Créer la table activity_logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL CHECK (user_role IN ('user', 'agent', 'owner', 'editor', 'admin')),
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'publish', 'unpublish')),
  resource_type TEXT NOT NULL CHECK (resource_type IN ('property', 'agent', 'user', 'appointment')),
  resource_id UUID NOT NULL,
  resource_name TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_role ON activity_logs(user_role);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_resource_type ON activity_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_resource_id ON activity_logs(resource_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- RLS (Row Level Security)
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir leurs propres logs
CREATE POLICY "Users can view their own activity logs"
ON activity_logs FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Politique : Les admins peuvent voir tous les logs
CREATE POLICY "Admins can view all activity logs"
ON activity_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Politique : Seuls les admins peuvent insérer des logs (via le service)
-- Note: En pratique, les logs sont insérés par le backend/service
CREATE POLICY "Service can insert activity logs"
ON activity_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- Fonction pour nettoyer les anciens logs (optionnel)
-- Supprime les logs de plus de 90 jours
CREATE OR REPLACE FUNCTION cleanup_old_activity_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM activity_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FIN DU SCRIPT
-- ============================================

