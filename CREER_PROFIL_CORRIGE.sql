-- Script CORRIGÉ - Créer le profil utilisateur
-- Contourne les problèmes RLS et PGRST116

-- Étape 1 : Vérifier que l'utilisateur existe dans auth.users
SELECT id, email, email_confirmed_at 
FROM auth.users 
WHERE email = 'kzadichris@gmail.com';

-- Étape 2 : Créer le profil avec l'ID exact de l'utilisateur
-- Remplace 'TON_USER_ID_ICI' par l'ID que tu vois dans l'étape 1
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
  'TON_USER_ID_ICI',  -- Remplace par l'ID de l'étape 1
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

-- Étape 3 : Vérifier que le profil est créé
SELECT id, email, full_name, role, is_active
FROM profiles
WHERE email = 'kzadichris@gmail.com';


