-- ============================================
-- NIUMBA - Corriger les Problèmes de Profil
-- ============================================
-- 
-- Ce script :
-- 1. Vérifie les utilisateurs sans profil
-- 2. Crée automatiquement les profils manquants
-- 3. Vérifie les permissions pour la création de profil
-- ============================================

-- 1. Vérifier les utilisateurs sans profil
SELECT 
  'Utilisateurs sans profil' as verification,
  au.id,
  au.email,
  au.created_at as user_created_at,
  CASE WHEN p.id IS NULL THEN '❌ Pas de profil' ELSE '✅ Profil existe' END as status
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE p.id IS NULL
ORDER BY au.created_at DESC;

-- 2. Créer automatiquement les profils manquants
DO $$
DECLARE
  user_record RECORD;
  profiles_created INTEGER := 0;
BEGIN
  -- Parcourir tous les utilisateurs sans profil
  FOR user_record IN 
    SELECT au.id, au.email, au.raw_user_meta_data, au.email_confirmed_at, au.created_at
    FROM auth.users au
    LEFT JOIN profiles p ON p.id = au.id
    WHERE p.id IS NULL
  LOOP
    BEGIN
      -- Créer le profil
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
        user_record.id,
        user_record.email,
        COALESCE(user_record.raw_user_meta_data->>'full_name', user_record.raw_user_meta_data->>'name', split_part(user_record.email, '@', 1), 'User'),
        COALESCE((user_record.raw_user_meta_data->>'role')::text, 'user'),
        COALESCE(user_record.email_confirmed_at IS NOT NULL, false),
        true,
        COALESCE(user_record.raw_user_meta_data->>'language', 'fr'),
        user_record.created_at,
        NOW()
      )
      ON CONFLICT (id) DO NOTHING;
      
      profiles_created := profiles_created + 1;
      
      RAISE NOTICE '✅ Profil créé pour: %', user_record.email;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '❌ Erreur lors de la création du profil pour %: %', user_record.email, SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ % profil(s) créé(s)', profiles_created;
END $$;

-- 3. Vérifier que tous les utilisateurs ont maintenant un profil
SELECT 
  'Vérification finale' as verification,
  COUNT(*) FILTER (WHERE p.id IS NULL) as users_without_profile,
  COUNT(*) FILTER (WHERE p.id IS NOT NULL) as users_with_profile,
  COUNT(*) as total_users
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id;

-- 4. Vérifier les permissions de la policy profiles_insert_own
SELECT 
  'Policies Profiles' as verification,
  policyname,
  cmd as operation,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'profiles'
ORDER BY policyname;

-- 5. Message de confirmation
DO $$
DECLARE
  missing_profiles INTEGER;
BEGIN
  SELECT COUNT(*) INTO missing_profiles
  FROM auth.users au
  LEFT JOIN profiles p ON p.id = au.id
  WHERE p.id IS NULL;
  
  IF missing_profiles = 0 THEN
    RAISE NOTICE '';
    RAISE NOTICE '✅ Tous les utilisateurs ont maintenant un profil !';
    RAISE NOTICE '';
  ELSE
    RAISE NOTICE '';
    RAISE NOTICE '⚠️ Il reste % utilisateur(s) sans profil', missing_profiles;
    RAISE NOTICE '   Vérifiez les permissions RLS pour la table profiles';
    RAISE NOTICE '';
  END IF;
END $$;

