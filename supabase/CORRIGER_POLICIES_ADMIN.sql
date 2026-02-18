-- ============================================
-- NIUMBA - Corriger les Policies RLS pour les Admins
-- ============================================
-- 
-- Ce script met à jour les policies RLS pour permettre aux admins
-- d'accéder à toutes les données sans restriction
-- ============================================

-- 1. Créer une fonction helper pour vérifier si l'utilisateur est admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Mettre à jour les policies pour PROPERTIES
-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "properties_select_public" ON properties;
DROP POLICY IF EXISTS "properties_select_admin" ON properties;
DROP POLICY IF EXISTS "properties_select_all" ON properties;

-- Créer une nouvelle policy qui permet aux admins de tout voir
CREATE POLICY "properties_select_all" ON properties
  FOR SELECT USING (
    status = 'active'
    OR owner_id = auth.uid()
    OR public.is_admin()
  );

-- Permettre aux admins de modifier toutes les propriétés
DROP POLICY IF EXISTS "properties_update_own" ON properties;
CREATE POLICY "properties_update_all" ON properties
  FOR UPDATE USING (
    owner_id = auth.uid()
    OR public.is_admin()
  )
  WITH CHECK (
    owner_id = auth.uid()
    OR public.is_admin()
  );

-- Permettre aux admins de supprimer toutes les propriétés
DROP POLICY IF EXISTS "properties_delete_own" ON properties;
CREATE POLICY "properties_delete_all" ON properties
  FOR DELETE USING (
    owner_id = auth.uid()
    OR public.is_admin()
  );

-- 3. Mettre à jour les policies pour INQUIRIES
-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "inquiries_select_authenticated" ON inquiries;
DROP POLICY IF EXISTS "inquiries_select_all" ON inquiries;

-- Créer une nouvelle policy qui permet aux admins de tout voir
CREATE POLICY "inquiries_select_all" ON inquiries
  FOR SELECT USING (
    sender_id = auth.uid()
    OR owner_id = auth.uid()
    OR public.is_admin()
  );

-- Permettre aux admins de modifier toutes les demandes
DROP POLICY IF EXISTS "inquiries_update_authenticated" ON inquiries;
CREATE POLICY "inquiries_update_all" ON inquiries
  FOR UPDATE USING (
    owner_id = auth.uid()
    OR public.is_admin()
  )
  WITH CHECK (
    owner_id = auth.uid()
    OR public.is_admin()
  );

-- 4. Mettre à jour les policies pour PROFILES
-- Les admins peuvent voir tous les profils (pour la gestion des utilisateurs)
DROP POLICY IF EXISTS "profiles_select_public" ON profiles;
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all" ON profiles
  FOR SELECT USING (
    id = auth.uid()
    OR public.is_admin()
  );

-- 5. Mettre à jour les policies pour AGENTS
-- Les admins peuvent voir tous les agents
DROP POLICY IF EXISTS "agents_select_public" ON agents;
DROP POLICY IF EXISTS "agents_select_all" ON agents;
CREATE POLICY "agents_select_all" ON agents
  FOR SELECT USING (
    is_active = true
    OR user_id = auth.uid()
    OR public.is_admin()
  );

-- Permettre aux admins de modifier tous les agents
DROP POLICY IF EXISTS "agents_upsert_own" ON agents;
CREATE POLICY "agents_upsert_all" ON agents
  FOR ALL USING (
    user_id = auth.uid()
    OR public.is_admin()
  )
  WITH CHECK (
    user_id = auth.uid()
    OR public.is_admin()
  );

-- 6. Mettre à jour les policies pour APPOINTMENTS
-- Les admins peuvent voir tous les rendez-vous
DROP POLICY IF EXISTS "appointments_select_authenticated" ON appointments;
DROP POLICY IF EXISTS "appointments_select_all" ON appointments;
CREATE POLICY "appointments_select_all" ON appointments
  FOR SELECT USING (
    client_id = auth.uid()
    OR agent_id = auth.uid()
    OR public.is_admin()
  );

-- Permettre aux admins de modifier tous les rendez-vous
DROP POLICY IF EXISTS "appointments_update_authenticated" ON appointments;
CREATE POLICY "appointments_update_all" ON appointments
  FOR UPDATE USING (
    client_id = auth.uid()
    OR agent_id = auth.uid()
    OR public.is_admin()
  )
  WITH CHECK (
    client_id = auth.uid()
    OR agent_id = auth.uid()
    OR public.is_admin()
  );

-- 7. Vérification finale
SELECT 
  'Policies mises à jour' as verification,
  tablename,
  policyname,
  cmd as operation
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('properties', 'inquiries', 'profiles', 'agents', 'appointments')
  AND (policyname LIKE '%_all' OR policyname LIKE '%admin%')
ORDER BY tablename, policyname;

-- Message de confirmation
DO $msg$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Fonction is_admin() créée !';
  RAISE NOTICE '✅ Policies mises à jour pour permettre l''accès admin !';
  RAISE NOTICE '';
  RAISE NOTICE 'Les admins peuvent maintenant :';
  RAISE NOTICE '  - Voir toutes les propriétés (même draft)';
  RAISE NOTICE '  - Voir toutes les demandes';
  RAISE NOTICE '  - Voir tous les profils';
  RAISE NOTICE '  - Modifier toutes les données';
  RAISE NOTICE '';
END $msg$;

