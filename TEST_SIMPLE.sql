-- TEST SIMPLE - Vérifier la Sécurisation
-- Copiez ce script dans Supabase SQL Editor

-- Vérifier les vues
SELECT 'VUES' as type, table_name as nom FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'profiles%' ORDER BY table_name;

-- Vérifier la fonction
SELECT 'FONCTION' as type, routine_name as nom FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'get_visible_role';

-- Vérifier la policy sécurisée
SELECT 'POLICY' as type, policyname as nom FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'profiles_select_secure';

-- Résumé final
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles_public_secure')
    AND EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'get_visible_role')
    AND EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'profiles_select_secure')
    THEN '✅ TOUT EST OK !'
    ELSE '❌ Il manque quelque chose'
  END as resultat;


