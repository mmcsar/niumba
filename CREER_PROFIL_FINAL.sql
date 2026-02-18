-- Script FINAL - Créer le profil (sans erreur)
-- Exécute ce script dans Supabase SQL Editor

-- 1. Trouver l'ID de l'utilisateur
SELECT id, email, email_confirmed_at 
FROM auth.users 
WHERE email = 'kzadichris@gmail.com';

-- 2. Après avoir copié l'ID ci-dessus, exécute ce script
-- Remplace 'COLLER_ID_ICI' par l'ID que tu as copié

-- D'abord, vérifier si le profil existe déjà
SELECT id, email, role 
FROM profiles 
WHERE email = 'kzadichris@gmail.com';

-- Si aucun résultat (0 rows), alors créer le profil :
-- (Remplace 'COLLER_ID_ICI' par l'ID de l'étape 1)
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
  'COLLER_ID_ICI',  -- ← Colle l'ID ici
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
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  is_verified = true,
  is_active = true,
  updated_at = NOW();

-- 3. Vérifier que c'est créé
SELECT id, email, full_name, role, is_active, is_verified
FROM profiles
WHERE email = 'kzadichris@gmail.com';


