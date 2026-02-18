-- ============================================
-- NIUMBA - Corriger les Utilisateurs Existants
-- ============================================
-- 
-- Ce script crée les profils manquants pour TOUS les utilisateurs
-- qui existent dans auth.users mais pas dans profiles
-- ============================================

-- Créer les profils manquants pour tous les utilisateurs existants
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
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.email),
  'user',
  COALESCE(u.email_confirmed_at IS NOT NULL, false),
  true,
  COALESCE(u.raw_user_meta_data->>'language', 'fr'),
  u.created_at,
  NOW()
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO UPDATE
SET
  email = EXCLUDED.email,
  full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
  updated_at = NOW();

-- Vérifier combien de profils ont été créés
SELECT 
  COUNT(*) as profils_crees
FROM profiles p
INNER JOIN auth.users u ON p.id = u.id;

-- Vérifier s'il reste des utilisateurs sans profil
SELECT 
  COUNT(*) as utilisateurs_sans_profil
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.id = u.id
);

-- Message de confirmation
DO $$
DECLARE
  profils_crees INTEGER;
  utilisateurs_sans_profil INTEGER;
BEGIN
  SELECT COUNT(*) INTO profils_crees
  FROM profiles p
  INNER JOIN auth.users u ON p.id = u.id;
  
  SELECT COUNT(*) INTO utilisateurs_sans_profil
  FROM auth.users u
  WHERE NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = u.id
  );
  
  RAISE NOTICE '✅ Profils créés : %', profils_crees;
  RAISE NOTICE '⚠️ Utilisateurs sans profil : %', utilisateurs_sans_profil;
  
  IF utilisateurs_sans_profil = 0 THEN
    RAISE NOTICE '✅ Tous les utilisateurs ont maintenant un profil !';
  ELSE
    RAISE NOTICE '⚠️ Il reste % utilisateur(s) sans profil', utilisateurs_sans_profil;
  END IF;
END $$;


