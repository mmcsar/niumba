-- ============================================
-- NIUMBA - Table Price History
-- ============================================
-- Table pour l'historique des prix des propriétés

CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'XOF',
  event_type TEXT CHECK (event_type IN ('listed', 'price_change', 'price_reduced', 'sale', 'rented', 'other')),
  event_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_price_history_property ON price_history(property_id);
CREATE INDEX IF NOT EXISTS idx_price_history_created ON price_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_price_history_event ON price_history(event_type);

-- ============================================
-- Activer RLS
-- ============================================

ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Policies
-- ============================================

-- Tout le monde peut voir l'historique des prix (public)
DROP POLICY IF EXISTS "price_history_select_all" ON price_history;
CREATE POLICY "price_history_select_all" ON price_history
  FOR SELECT
  USING (true);

-- Seuls les admins et propriétaires peuvent ajouter des entrées
DROP POLICY IF EXISTS "price_history_insert_authorized" ON price_history;
CREATE POLICY "price_history_insert_authorized" ON price_history
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND (
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'editor')
      )
      OR EXISTS (
        SELECT 1 FROM properties 
        WHERE id = price_history.property_id 
        AND owner_id = auth.uid()
      )
    )
  );

-- Seuls les admins peuvent modifier
DROP POLICY IF EXISTS "price_history_update_admin" ON price_history;
CREATE POLICY "price_history_update_admin" ON price_history
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Seuls les admins peuvent supprimer
DROP POLICY IF EXISTS "price_history_delete_admin" ON price_history;
CREATE POLICY "price_history_delete_admin" ON price_history
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- ============================================
-- Fonction pour enregistrer automatiquement les changements de prix
-- ============================================

CREATE OR REPLACE FUNCTION record_price_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Si le prix a changé, enregistrer dans l'historique
  IF OLD.price IS DISTINCT FROM NEW.price THEN
    INSERT INTO price_history (
      property_id,
      price,
      currency,
      event_type,
      event_description,
      created_by
    ) VALUES (
      NEW.id,
      NEW.price,
      NEW.currency,
      CASE 
        WHEN NEW.price < OLD.price THEN 'price_reduced'
        WHEN NEW.price > OLD.price THEN 'price_change'
        ELSE 'price_change'
      END,
      CASE 
        WHEN NEW.price < OLD.price THEN 'Price reduced from ' || OLD.price || ' to ' || NEW.price
        WHEN NEW.price > OLD.price THEN 'Price increased from ' || OLD.price || ' to ' || NEW.price
        ELSE 'Price changed'
      END,
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour enregistrer automatiquement les changements
DROP TRIGGER IF EXISTS trigger_record_price_change ON properties;
CREATE TRIGGER trigger_record_price_change
  AFTER UPDATE OF price ON properties
  FOR EACH ROW
  WHEN (OLD.price IS DISTINCT FROM NEW.price)
  EXECUTE FUNCTION record_price_change();

-- ============================================
-- Fonction pour enregistrer le prix initial lors de la création
-- ============================================

CREATE OR REPLACE FUNCTION record_initial_price()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO price_history (
    property_id,
    price,
    currency,
    event_type,
    event_description,
    created_by
  ) VALUES (
    NEW.id,
    NEW.price,
    NEW.currency,
    'listed',
    'Property listed',
    NEW.owner_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour enregistrer le prix initial
DROP TRIGGER IF EXISTS trigger_record_initial_price ON properties;
CREATE TRIGGER trigger_record_initial_price
  AFTER INSERT ON properties
  FOR EACH ROW
  EXECUTE FUNCTION record_initial_price();

-- ============================================
-- Vérification
-- ============================================

SELECT 
  'price_history' as table_name,
  COUNT(*) as row_count
FROM price_history;

