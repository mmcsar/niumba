-- ============================================
-- NIUMBA - Vérifier et Corriger les Permissions Admin
-- ============================================
-- 
-- Ce script vérifie que les admins peuvent accéder à toutes les données
-- et corrige les policies si nécessaire
-- ============================================

-- 1. Vérifier les policies actuelles pour les admins
SELECT 
  'Policies actuelles' as verification,
  tablename,
  policyname,
  cmd as operation,
  qual as using_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('properties', 'profiles', 'agents', 'inquiries', 'appointments')
ORDER BY tablename, policyname;

-- 2. Vérifier si les policies permettent l'accès admin via JWT
-- Note: Les admins doivent pouvoir accéder via auth.jwt() ->> 'user_role' = 'admin'
-- OU via EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
-- Mais la deuxième méthode peut causer une récursion, donc on utilise JWT

-- 3. Corriger les policies pour permettre l'accès admin via JWT
-- (Note: Cette méthode nécessite que le rôle soit dans le JWT, ce qui n'est pas toujours le cas)

-- Alternative: Créer une fonction helper pour vérifier si l'utilisateur est admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Vérifier directement dans auth.users pour éviter la récursion
  RETURN EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Vérifier que la fonction est créée
SELECT 
  'Fonction créée' as verification,
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'is_admin';

-- 5. Message de confirmation
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.routines
    WHERE routine_schema = 'public'
    AND routine_name = 'is_admin'
  ) THEN
    RAISE NOTICE '';
    RAISE NOTICE '✅ Fonction is_admin() créée !';
    RAISE NOTICE '⚠️ Note: Vous devez maintenant mettre à jour les policies pour utiliser cette fonction';
    RAISE NOTICE '   Exemple: USING (status = ''active'' OR owner_id = auth.uid() OR public.is_admin())';
    RAISE NOTICE '';
  ELSE
    RAISE NOTICE '❌ Erreur : La fonction n''a pas été créée';
  END IF;
END $$;


