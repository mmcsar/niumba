-- ============================================
-- NIUMBA - Corriger la Récursion Infinie dans les Policies Profiles
-- ============================================
-- 
-- Le problème : La policy "properties_select_public" vérifie si l'utilisateur est admin
-- en faisant EXISTS (SELECT 1 FROM profiles WHERE ...), ce qui déclenche la policy
-- "profiles_select_public", qui elle-même peut déclencher d'autres policies, créant une boucle.
-- ============================================

-- 1. Supprimer les policies problématiques qui causent la récursion
DROP POLICY IF EXISTS "properties_select_public" ON properties;
DROP POLICY IF EXISTS "profiles_select_public" ON profiles;

-- 2. Recréer la policy profiles_select_public SANS récursion
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'profiles_select_public'
  ) THEN
    EXECUTE 'CREATE POLICY "profiles_select_public" ON profiles FOR SELECT USING (true)';
  END IF;
END $$;

-- 3. Recréer la policy properties_select_public SANS vérifier le rôle admin via profiles
-- On utilise auth.jwt() pour vérifier le rôle directement depuis le token JWT
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'properties' 
    AND policyname = 'properties_select_public'
  ) THEN
    EXECUTE 'CREATE POLICY "properties_select_public" ON properties FOR SELECT USING (
      status = ''active'' 
      OR owner_id = auth.uid()
      OR (auth.jwt() ->> ''user_role'')::text = ''admin''
    )';
  END IF;
END $$;

-- 4. Alternative : Policy properties_select_public simplifiée (sans vérification admin)
-- Si la solution ci-dessus ne fonctionne pas, utilisez cette version simplifiée :
-- (Décommentez si nécessaire)
/*
DO $$ BEGIN
  DROP POLICY IF EXISTS "properties_select_public" ON properties;
  EXECUTE 'CREATE POLICY "properties_select_public" ON properties FOR SELECT USING (
    status = ''active'' OR owner_id = auth.uid()
  )';
END $$;
*/

-- 5. Vérifier que les policies sont créées
SELECT 
  'Policies Profiles' as verification,
  policyname,
  cmd as operation
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'profiles'
ORDER BY policyname;

SELECT 
  'Policies Properties' as verification,
  policyname,
  cmd as operation
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'properties'
ORDER BY policyname;

-- 6. Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '✅ Policies profiles corrigées (plus de récursion) !';
  RAISE NOTICE '✅ Policies properties corrigées !';
  RAISE NOTICE '⚠️ Note: La vérification admin se fait maintenant via JWT au lieu de la table profiles';
END $$;


