-- ============================================
-- NIUMBA - Importer Propriétés d'Exemple
-- ============================================
-- 
-- Ce script importe les propriétés d'exemple depuis
-- src/constants/data.ts dans Supabase pour les tests
-- ============================================

-- IMPORTANT : Vous devez d'abord créer les propriétaires (owners)
-- dans la table profiles avec les IDs suivants :
-- - owner-1 : Jean-Pierre Mwamba
-- - owner-2 : Marie Kasongo  
-- - owner-3 : Patrick Kabongo

-- ============================================
-- 1. CRÉER LES PROPRIÉTAIRES (PROFILES)
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
  language
)
VALUES (
  'owner-1',
  'contact@mwamba-immo.cd',
  'Jean-Pierre Mwamba',
  '+243 97 123 4567',
  'Mwamba Immobilier SARL',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  'owner',
  true,
  true,
  'fr'
)
ON CONFLICT (id) DO UPDATE
SET
  full_name = 'Jean-Pierre Mwamba',
  company_name = 'Mwamba Immobilier SARL',
  phone = '+243 97 123 4567',
  is_verified = true,
  is_active = true;

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
  language
)
VALUES (
  'owner-2',
  'marie@kasongo-properties.cd',
  'Marie Kasongo',
  '+243 81 234 5678',
  'Kasongo Properties',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  'owner',
  true,
  true,
  'fr'
)
ON CONFLICT (id) DO UPDATE
SET
  full_name = 'Marie Kasongo',
  company_name = 'Kasongo Properties',
  phone = '+243 81 234 5678',
  is_verified = true,
  is_active = true;

-- Propriétaire 3 : Patrick Kabongo
INSERT INTO profiles (
  id,
  email,
  full_name,
  phone,
  role,
  is_verified,
  is_active,
  language
)
VALUES (
  'owner-3',
  'patrick.kabongo@email.cd',
  'Patrick Kabongo',
  '+243 99 345 6789',
  'owner',
  false,
  true,
  'fr'
)
ON CONFLICT (id) DO UPDATE
SET
  full_name = 'Patrick Kabongo',
  phone = '+243 99 345 6789',
  is_verified = false,
  is_active = true;

-- ============================================
-- 2. IMPORTER LES PROPRIÉTÉS D'EXEMPLE
-- ============================================

-- Propriété 1 : Villa Moderne Golf
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
  is_available,
  views,
  created_at,
  updated_at
)
VALUES (
  'prop-1',
  'owner-1',
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
  true,
  234,
  '2024-01-15T10:00:00Z',
  '2024-01-20T14:30:00Z'
)
ON CONFLICT (id) DO UPDATE
SET
  title = 'Villa Moderne Golf',
  title_en = 'Modern Golf Villa',
  price = 350000,
  status = 'active',
  is_featured = true,
  is_available = true,
  updated_at = NOW();

-- Propriété 2 : Appartement Centre-Ville
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
  is_available,
  views,
  created_at,
  updated_at
)
VALUES (
  'prop-2',
  'owner-2',
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
  true,
  189,
  '2024-01-10T08:00:00Z',
  '2024-01-18T16:00:00Z'
)
ON CONFLICT (id) DO UPDATE
SET
  title = 'Appartement Centre-Ville',
  title_en = 'Downtown Apartment',
  price = 1500,
  status = 'active',
  is_featured = true,
  is_available = true,
  updated_at = NOW();

-- Propriété 3 : Maison Familiale Kolwezi
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
  is_available,
  views,
  created_at,
  updated_at
)
VALUES (
  'prop-3',
  'owner-3',
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
  true,
  156,
  '2024-01-05T12:00:00Z',
  '2024-01-12T09:00:00Z'
)
ON CONFLICT (id) DO UPDATE
SET
  title = 'Maison Familiale Kolwezi',
  title_en = 'Family House Kolwezi',
  price = 180000,
  status = 'active',
  is_featured = false,
  is_available = true,
  updated_at = NOW();

-- Propriété 4 : Entrepôt Zone Industrielle
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
  is_available,
  views,
  created_at,
  updated_at
)
VALUES (
  'prop-4',
  'owner-1',
  'Entrepôt Zone Industrielle',
  'Industrial Zone Warehouse',
  'warehouse',
  5000,
  'USD',
  'rent',
  'month',
  'Zone Industrielle Kipushi',
  'Kipushi',
  'Haut-Katanga',
  -11.7667,
  27.2333,
  0,
  2,
  1200,
  0,
  'Grand entrepôt dans la zone industrielle, idéal pour stockage ou activité commerciale. Accès facile pour camions.',
  'Large warehouse in the industrial zone, ideal for storage or commercial activity. Easy truck access.',
  ARRAY[
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800',
    'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800'
  ],
  ARRAY['Grande surface', 'Quai de chargement', 'Sécurité', 'Électricité triphasée'],
  ARRAY['Large Surface', 'Loading Dock', 'Security', 'Three-phase Power'],
  'active',
  false,
  true,
  87,
  '2024-01-08T14:00:00Z',
  '2024-01-15T11:00:00Z'
)
ON CONFLICT (id) DO UPDATE
SET
  title = 'Entrepôt Zone Industrielle',
  title_en = 'Industrial Zone Warehouse',
  price = 5000,
  status = 'active',
  is_featured = false,
  is_available = true,
  updated_at = NOW();

-- Propriété 5 : Terrain Commercial Likasi
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
  is_available,
  views,
  created_at,
  updated_at
)
VALUES (
  'prop-5',
  'owner-2',
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
  true,
  203,
  '2024-01-03T10:00:00Z',
  '2024-01-10T08:00:00Z'
)
ON CONFLICT (id) DO UPDATE
SET
  title = 'Terrain Commercial Likasi',
  title_en = 'Commercial Land Likasi',
  price = 75000,
  status = 'active',
  is_featured = true,
  is_available = true,
  updated_at = NOW();

-- Propriété 6 : Duplex Moderne Lubumbashi
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
  is_available,
  views,
  created_at,
  updated_at
)
VALUES (
  'prop-6',
  'owner-3',
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
  ARRAY['Terrace', 'Equipped Kitchen', 'Walk-in Closet', 'Generator'],
  'active',
  true,
  true,
  312,
  '2024-01-12T09:00:00Z',
  '2024-01-19T15:00:00Z'
)
ON CONFLICT (id) DO UPDATE
SET
  title = 'Duplex Moderne Lubumbashi',
  title_en = 'Modern Duplex Lubumbashi',
  price = 2800,
  status = 'active',
  is_featured = true,
  is_available = true,
  updated_at = NOW();

-- ============================================
-- 3. VÉRIFICATION
-- ============================================

-- Vérifier les propriétés importées
SELECT 
  id,
  title,
  city,
  province,
  type,
  price,
  price_type,
  status,
  is_featured,
  views
FROM properties
WHERE id IN ('prop-1', 'prop-2', 'prop-3', 'prop-4', 'prop-5', 'prop-6')
ORDER BY created_at DESC;

-- Compter les propriétés par ville
SELECT 
  city,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE is_featured = true) as featured
FROM properties
WHERE id IN ('prop-1', 'prop-2', 'prop-3', 'prop-4', 'prop-5', 'prop-6')
GROUP BY city;

-- ============================================
-- FIN
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Propriétés d''exemple importées avec succès !';
  RAISE NOTICE '✅ 6 propriétés ajoutées dans Supabase';
  RAISE NOTICE '✅ 3 propriétaires créés';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Vous pouvez maintenant tester l''application avec ces données !';
  RAISE NOTICE '';
END $$;


