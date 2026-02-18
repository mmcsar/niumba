-- ============================================
-- NIUMBA - Vérifier et Promouvoir Admin
-- ============================================
-- 
-- Ce script vérifie le compte christian@maintenancemc.com
-- et le promeut en admin si nécessaire
-- ============================================

-- Vérifier le compte actuel
SELECT 
  id,
  email,
  full_name,
  role,
  is_verified,
  is_active,
  created_at
FROM profiles
WHERE email = 'christian@maintenancemc.com';

-- Promouvoir en admin si ce n'est pas déjà le cas
UPDATE profiles
SET 
  role = 'admin',
  is_verified = true,
  is_active = true
WHERE email = 'christian@maintenancemc.com';

-- Vérifier après mise à jour
SELECT 
  id,
  email,
  full_name,
  role,
  is_verified,
  is_active
FROM profiles
WHERE email = 'christian@maintenancemc.com';


