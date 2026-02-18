-- ============================================
-- NIUMBA - Vérifier le Compte kzadichris@gmail.com
-- ============================================
-- 
-- Ce script vérifie si le compte existe et son statut
-- Exécutez-le dans Supabase SQL Editor
-- ============================================

-- Vérifier le profil
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
WHERE email = 'kzadichris@gmail.com';

-- Si aucun résultat, le profil n'existe pas
-- Vous devez créer l'utilisateur dans Supabase Auth d'abord

-- ============================================
-- Si le profil existe mais n'est pas admin
-- ============================================

UPDATE profiles
SET 
  role = 'admin',
  is_verified = true,
  is_active = true,
  updated_at = NOW()
WHERE email = 'kzadichris@gmail.com';

-- ============================================
-- Vérification après mise à jour
-- ============================================

SELECT 
  id,
  email,
  full_name,
  role,
  is_verified,
  is_active
FROM profiles
WHERE email = 'kzadichris@gmail.com';


