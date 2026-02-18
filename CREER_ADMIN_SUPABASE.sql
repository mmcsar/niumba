-- ============================================
-- NIUMBA - Créer un Utilisateur Admin pour Tester
-- ============================================
-- 
-- Ce script crée un utilisateur admin dans Supabase
-- Exécutez-le dans Supabase SQL Editor
-- ============================================

-- ============================================
-- MÉTHODE 1 : Créer un utilisateur admin via SQL
-- ============================================

-- Note: Vous devez d'abord créer l'utilisateur dans Supabase Auth
-- Puis exécuter ce script pour mettre à jour le profil

-- ÉTAPE 1 : Créer l'utilisateur dans Supabase Auth Dashboard
-- 1. Allez dans Authentication > Users
-- 2. Cliquez sur "Add User"
-- 3. Email: admin@niumba.com
-- 4. Password: Admin123!@#
-- 5. Cliquez sur "Create User"
-- 6. Copiez l'ID de l'utilisateur créé

-- ÉTAPE 2 : Exécutez ce script avec l'ID de l'utilisateur
-- Remplacez 'VOTRE_USER_ID_ICI' par l'ID copié

-- Mettre à jour le profil pour être admin
UPDATE profiles
SET 
  role = 'admin',
  full_name = 'Administrateur Niumba',
  is_verified = true,
  is_active = true
WHERE id = 'VOTRE_USER_ID_ICI';

-- OU créer un nouveau profil admin si n'existe pas
INSERT INTO profiles (
  id,
  email,
  full_name,
  role,
  is_verified,
  is_active,
  language
)
VALUES (
  'VOTRE_USER_ID_ICI',  -- Remplacez par l'ID de l'utilisateur Auth
  'admin@niumba.com',
  'Administrateur Niumba',
  'admin',
  true,
  true,
  'fr'
)
ON CONFLICT (id) DO UPDATE
SET 
  role = 'admin',
  is_verified = true,
  is_active = true;

-- ============================================
-- MÉTHODE 2 : Créer directement via l'application
-- ============================================

-- Vous pouvez aussi créer un utilisateur normal, puis le promouvoir admin
-- avec ce script :

-- Promouvoir un utilisateur existant en admin
UPDATE profiles
SET role = 'admin'
WHERE email = 'votre-email@example.com';

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
  is_active
FROM profiles
WHERE role = 'admin';

-- ============================================
-- INFORMATIONS DE CONNEXION PAR DÉFAUT
-- ============================================

-- Email: admin@niumba.com
-- Password: Admin123!@#
-- 
-- ⚠️ CHANGEZ LE MOT DE PASSE APRÈS LA PREMIÈRE CONNEXION !


