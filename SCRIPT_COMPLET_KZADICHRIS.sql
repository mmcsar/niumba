-- ============================================
-- NIUMBA - Script Complet pour kzadichris@gmail.com
-- ============================================
-- 
-- INSTRUCTIONS :
-- 1. Créez d'abord l'utilisateur dans Supabase Auth Dashboard
--    Email: kzadichris@gmail.com
--    Password: Kzadi2024!@#
--    Auto Confirm: ✅
-- 2. Copiez l'ID de l'utilisateur créé
-- 3. Remplacez 'VOTRE_USER_ID_ICI' par l'ID copié
-- 4. Exécutez ce script dans SQL Editor
-- ============================================

-- ============================================
-- CRÉER LE PROFIL ADMIN
-- ============================================

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
  'VOTRE_USER_ID_ICI',  -- ⚠️ REMPLACEZ PAR L'ID DE L'UTILISATEUR AUTH
  'kzadichris@gmail.com',
  'Admin Kzadichris',
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
  email = 'kzadichris@gmail.com',
  full_name = 'Admin Kzadichris',
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
WHERE email = 'kzadichris@gmail.com';

-- ============================================
-- INFORMATIONS DE CONNEXION
-- ============================================
-- 
-- Email: kzadichris@gmail.com
-- Password: Kzadi2024!@#
-- 
-- ⚠️ Changez le mot de passe après la première connexion si vous voulez !
-- ============================================


