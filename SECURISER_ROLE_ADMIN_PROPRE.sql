-- NIUMBA - Sécurisation du Rôle Admin
-- Script SQL propre - Prêt à exécuter dans Supabase

-- Supprimer la vue si elle existe déjà
DROP VIEW IF EXISTS profiles_public CASCADE;

-- Créer une vue qui masque le rôle admin
CREATE VIEW profiles_public AS
SELECT 
  id,
  email,
  full_name,
  phone,
  avatar_url,
  company_name,
  company_logo,
  CASE 
    WHEN role = 'admin' AND auth.uid() != id THEN 'user'::user_role
    ELSE role
  END as role,
  language,
  city,
  province,
  is_verified,
  is_active,
  created_at,
  updated_at
FROM profiles;

-- Activer RLS sur la vue
ALTER VIEW profiles_public SET (security_invoker = true);

-- Supprimer l'ancienne policy trop permissive
DROP POLICY IF EXISTS "profiles_select_public" ON profiles;

-- Créer une nouvelle policy qui masque le rôle admin
CREATE POLICY "profiles_select_secure" ON profiles 
FOR SELECT USING (
  auth.uid() = id
  OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  OR
  (
    role != 'admin'
    AND (
      is_active = true
      OR auth.uid() IS NOT NULL
    )
  )
);

-- Fonction pour obtenir le rôle visible (masque admin pour les non-admins)
CREATE OR REPLACE FUNCTION get_visible_role(profile_id UUID, user_role user_role)
RETURNS user_role AS $$
BEGIN
  IF auth.uid() = profile_id THEN
    RETURN user_role;
  END IF;
  
  IF EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RETURN user_role;
  END IF;
  
  IF user_role = 'admin' THEN
    RETURN 'user'::user_role;
  END IF;
  
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Vue alternative qui utilise la fonction
CREATE OR REPLACE VIEW profiles_public_secure AS
SELECT 
  id,
  email,
  full_name,
  phone,
  avatar_url,
  company_name,
  company_logo,
  get_visible_role(id, role) as role,
  language,
  city,
  province,
  is_verified,
  is_active,
  created_at,
  updated_at
FROM profiles;

-- Activer RLS sur la vue
ALTER VIEW profiles_public_secure SET (security_invoker = true);

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '✅ Sécurisation du rôle admin terminée !';
  RAISE NOTICE '✅ Vue profiles_public créée';
  RAISE NOTICE '✅ Vue profiles_public_secure créée';
  RAISE NOTICE '✅ Policy RLS sécurisée créée';
  RAISE NOTICE '✅ Fonction get_visible_role créée';
  RAISE NOTICE '🔒 Le rôle admin est maintenant masqué pour les utilisateurs normaux !';
END $$;


