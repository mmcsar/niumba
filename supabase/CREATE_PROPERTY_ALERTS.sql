-- ============================================
-- NIUMBA - Table Property Alerts
-- ============================================
-- Table pour les alertes de recherche personnalisées

CREATE TABLE IF NOT EXISTS property_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  
  -- Critères de recherche
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
  
  -- Statistiques
  match_count INTEGER DEFAULT 0,
  last_notified TIMESTAMPTZ,
  last_checked TIMESTAMPTZ,
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_property_alerts_user ON property_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_property_alerts_enabled ON property_alerts(enabled) WHERE enabled = TRUE;
CREATE INDEX IF NOT EXISTS idx_property_alerts_city ON property_alerts(city);
CREATE INDEX IF NOT EXISTS idx_property_alerts_type ON property_alerts(property_type);

-- ============================================
-- Activer RLS
-- ============================================

ALTER TABLE property_alerts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Policies
-- ============================================

-- Les utilisateurs peuvent voir leurs propres alertes
DROP POLICY IF EXISTS "property_alerts_select_own" ON property_alerts;
CREATE POLICY "property_alerts_select_own" ON property_alerts
  FOR SELECT
  USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Les utilisateurs peuvent créer leurs propres alertes
DROP POLICY IF EXISTS "property_alerts_insert_own" ON property_alerts;
CREATE POLICY "property_alerts_insert_own" ON property_alerts
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Les utilisateurs peuvent mettre à jour leurs propres alertes
DROP POLICY IF EXISTS "property_alerts_update_own" ON property_alerts;
CREATE POLICY "property_alerts_update_own" ON property_alerts
  FOR UPDATE
  USING (auth.uid() IS NOT NULL AND user_id = auth.uid())
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Les utilisateurs peuvent supprimer leurs propres alertes
DROP POLICY IF EXISTS "property_alerts_delete_own" ON property_alerts;
CREATE POLICY "property_alerts_delete_own" ON property_alerts
  FOR DELETE
  USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- ============================================
-- Fonction pour vérifier les correspondances
-- ============================================

CREATE OR REPLACE FUNCTION check_property_alert_matches(alert_id UUID)
RETURNS INTEGER AS $$
DECLARE
  match_count INTEGER;
  alert_record RECORD;
BEGIN
  -- Récupérer l'alerte
  SELECT * INTO alert_record FROM property_alerts WHERE id = alert_id;
  
  IF NOT FOUND OR NOT alert_record.enabled THEN
    RETURN 0;
  END IF;
  
  -- Compter les propriétés correspondantes
  SELECT COUNT(*) INTO match_count
  FROM properties
  WHERE status = 'active'
    AND (alert_record.property_type IS NULL OR property_type = alert_record.property_type)
    AND (alert_record.transaction_type IS NULL OR transaction_type = alert_record.transaction_type)
    AND (alert_record.min_price IS NULL OR price >= alert_record.min_price)
    AND (alert_record.max_price IS NULL OR price <= alert_record.max_price)
    AND (alert_record.min_bedrooms IS NULL OR bedrooms >= alert_record.min_bedrooms)
    AND (alert_record.max_bedrooms IS NULL OR bedrooms <= alert_record.max_bedrooms)
    AND (alert_record.min_bathrooms IS NULL OR bathrooms >= alert_record.min_bathrooms)
    AND (alert_record.max_bathrooms IS NULL OR bathrooms <= alert_record.max_bathrooms)
    AND (alert_record.min_area IS NULL OR area >= alert_record.min_area)
    AND (alert_record.max_area IS NULL OR area <= alert_record.max_area)
    AND (alert_record.city IS NULL OR city = alert_record.city)
    AND (alert_record.neighborhood IS NULL OR neighborhood = alert_record.neighborhood)
    AND created_at > COALESCE(alert_record.last_notified, '1970-01-01'::TIMESTAMPTZ);
  
  -- Mettre à jour le compteur
  UPDATE property_alerts
  SET 
    match_count = match_count,
    last_checked = NOW(),
    updated_at = NOW()
  WHERE id = alert_id;
  
  RETURN match_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Vérification
-- ============================================

SELECT 
  'property_alerts' as table_name,
  COUNT(*) as row_count
FROM property_alerts;

