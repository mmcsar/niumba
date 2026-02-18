-- ============================================
-- NIUMBA - Créer un Compte Admin de Test
-- ============================================
-- 
-- Ce script crée un utilisateur admin pour tester le dashboard
-- Exécutez-le dans Supabase SQL Editor
-- ============================================

-- ============================================
-- ÉTAPE 1 : Créer l'utilisateur dans Supabase Auth Dashboard
-- ============================================
-- 
-- 1. Allez dans Supabase Dashboard → Authentication → Users
-- 2. Cliquez sur "Add User"
-- 3. Remplissez :
--    - Email: admin@niumba.com
--    - Password: Admin123!@#
--    - Auto Confirm User: ✅ Cochez cette case
-- 4. Cliquez sur "Create User"
-- 5. COPIEZ L'ID de l'utilisateur créé (UUID)
-- 
-- ============================================

-- ============================================
-- ÉTAPE 2 : Exécutez ce script avec l'ID copié
-- ============================================
-- Remplacez 'VOTRE_USER_ID_ICI' par l'ID copié à l'étape 1

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
  'VOTRE_USER_ID_ICI',  -- ⚠️ REMPLACEZ PAR L'ID DE L'UTILISATEUR AUTH
  'admin@niumba.com',
  'Admin Test Niumba',
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
  full_name = 'Admin Test Niumba',
  is_verified = true,
  is_active = true,
  updated_at = NOW();

-- ============================================
-- VÉRIFICATION
-- ============================================

-- Vérifier que l'admin a été créé
SELECT 
  id,
  email,
  full_name,
  role,
  is_verified,
  is_active,
  created_at
FROM profiles
WHERE email = 'admin@niumba.com';

-- ============================================
-- INFORMATIONS DE CONNEXION
-- ============================================
-- 
-- Email: admin@niumba.com
-- Password: Admin123!@#
-- 
-- ⚠️ Changez le mot de passe après la première connexion !
-- ============================================


