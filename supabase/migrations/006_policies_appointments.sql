-- ============================================
-- Migration 006: Policies pour APPOINTMENTS (Rendez-vous)
-- ============================================

-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "appointments_select_parties" ON appointments;
DROP POLICY IF EXISTS "appointments_insert_user" ON appointments;
DROP POLICY IF EXISTS "appointments_update_parties" ON appointments;
DROP POLICY IF EXISTS "appointments_select" ON appointments;
DROP POLICY IF EXISTS "appointments_insert" ON appointments;
DROP POLICY IF EXISTS "appointments_update" ON appointments;

-- Lecture par le demandeur OU le propriétaire
CREATE POLICY "appointments_select_parties" ON appointments
  FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = owner_id);

-- Création par l'utilisateur qui demande le RDV
CREATE POLICY "appointments_insert_user" ON appointments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Modification par les deux parties (confirmer, annuler)
CREATE POLICY "appointments_update_parties" ON appointments
  FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = owner_id)
  WITH CHECK (auth.uid() = user_id OR auth.uid() = owner_id);



