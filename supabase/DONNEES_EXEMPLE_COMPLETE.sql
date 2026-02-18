-- ============================================
-- NIUMBA - Données d'Exemple Complètes
-- ============================================
-- 
-- Ce script crée toutes les données d'exemple nécessaires
-- pour tester l'application et le dashboard
-- ============================================

-- ============================================
-- 1. CRÉER LES UTILISATEURS/PROPRIÉTAIRES
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
  'owner-1',
  'contact@mwamba-immo.cd',
  'Jean-Pierre Mwamba',
  '+243 97 123 4567',
  'Mwamba Immobilier SARL',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  'owner',
  true,
  true,
  'fr',
  'Lubumbashi',
  'Haut-Katanga'
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
  language,
  city,
  province
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
  'fr',
  'Lubumbashi',
  'Haut-Katanga'
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
  language,
  city,
  province
)
VALUES (
  'owner-3',
  'patrick.kabongo@email.cd',
  'Patrick Kabongo',
  '+243 99 345 6789',
  'owner',
  false,
  true,
  'fr',
  'Kolwezi',
  'Lualaba'
)
ON CONFLICT (id) DO UPDATE
SET
  full_name = 'Patrick Kabongo',
  phone = '+243 99 345 6789',
  is_verified = false,
  is_active = true;

-- Utilisateur 1 : Client Test
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
  'user-1',
  'client1@test.cd',
  'Paul Mwamba',
  '+243 90 111 2222',
  'user',
  true,
  true,
  'fr',
  'Lubumbashi',
  'Haut-Katanga'
)
ON CONFLICT (id) DO UPDATE
SET
  full_name = 'Paul Mwamba',
  phone = '+243 90 111 2222',
  is_verified = true,
  is_active = true;

-- Utilisateur 2 : Client Test
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
  'user-2',
  'client2@test.cd',
  'Sophie Tshisekedi',
  '+243 91 222 3333',
  'user',
  true,
  true,
  'fr',
  'Kolwezi',
  'Lualaba'
)
ON CONFLICT (id) DO UPDATE
SET
  full_name = 'Sophie Tshisekedi',
  phone = '+243 91 222 3333',
  is_verified = true,
  is_active = true;

-- ============================================
-- 2. CRÉER LES AGENTS
-- ============================================

-- Agent 1
INSERT INTO agents (
  id,
  user_id,
  license_number,
  bio,
  bio_en,
  specializations,
  service_areas,
  is_verified,
  is_active
)
VALUES (
  'agent-1',
  'owner-1',
  'AG-2024-001',
  'Agent immobilier expérimenté avec plus de 10 ans d''expérience dans le marché de Lubumbashi.',
  'Experienced real estate agent with over 10 years of experience in the Lubumbashi market.',
  ARRAY['Vente', 'Location', 'Commercial'],
  ARRAY['Lubumbashi', 'Likasi', 'Kipushi'],
  true,
  true
)
ON CONFLICT (id) DO UPDATE
SET
  license_number = 'AG-2024-001',
  is_verified = true,
  is_active = true;

-- Agent 2
INSERT INTO agents (
  id,
  user_id,
  license_number,
  bio,
  bio_en,
  specializations,
  service_areas,
  is_verified,
  is_active
)
VALUES (
  'agent-2',
  'owner-2',
  'AG-2024-002',
  'Spécialiste en propriétés résidentielles et commerciales.',
  'Specialist in residential and commercial properties.',
  ARRAY['Résidentiel', 'Commercial'],
  ARRAY['Lubumbashi', 'Kolwezi'],
  true,
  true
)
ON CONFLICT (id) DO UPDATE
SET
  license_number = 'AG-2024-002',
  is_verified = true,
  is_active = true;

-- ============================================
-- 3. IMPORTER LES PROPRIÉTÉS D'EXEMPLE
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
  saves,
  inquiries_count,
  created_at,
  updated_at,
  published_at
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
  12,
  8,
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '10 days'
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
  saves,
  inquiries_count,
  created_at,
  updated_at,
  published_at
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
  8,
  5,
  NOW() - INTERVAL '15 days',
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '15 days'
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
  saves,
  inquiries_count,
  created_at,
  updated_at,
  published_at
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
  5,
  3,
  NOW() - INTERVAL '20 days',
  NOW() - INTERVAL '13 days',
  NOW() - INTERVAL '20 days'
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
  saves,
  inquiries_count,
  created_at,
  updated_at,
  published_at
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
  3,
  2,
  NOW() - INTERVAL '17 days',
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '17 days'
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
  saves,
  inquiries_count,
  created_at,
  updated_at,
  published_at
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
  7,
  4,
  NOW() - INTERVAL '22 days',
  NOW() - INTERVAL '15 days',
  NOW() - INTERVAL '22 days'
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
  saves,
  inquiries_count,
  created_at,
  updated_at,
  published_at
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
  15,
  9,
  NOW() - INTERVAL '13 days',
  NOW() - INTERVAL '6 days',
  NOW() - INTERVAL '13 days'
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
-- 4. CRÉER DES DEMANDES (INQUIRIES)
-- ============================================

-- Demande 1
INSERT INTO inquiries (
  id,
  property_id,
  sender_id,
  owner_id,
  sender_name,
  sender_email,
  sender_phone,
  subject,
  message,
  status,
  created_at
)
VALUES (
  'inquiry-1',
  'prop-1',
  'user-1',
  'owner-1',
  'Paul Mwamba',
  'client1@test.cd',
  '+243 90 111 2222',
  'Intérêt pour la Villa Moderne Golf',
  'Bonjour, je suis intéressé par cette propriété. Pourriez-vous me donner plus d''informations sur les modalités de paiement ?',
  'new',
  NOW() - INTERVAL '2 days'
)
ON CONFLICT (id) DO NOTHING;

-- Demande 2
INSERT INTO inquiries (
  id,
  property_id,
  sender_id,
  owner_id,
  sender_name,
  sender_email,
  sender_phone,
  subject,
  message,
  status,
  created_at
)
VALUES (
  'inquiry-2',
  'prop-2',
  'user-2',
  'owner-2',
  'Sophie Tshisekedi',
  'client2@test.cd',
  '+243 91 222 3333',
  'Question sur l''appartement',
  'Bonjour, est-ce que l''appartement est disponible pour une visite cette semaine ?',
  'read',
  NOW() - INTERVAL '5 days'
)
ON CONFLICT (id) DO NOTHING;

-- Demande 3
INSERT INTO inquiries (
  id,
  property_id,
  sender_id,
  owner_id,
  sender_name,
  sender_email,
  sender_phone,
  subject,
  message,
  status,
  created_at
)
VALUES (
  'inquiry-3',
  'prop-6',
  'user-1',
  'owner-3',
  'Paul Mwamba',
  'client1@test.cd',
  '+243 90 111 2222',
  'Demande de visite',
  'Je souhaiterais visiter ce duplex. Quels sont vos horaires disponibles ?',
  'responded',
  NOW() - INTERVAL '3 days'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 5. CRÉER DES RENDEZ-VOUS (APPOINTMENTS)
-- ============================================

-- Rendez-vous 1
INSERT INTO appointments (
  id,
  property_id,
  client_id,
  agent_id,
  client_name,
  client_email,
  client_phone,
  appointment_date,
  appointment_time,
  appointment_type,
  status,
  notes,
  created_at
)
VALUES (
  'apt-1',
  'prop-1',
  'user-1',
  'agent-1',
  'Paul Mwamba',
  'client1@test.cd',
  '+243 90 111 2222',
  (CURRENT_DATE + INTERVAL '3 days')::date,
  '10:00:00',
  'in_person',
  'pending',
  'Visite de la villa avec le client',
  NOW() - INTERVAL '1 day'
)
ON CONFLICT (id) DO NOTHING;

-- Rendez-vous 2
INSERT INTO appointments (
  id,
  property_id,
  client_id,
  agent_id,
  client_name,
  client_email,
  client_phone,
  appointment_date,
  appointment_time,
  appointment_type,
  status,
  notes,
  created_at
)
VALUES (
  'apt-2',
  'prop-2',
  'user-2',
  'agent-2',
  'Sophie Tshisekedi',
  'client2@test.cd',
  '+243 91 222 3333',
  (CURRENT_DATE + INTERVAL '5 days')::date,
  '14:30:00',
  'in_person',
  'confirmed',
  'Visite confirmée',
  NOW() - INTERVAL '2 days'
)
ON CONFLICT (id) DO NOTHING;

-- Rendez-vous 3
INSERT INTO appointments (
  id,
  property_id,
  client_id,
  agent_id,
  client_name,
  client_email,
  client_phone,
  appointment_date,
  appointment_time,
  appointment_type,
  status,
  notes,
  created_at
)
VALUES (
  'apt-3',
  'prop-6',
  'user-1',
  'agent-1',
  'Paul Mwamba',
  'client1@test.cd',
  '+243 90 111 2222',
  (CURRENT_DATE - INTERVAL '2 days')::date,
  '11:00:00',
  'in_person',
  'completed',
  'Visite effectuée avec succès',
  NOW() - INTERVAL '5 days'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 6. CRÉER DES AVIS (REVIEWS)
-- ============================================

-- Avis 1
INSERT INTO reviews (
  id,
  property_id,
  user_id,
  rating,
  comment,
  comment_en,
  is_verified,
  helpful_count,
  created_at
)
VALUES (
  'review-1',
  'prop-1',
  'user-1',
  5,
  'Excellente propriété ! Tout correspond à la description. Je recommande vivement.',
  'Excellent property! Everything matches the description. I highly recommend.',
  true,
  3,
  NOW() - INTERVAL '7 days'
)
ON CONFLICT (id) DO NOTHING;

-- Avis 2
INSERT INTO reviews (
  id,
  property_id,
  user_id,
  rating,
  comment,
  comment_en,
  is_verified,
  helpful_count,
  created_at
)
VALUES (
  'review-2',
  'prop-2',
  'user-2',
  4,
  'Très bon appartement, bien situé. Seul bémol : le bruit de la rue.',
  'Very good apartment, well located. Only downside: street noise.',
  true,
  2,
  NOW() - INTERVAL '10 days'
)
ON CONFLICT (id) DO NOTHING;

-- Avis 3
INSERT INTO reviews (
  id,
  property_id,
  user_id,
  rating,
  comment,
  comment_en,
  is_verified,
  helpful_count,
  created_at
)
VALUES (
  'review-3',
  'prop-6',
  'user-1',
  5,
  'Parfait ! Le duplex est magnifique et le propriétaire très accueillant.',
  'Perfect! The duplex is beautiful and the owner is very welcoming.',
  true,
  5,
  NOW() - INTERVAL '4 days'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 7. CRÉER DES NOTIFICATIONS
-- ============================================

-- Notification 1
INSERT INTO notifications (
  id,
  user_id,
  type,
  title,
  title_en,
  body,
  body_en,
  data,
  is_read,
  created_at
)
VALUES (
  'notif-1',
  'owner-1',
  'inquiry',
  'Nouvelle demande',
  'New inquiry',
  'Vous avez reçu une nouvelle demande pour votre propriété "Villa Moderne Golf"',
  'You have received a new inquiry for your property "Modern Golf Villa"',
  '{"property_id": "prop-1", "inquiry_id": "inquiry-1"}'::jsonb,
  false,
  NOW() - INTERVAL '2 days'
)
ON CONFLICT (id) DO NOTHING;

-- Notification 2
INSERT INTO notifications (
  id,
  user_id,
  type,
  title,
  title_en,
  body,
  body_en,
  data,
  is_read,
  created_at
)
VALUES (
  'notif-2',
  'user-1',
  'appointment',
  'Rendez-vous confirmé',
  'Appointment confirmed',
  'Votre rendez-vous pour "Villa Moderne Golf" a été confirmé',
  'Your appointment for "Modern Golf Villa" has been confirmed',
  '{"property_id": "prop-1", "appointment_id": "apt-1"}'::jsonb,
  true,
  NOW() - INTERVAL '1 day'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 8. CRÉER DES PROPRIÉTÉS SAUVEGARDÉES
-- ============================================

INSERT INTO saved_properties (user_id, property_id, created_at)
VALUES 
  ('user-1', 'prop-1', NOW() - INTERVAL '5 days'),
  ('user-1', 'prop-6', NOW() - INTERVAL '3 days'),
  ('user-2', 'prop-2', NOW() - INTERVAL '7 days'),
  ('user-2', 'prop-5', NOW() - INTERVAL '2 days')
ON CONFLICT (user_id, property_id) DO NOTHING;

-- ============================================
-- 9. CRÉER L'HISTORIQUE DES PRIX
-- ============================================

INSERT INTO price_history (property_id, price, currency, recorded_at)
VALUES 
  ('prop-1', 360000, 'USD', NOW() - INTERVAL '30 days'),
  ('prop-1', 355000, 'USD', NOW() - INTERVAL '20 days'),
  ('prop-1', 350000, 'USD', NOW() - INTERVAL '10 days'),
  ('prop-2', 1600, 'USD', NOW() - INTERVAL '25 days'),
  ('prop-2', 1550, 'USD', NOW() - INTERVAL '15 days'),
  ('prop-2', 1500, 'USD', NOW() - INTERVAL '5 days')
ON CONFLICT DO NOTHING;

-- ============================================
-- 10. CRÉER DES VUES DE PROPRIÉTÉS
-- ============================================

INSERT INTO property_views (property_id, user_id, viewed_at)
VALUES 
  ('prop-1', 'user-1', NOW() - INTERVAL '2 days'),
  ('prop-1', 'user-2', NOW() - INTERVAL '1 day'),
  ('prop-2', 'user-1', NOW() - INTERVAL '3 days'),
  ('prop-2', 'user-2', NOW() - INTERVAL '2 days'),
  ('prop-6', 'user-1', NOW() - INTERVAL '1 day'),
  ('prop-6', 'user-2', NOW() - INTERVAL '4 hours')
ON CONFLICT DO NOTHING;

-- ============================================
-- 11. VÉRIFICATION
-- ============================================

-- Statistiques globales
SELECT 
  'Propriétés' as type,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'active') as active,
  COUNT(*) FILTER (WHERE is_featured = true) as featured
FROM properties;

SELECT 
  'Utilisateurs' as type,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE role = 'user') as users,
  COUNT(*) FILTER (WHERE role = 'owner') as owners,
  COUNT(*) FILTER (WHERE role = 'agent') as agents
FROM profiles;

SELECT 
  'Agents' as type,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE is_active = true) as active,
  COUNT(*) FILTER (WHERE is_verified = true) as verified
FROM agents;

SELECT 
  'Demandes' as type,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'new') as new,
  COUNT(*) FILTER (WHERE status = 'read') as read,
  COUNT(*) FILTER (WHERE status = 'responded') as responded
FROM inquiries;

SELECT 
  'Rendez-vous' as type,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'pending') as pending,
  COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed,
  COUNT(*) FILTER (WHERE status = 'completed') as completed
FROM appointments;

SELECT 
  'Avis' as type,
  COUNT(*) as total,
  ROUND(AVG(rating), 2) as avg_rating
FROM reviews;

-- ============================================
-- FIN
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Données d''exemple créées avec succès !';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Statistiques :';
  RAISE NOTICE '  - 6 propriétés';
  RAISE NOTICE '  - 5 utilisateurs (2 clients, 3 propriétaires)';
  RAISE NOTICE '  - 2 agents';
  RAISE NOTICE '  - 3 demandes';
  RAISE NOTICE '  - 3 rendez-vous';
  RAISE NOTICE '  - 3 avis';
  RAISE NOTICE '  - 2 notifications';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Vous pouvez maintenant tester l''application et le dashboard !';
  RAISE NOTICE '';
END $$;


