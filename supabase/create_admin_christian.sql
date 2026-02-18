-- ============================================
-- NIUMBA - Création Compte Admin Sécurisé
-- Admin: Christian (christian@maintenancemc.com)
-- MMC SARL - Seul administrateur autorisé
-- ============================================

-- ÉTAPE 1: D'abord, inscrivez-vous via l'app avec:
-- Email: christian@maintenancemc.com
-- Mot de passe: (votre choix - minimum 8 caractères, avec majuscules et chiffres)

-- ÉTAPE 2: Après inscription, exécutez ce script dans Supabase SQL Editor

-- Promouvoir christian@maintenancemc.com en admin
UPDATE profiles 
SET 
  role = 'admin',
  is_verified = TRUE,
  full_name = 'Christian',
  company_name = 'MMC SARL',
  updated_at = NOW()
WHERE email = 'christian@maintenancemc.com';

-- Vérifier que la mise à jour a fonctionné
SELECT 
  id,
  email,
  full_name,
  role,
  is_verified,
  company_name,
  created_at
FROM profiles 
WHERE email = 'christian@maintenancemc.com';

-- ============================================
-- SÉCURITÉ SUPPLÉMENTAIRE
-- ============================================

-- Créer une fonction pour vérifier si un email est admin autorisé
CREATE OR REPLACE FUNCTION is_authorized_admin(check_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Liste des emails autorisés comme admin
  -- MODIFIEZ CETTE LISTE SI VOUS VOULEZ AJOUTER D'AUTRES ADMINS
  RETURN check_email IN (
    'christian@maintenancemc.com'
    -- Ajoutez d'autres emails admin ici si nécessaire
    -- , 'autre.admin@example.com'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Empêcher la création d'autres admins non autorisés
CREATE OR REPLACE FUNCTION prevent_unauthorized_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- Si quelqu'un essaie de se mettre admin
  IF NEW.role = 'admin' AND NOT is_authorized_admin(NEW.email) THEN
    RAISE EXCEPTION 'Unauthorized: Only authorized emails can become admin';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Appliquer le trigger
DROP TRIGGER IF EXISTS check_admin_authorization ON profiles;
CREATE TRIGGER check_admin_authorization
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  WHEN (NEW.role = 'admin')
  EXECUTE FUNCTION prevent_unauthorized_admin();

-- ============================================
-- VÉRIFICATION FINALE
-- ============================================

-- Lister tous les admins (devrait montrer seulement christian@maintenancemc.com)
SELECT 
  email,
  full_name,
  role,
  is_verified,
  created_at
FROM profiles 
WHERE role = 'admin';

-- ============================================
-- NOTES IMPORTANTES
-- ============================================
-- 
-- 1. Votre mot de passe doit être FORT:
--    - Minimum 12 caractères
--    - Majuscules + minuscules
--    - Chiffres
--    - Caractères spéciaux (!@#$%...)
--
-- 2. Ne partagez JAMAIS vos identifiants
--
-- 3. Ce script empêche quiconque de devenir admin
--    sauf les emails dans la fonction is_authorized_admin()
--
-- 4. Pour ajouter un nouvel admin à l'avenir:
--    - Modifiez la fonction is_authorized_admin()
--    - Ajoutez l'email à la liste
-- ============================================

