-- ============================================
-- NIUMBA - Créer Propriétés d'Exemple avec UUIDs
-- ============================================
-- 
-- Ce script crée des propriétés d'exemple avec des UUIDs valides
-- Exécutez-le dans Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. CRÉER LES PROFILS PROPRIÉTAIRES
-- ============================================

-- Propriétaire 1 : Jean-Pierre Mwamba
INSERT INTO profiles (
  id,
  email,
  full_name,
  phone,
  company_name,
  avatar_url,
  role,
  is_verified,
  is_active,
  language,
  city,
  province
)
VALUES (
  gen_random_uuid(),
  'jeanpierre@niumba.com',
  'Jean-Pierre Mwamba',
  '+243971234567',
  'Mwamba Immobilier SARL',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  'owner',
  true,
  true,
  'fr',
  'Lubumbashi',
  'Haut-Katanga'
)
ON CONFLICT (email) DO UPDATE
SET
  full_name = 'Jean-Pierre Mwamba',
  company_name = 'Mwamba Immobilier SARL',
  phone = '+243971234567',
  is_verified = true,
  is_active = true
RETURNING id;

-- Propriétaire 2 : Marie Kasongo
INSERT INTO profiles (
  id,
  email,
  full_name,
  phone,
  company_name,
  avatar_url,
  role,
  is_verified,
  is_active,
  language,
  city,
  province
)
VALUES (
  gen_random_uuid(),
  'marie@niumba.com',
  'Marie Kasongo',
  '+243812345678',
  'Kasongo Properties',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  'owner',
  true,
  true,
  'fr',
  'Lubumbashi',
  'Haut-Katanga'
)
ON CONFLICT (email) DO UPDATE
SET
  full_name = 'Marie Kasongo',
  company_name = 'Kasongo Properties',
  phone = '+243812345678',
  is_verified = true,
  is_active = true
RETURNING id;

-- Propriétaire 3 : Patrick Kabongo
INSERT INTO profiles (
  id,
  email,
  full_name,
  phone,
  role,
  is_verified,
  is_active,
  language,
  city,
  province
)
VALUES (
  gen_random_uuid(),
  'patrick@niumba.com',
  'Patrick Kabongo',
  '+243993456789',
  'owner',
  false,
  true,
  'fr',
  'Kolwezi',
  'Lualaba'
)
ON CONFLICT (email) DO UPDATE
SET
  full_name = 'Patrick Kabongo',
  phone = '+243993456789',
  is_verified = false,
  is_active = true
RETURNING id;

-- ============================================
-- 2. CRÉER LES PROPRIÉTÉS D'EXEMPLE
-- ============================================

-- Propriété 1 : Villa Moderne Golf (FEATURED)
INSERT INTO properties (
  id,
  owner_id,
  title,
  title_en,
  type,
  price,
  currency,
  price_type,
  address,
  city,
  province,
  latitude,
  longitude,
  bedrooms,
  bathrooms,
  area,
  garage,
  description,
  description_en,
  images,
  features,
  features_en,
  status,
  is_featured,
  is_available
)
SELECT
  gen_random_uuid(),
  (SELECT id FROM profiles WHERE email = 'jeanpierre@niumba.com' LIMIT 1),
  'Villa Moderne Golf',
  'Modern Golf Villa',
  'house',
  350000,
  'USD',
  'sale',
  'Avenue du Golf, Quartier Golf',
  'Lubumbashi',
  'Haut-Katanga',
  -11.6876,
  27.4847,
  5,
  4,
  450,
  2,
  'Magnifique villa moderne située dans le prestigieux quartier Golf de Lubumbashi. Cette propriété exceptionnelle offre un cadre de vie luxueux avec des finitions haut de gamme.',
  'Beautiful modern villa located in the prestigious Golf neighborhood of Lubumbashi. This exceptional property offers a luxurious living environment with high-end finishes.',
  ARRAY[
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800'
  ],
  ARRAY['Piscine', 'Jardin', 'Sécurité 24h', 'Groupe électrogène', 'Forage'],
  ARRAY['Swimming Pool', 'Garden', '24h Security', 'Generator', 'Borehole'],
  'active',
  true,
  true
WHERE EXISTS (SELECT 1 FROM profiles WHERE email = 'jeanpierre@niumba.com')
ON CONFLICT DO NOTHING;

-- Propriété 2 : Appartement Centre-Ville (FEATURED)
INSERT INTO properties (
  id,
  owner_id,
  title,
  title_en,
  type,
  price,
  currency,
  price_type,
  rent_period,
  address,
  city,
  province,
  latitude,
  longitude,
  bedrooms,
  bathrooms,
  area,
  garage,
  description,
  description_en,
  images,
  features,
  features_en,
  status,
  is_featured,
  is_available
)
SELECT
  gen_random_uuid(),
  (SELECT id FROM profiles WHERE email = 'marie@niumba.com' LIMIT 1),
  'Appartement Centre-Ville',
  'Downtown Apartment',
  'apartment',
  1500,
  'USD',
  'rent',
  'month',
  'Avenue Kasavubu, Centre-Ville',
  'Lubumbashi',
  'Haut-Katanga',
  -11.6642,
  27.4794,
  3,
  2,
  120,
  1,
  'Superbe appartement au cœur de Lubumbashi, idéal pour les professionnels. Proximité des commerces et bureaux.',
  'Superb apartment in the heart of Lubumbashi, ideal for professionals. Close to shops and offices.',
  ARRAY[
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
  ],
  ARRAY['Climatisation', 'Ascenseur', 'Parking', 'Internet fibre'],
  ARRAY['Air Conditioning', 'Elevator', 'Parking', 'Fiber Internet'],
  'active',
  true,
  true
WHERE EXISTS (SELECT 1 FROM profiles WHERE email = 'marie@niumba.com')
ON CONFLICT DO NOTHING;

-- Propriété 3 : Maison Familiale Kolwezi (NOT FEATURED)
INSERT INTO properties (
  id,
  owner_id,
  title,
  title_en,
  type,
  price,
  currency,
  price_type,
  address,
  city,
  province,
  latitude,
  longitude,
  bedrooms,
  bathrooms,
  area,
  garage,
  description,
  description_en,
  images,
  features,
  features_en,
  status,
  is_featured,
  is_available
)
SELECT
  gen_random_uuid(),
  (SELECT id FROM profiles WHERE email = 'patrick@niumba.com' LIMIT 1),
  'Maison Familiale Kolwezi',
  'Family House Kolwezi',
  'house',
  180000,
  'USD',
  'sale',
  'Quartier Mutoshi',
  'Kolwezi',
  'Lualaba',
  -10.7167,
  25.4667,
  4,
  3,
  280,
  1,
  'Belle maison familiale dans un quartier calme de Kolwezi. Parfait pour une famille avec enfants.',
  'Beautiful family house in a quiet neighborhood of Kolwezi. Perfect for a family with children.',
  ARRAY[
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800',
    'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'
  ],
  ARRAY['Jardin', 'Citerne', 'Panneau solaire', 'Clôture sécurisée'],
  ARRAY['Garden', 'Water Tank', 'Solar Panel', 'Secured Fence'],
  'active',
  false,
  true
WHERE EXISTS (SELECT 1 FROM profiles WHERE email = 'patrick@niumba.com')
ON CONFLICT DO NOTHING;

-- Propriété 4 : Terrain Commercial Likasi (FEATURED)
INSERT INTO properties (
  id,
  owner_id,
  title,
  title_en,
  type,
  price,
  currency,
  price_type,
  address,
  city,
  province,
  latitude,
  longitude,
  bedrooms,
  bathrooms,
  area,
  garage,
  description,
  description_en,
  images,
  features,
  features_en,
  status,
  is_featured,
  is_available
)
SELECT
  gen_random_uuid(),
  (SELECT id FROM profiles WHERE email = 'marie@niumba.com' LIMIT 1),
  'Terrain Commercial Likasi',
  'Commercial Land Likasi',
  'land',
  75000,
  'USD',
  'sale',
  'Avenue Principale, Centre Likasi',
  'Likasi',
  'Haut-Katanga',
  -10.9833,
  26.7333,
  0,
  0,
  2000,
  0,
  'Terrain commercial stratégiquement situé au centre de Likasi. Idéal pour construction de centre commercial ou immeuble de bureaux.',
  'Strategically located commercial land in the center of Likasi. Ideal for shopping center or office building construction.',
  ARRAY[
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'
  ],
  ARRAY['Titre foncier', 'Zone commerciale', 'Accès route principale'],
  ARRAY['Land Title', 'Commercial Zone', 'Main Road Access'],
  'active',
  true,
  true
WHERE EXISTS (SELECT 1 FROM profiles WHERE email = 'marie@niumba.com')
ON CONFLICT DO NOTHING;

-- Propriété 5 : Duplex Moderne Lubumbashi (FEATURED)
INSERT INTO properties (
  id,
  owner_id,
  title,
  title_en,
  type,
  price,
  currency,
  price_type,
  rent_period,
  address,
  city,
  province,
  latitude,
  longitude,
  bedrooms,
  bathrooms,
  area,
  garage,
  description,
  description_en,
  images,
  features,
  features_en,
  status,
  is_featured,
  is_available
)
SELECT
  gen_random_uuid(),
  (SELECT id FROM profiles WHERE email = 'jeanpierre@niumba.com' LIMIT 1),
  'Duplex Moderne Lubumbashi',
  'Modern Duplex Lubumbashi',
  'townhouse',
  2800,
  'USD',
  'rent',
  'month',
  'Quartier Bel-Air',
  'Lubumbashi',
  'Haut-Katanga',
  -11.6500,
  27.4800,
  4,
  3,
  200,
  2,
  'Magnifique duplex dans le quartier résidentiel Bel-Air. Construction récente avec matériaux de qualité.',
  'Magnificent duplex in the residential Bel-Air neighborhood. Recent construction with quality materials.',
  ARRAY[
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
    'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800'
  ],
  ARRAY['Terrasse', 'Cuisine équipée', 'Dressing', 'Groupe électrogène'],
  ARRAY['Terrasse', 'Equipped Kitchen', 'Walk-in Closet', 'Generator'],
  'active',
  true,
  true
WHERE EXISTS (SELECT 1 FROM profiles WHERE email = 'jeanpierre@niumba.com');

-- ============================================
-- 3. VÉRIFICATION
-- ============================================

-- Vérifier les propriétés créées
SELECT 
  id,
  title,
  status,
  is_featured,
  is_available,
  city,
  price,
  currency
FROM properties
ORDER BY created_at DESC
LIMIT 10;

-- Vérifier les propriétés featured
SELECT 
  COUNT(*) as total_featured
FROM properties
WHERE status = 'active' 
  AND is_featured = true;

-- ============================================
-- FIN
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Propriétés d''exemple créées avec succès !';
  RAISE NOTICE '✅ Vérifiez les résultats avec les requêtes ci-dessus.';
END $$;

