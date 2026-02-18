-- ============================================
-- NIUMBA - Vérification de la Sécurisation
-- ============================================
-- 
-- Exécutez ce script pour vérifier que tout est bien configuré
-- ============================================

-- 1. Vérifier que les vues sont créées
SELECT 
  'VUES CRÉÉES' as verification,
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'profiles%'
ORDER BY table_name;

-- 2. Vérifier que la fonction est créée
SELECT 
  'FONCTION CRÉÉE' as verification,
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'get_visible_role';

-- 3. Vérifier que les policies sont créées
SELECT 
  'POLICIES RLS' as verification,
  tablename,
  policyname,
  cmd as operation
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'profiles'
ORDER BY policyname;

-- 4. Vérifier que l'ancienne policy a été supprimée
SELECT 
  'ANCIENNE POLICY SUPPRIMÉE' as verification,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'profiles' 
      AND policyname = 'profiles_select_public'
    ) THEN '❌ L''ancienne policy existe encore'
    ELSE '✅ L''ancienne policy a été supprimée'
  END as status;

-- 5. Vérifier que la nouvelle policy existe
SELECT 
  'NOUVELLE POLICY CRÉÉE' as verification,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'profiles' 
      AND policyname = 'profiles_select_secure'
    ) THEN '✅ La nouvelle policy existe'
    ELSE '❌ La nouvelle policy n''existe pas'
  END as status;

-- 6. Test de la fonction (remplacez 'admin-id' par un ID réel si nécessaire)
-- SELECT get_visible_role('00000000-0000-0000-0000-000000000000'::uuid, 'admin'::user_role) as test_function;

-- 7. Résumé final
SELECT 
  'RÉSUMÉ' as verification,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles_public_secure')
    AND EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'get_visible_role')
    AND EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'profiles_select_secure')
    THEN '✅ TOUT EST BIEN CONFIGURÉ !'
    ELSE '❌ IL MANQUE DES ÉLÉMENTS'
  END as status_final;


