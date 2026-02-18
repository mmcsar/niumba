-- ============================================
-- NIUMBA - Créer Profil Admin pour christian@maintenancemc.com
-- ============================================
-- 
-- ID Utilisateur Auth: 5afbf42c-2d01-4d5f-91e4-754d04d6d147
-- Email: christian@maintenancemc.com
-- ============================================

-- Créer ou mettre à jour le profil admin
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
VALUES (
  '5afbf42c-2d01-4d5f-91e4-754d04d6d147',  -- ID de l'utilisateur Auth
  'christian@maintenancemc.com',
  'Christian Admin',
  'admin',
  true,
  true,
  'fr',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET 
  role = 'admin',
  email = 'christian@maintenancemc.com',
  full_name = 'Christian Admin',
  is_verified = true,
  is_active = true,
  updated_at = NOW();

-- ============================================
-- VÉRIFICATION
-- ============================================

SELECT 
  id,
  email,
  full_name,
  role,
  is_verified,
  is_active,
  created_at,
  updated_at
FROM profiles
WHERE email = 'christian@maintenancemc.com';

-- ============================================
-- RÉSULTAT ATTENDU
-- ============================================
-- 
-- Vous devriez voir :
-- - id: 5afbf42c-2d01-4d5f-91e4-754d04d6d147
-- - email: christian@maintenancemc.com
-- - role: 'admin'
-- - is_verified: true
-- - is_active: true
-- 
-- ============================================


