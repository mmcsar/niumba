-- ============================================
-- Niumba - Ajout des Colonnes de Suspension
-- ============================================
-- Ajoute les colonnes pour suspendre les agents
-- ============================================

-- Ajouter les colonnes si elles n'existent pas
ALTER TABLE agents 
ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS suspended_reason TEXT;

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_agents_is_suspended ON agents(is_suspended);

-- ============================================
-- FIN DU SCRIPT
-- ============================================

