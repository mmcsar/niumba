-- ============================================
-- NIUMBA - Créer un compte Admin sécurisé
-- ============================================

-- REMPLACEZ 'votre-email@example.com' par votre vrai email
-- Exécutez ce script APRÈS vous être inscrit dans l'app

UPDATE profiles 
SET 
  role = 'admin',
  is_verified = true,
  is_active = true
WHERE email = 'votre-email@example.com';

-- Vérification
SELECT id, email, full_name, role, is_verified 
FROM profiles 
WHERE email = 'votre-email@example.com';

