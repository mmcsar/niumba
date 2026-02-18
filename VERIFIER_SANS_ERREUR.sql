-- NIUMBA - Vérification de la Sécurisation (Sans Erreur)
-- Ce script vérifie seulement, ne crée rien

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
  'ANCIENNE POLICY' as verification,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'profiles' 
      AND policyname = 'profiles_select_public'
    ) THEN '⚠️ L''ancienne policy existe encore'
    ELSE '✅ L''ancienne policy a été supprimée'
  END as status;

-- 5. Vérifier que la nouvelle policy existe
SELECT 
  'NOUVELLE POLICY' as verification,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'profiles' 
      AND policyname = 'profiles_select_secure'
    ) THEN '✅ La nouvelle policy existe'
    ELSE '❌ La nouvelle policy n''existe pas'
  END as status;

-- 6. Résumé final
SELECT 
  'RÉSUMÉ FINAL' as verification,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles_public_secure')
    AND EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'get_visible_role')
    AND EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'profiles_select_secure')
    THEN '✅ TOUT EST BIEN CONFIGURÉ ! Le rôle admin est sécurisé.'
    ELSE '⚠️ Il manque certains éléments'
  END as status_final;


