-- ============================================
-- NIUMBA - Créer Admin pour kzadichris@gmail.com
-- ============================================
-- 
-- Ce script promeut kzadichris@gmail.com en admin
-- Exécutez-le dans Supabase SQL Editor
-- ============================================

-- ============================================
-- ÉTAPE 1 : Vérifier si l'utilisateur existe dans Auth
-- ============================================
-- 
-- Si l'utilisateur n'existe pas encore dans Supabase Auth :
-- 1. Allez dans Supabase Dashboard → Authentication → Users
-- 2. Cliquez sur "Add User"
-- 3. Email: kzadichris@gmail.com
-- 4. Password: (choisissez un mot de passe)
-- 5. Auto Confirm User: ✅ Cochez cette case
-- 6. Cliquez sur "Create User"
-- 7. COPIEZ L'ID de l'utilisateur créé (UUID)
-- 
-- ============================================

-- ============================================
-- ÉTAPE 2 : Vérifier le compte actuel
-- ============================================

-- Vérifier si le profil existe
SELECT 
  id,
  email,
  full_name,
  role,
  is_verified,
  is_active,
  created_at
FROM profiles
WHERE email = 'kzadichris@gmail.com';

-- ============================================
-- ÉTAPE 3 : Promouvoir en admin
-- ============================================

-- Si le profil existe déjà, le promouvoir en admin
UPDATE profiles
SET 
  role = 'admin',
  is_verified = true,
  is_active = true,
  updated_at = NOW()
WHERE email = 'kzadichris@gmail.com';

-- ============================================
-- ÉTAPE 4 : Créer le profil si n'existe pas
-- ============================================
-- 
-- Si le profil n'existe pas, vous devez d'abord créer l'utilisateur dans Auth
-- Puis exécutez ce script (remplacez 'VOTRE_USER_ID_ICI' par l'ID de l'utilisateur Auth) :

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
-- VÉRIFICATION FINALE
-- ============================================

-- Vérifier que l'admin a été créé/promu
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
-- RÉSULTAT ATTENDU
-- ============================================
-- 
-- Vous devriez voir :
-- - email: kzadichris@gmail.com
-- - role: 'admin'
-- - is_verified: true
-- - is_active: true
-- 
-- ============================================


