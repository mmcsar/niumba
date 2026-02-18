-- Script SIMPLE - Créer le profil utilisateur
-- PAS de policies, juste créer le profil

-- Remplace 'kzadichris@gmail.com' par ton email exact
INSERT INTO profiles (
  id,
  email,
  full_name,
  role,
  is_verified,
  is_active,
  language,
  created_at,
  updated_at
)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.email),
  'admin',
  true,
  true,
  'fr',
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email = 'kzadichris@gmail.com'
ON CONFLICT (id) DO UPDATE
SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  is_verified = true,
  is_active = true,
  updated_at = NOW();

-- Vérifier que le profil est créé
SELECT id, email, full_name, role, is_active
FROM profiles
WHERE email = 'kzadichris@gmail.com';


