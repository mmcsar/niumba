-- ============================================
-- NIUMBA - Vérifier et Corriger christian@maintenancemc.com
-- ============================================
-- 
-- Ce script vérifie le compte et le promeut en admin si nécessaire
-- Exécutez-le dans Supabase SQL Editor
-- ============================================

-- Vérifier le compte actuel
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

-- Promouvoir en admin si ce n'est pas déjà le cas
UPDATE profiles
SET 
  role = 'admin',
  is_verified = true,
  is_active = true,
  updated_at = NOW()
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

-- ============================================
-- NOTE IMPORTANTE
-- ============================================
-- 
-- Le mot de passe DOIT être réinitialisé dans Supabase Dashboard :
-- 1. Allez dans Authentication → Users
-- 2. Recherchez christian@maintenancemc.com
-- 3. Cliquez sur l'utilisateur
-- 4. Cliquez sur "Update Password"
-- 5. Entrez : Christian2024!@#
-- 6. Cliquez sur "Save"
-- 
-- ============================================


