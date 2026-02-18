-- ============================================
-- NIUMBA - INSERTION DES VILLES
-- Haut-Katanga et Lualaba
-- ============================================

-- Créer la table cities si elle n'existe pas (compatible avec structure existante)
-- Note: Si la table existe déjà, cette commande ne fera rien
CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  name_en TEXT,
  province TEXT NOT NULL CHECK (province IN ('Haut-Katanga', 'Lualaba')),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  properties_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Créer un index sur le nom de la ville pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_cities_name ON cities(name);
CREATE INDEX IF NOT EXISTS idx_cities_province ON cities(province);

-- Insérer les villes du Haut-Katanga
INSERT INTO cities (name, name_en, province, latitude, longitude) VALUES
  ('Lubumbashi', 'Lubumbashi', 'Haut-Katanga', -11.6876, 27.4847),
  ('Likasi', 'Likasi', 'Haut-Katanga', -10.9833, 26.7333),
  ('Kipushi', 'Kipushi', 'Haut-Katanga', -11.7667, 27.2500),
  ('Kasenga', 'Kasenga', 'Haut-Katanga', -10.3833, 28.6167),
  ('Kakanda', 'Kakanda', 'Haut-Katanga', -10.7167, 26.8000),
  ('Kambove', 'Kambove', 'Haut-Katanga', -10.8667, 26.6000),
  ('Kampemba', 'Kampemba', 'Haut-Katanga', NULL, NULL),
  ('Kisanga', 'Kisanga', 'Haut-Katanga', NULL, NULL),
  ('Kakontwe', 'Kakontwe', 'Haut-Katanga', NULL, NULL),
  ('Pweto', 'Pweto', 'Haut-Katanga', -8.4667, 28.9000),
  ('Mitwaba', 'Mitwaba', 'Haut-Katanga', NULL, NULL),
  ('Manono', 'Manono', 'Haut-Katanga', NULL, NULL),
  ('Kongolo', 'Kongolo', 'Haut-Katanga', NULL, NULL),
  ('Kabongo', 'Kabongo', 'Haut-Katanga', NULL, NULL),
  ('Kamina', 'Kamina', 'Haut-Katanga', NULL, NULL)
ON CONFLICT (name) DO NOTHING;

-- Insérer les villes du Lualaba
INSERT INTO cities (name, name_en, province, latitude, longitude) VALUES
  ('Kolwezi', 'Kolwezi', 'Lualaba', -10.7167, 25.4667),
  ('Fungurume', 'Fungurume', 'Lualaba', -10.3667, 25.3167),
  ('Kasumbalesa', 'Kasumbalesa', 'Lualaba', -12.1833, 27.8000),
  ('Mutshatsha', 'Mutshatsha', 'Lualaba', NULL, NULL),
  ('Lubudi', 'Lubudi', 'Lualaba', NULL, NULL)
ON CONFLICT (name) DO NOTHING;

-- Vérifier les villes insérées
SELECT 
  province,
  COUNT(*) as nombre_villes,
  STRING_AGG(name, ', ' ORDER BY name) as villes
FROM cities
GROUP BY province
ORDER BY province;

