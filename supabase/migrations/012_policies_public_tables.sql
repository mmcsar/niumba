-- ============================================
-- Migration 012: Policies pour tables publiques
-- (CITIES, AGENTS, PRICE_HISTORY, PROPERTY_VIEWS)
-- ============================================

-- ==================
-- CITIES (Villes)
-- ==================
DROP POLICY IF EXISTS "cities_select_public" ON cities;
DROP POLICY IF EXISTS "cities_select" ON cities;

-- Lecture publique
CREATE POLICY "cities_select_public" ON cities
  FOR SELECT
  USING (true);

-- ==================
-- AGENTS
-- ==================
DROP POLICY IF EXISTS "agents_select_public" ON agents;
DROP POLICY IF EXISTS "agents_select" ON agents;

-- Lecture publique
CREATE POLICY "agents_select_public" ON agents
  FOR SELECT
  USING (true);

-- ==================
-- PRICE_HISTORY (Historique des prix)
-- ==================
DROP POLICY IF EXISTS "price_history_select_public" ON price_history;
DROP POLICY IF EXISTS "price_history_insert_owner" ON price_history;
DROP POLICY IF EXISTS "price_history_select" ON price_history;

-- Lecture publique
CREATE POLICY "price_history_select_public" ON price_history
  FOR SELECT
  USING (true);

-- Insertion par le propriétaire de la propriété
CREATE POLICY "price_history_insert_owner" ON price_history
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = price_history.property_id
      AND p.owner_id = auth.uid()
    )
  );

-- ==================
-- PROPERTY_VIEWS (Vues de propriétés)
-- ==================
DROP POLICY IF EXISTS "property_views_insert_any" ON property_views;
DROP POLICY IF EXISTS "property_views_select_owner" ON property_views;
DROP POLICY IF EXISTS "property_views_insert" ON property_views;

-- Insertion par tout utilisateur authentifié
CREATE POLICY "property_views_insert_any" ON property_views
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Lecture par le propriétaire de la propriété
CREATE POLICY "property_views_select_owner" ON property_views
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = property_views.property_id
      AND p.owner_id = auth.uid()
    )
  );



