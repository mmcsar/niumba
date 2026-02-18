-- ============================================
-- Niumba - Correction des Politiques RLS pour Profiles
-- ============================================
-- Ce script s'assure que les politiques RLS sont correctes
-- pour la table 'profiles'
-- ============================================

-- ============================================
-- 1. ACTIVER RLS SUR LA TABLE PROFILES
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. SUPPRIMER LES ANCIENNES POLITIQUES (si elles existent)
-- ============================================

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- ============================================
-- 3. CRÉER LES POLITIQUES RLS
-- ============================================

-- SELECT: Les utilisateurs peuvent voir leur propre profil et tous les profils publics
CREATE POLICY "Users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Peut voir son propre profil
  auth.uid() = id
  OR
  -- Peut voir tous les profils (pour les listes d'agents, etc.)
  true
);

-- Les utilisateurs non authentifiés peuvent voir les profils publics (pour les listes d'agents)
CREATE POLICY "Public can view active profiles"
ON public.profiles
FOR SELECT
TO anon
USING (is_active = true);

-- INSERT: Les utilisateurs peuvent créer leur propre profil (via trigger normalement)
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- UPDATE: Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Les admins peuvent mettre à jour tous les profils
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- DELETE: Seuls les admins peuvent supprimer des profils
CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- ============================================
-- 4. VÉRIFICATION
-- ============================================

-- Vérifier que RLS est activé
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'profiles';

-- Vérifier les politiques créées
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'profiles'
ORDER BY policyname;

