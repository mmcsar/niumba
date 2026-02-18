-- ============================================
-- Migration 005: Policies pour INQUIRIES (Demandes)
-- ============================================

-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "inquiries_select_parties" ON inquiries;
DROP POLICY IF EXISTS "inquiries_insert_user" ON inquiries;
DROP POLICY IF EXISTS "inquiries_update_owner" ON inquiries;
DROP POLICY IF EXISTS "inquiries_select" ON inquiries;
DROP POLICY IF EXISTS "inquiries_insert" ON inquiries;
DROP POLICY IF EXISTS "inquiries_update" ON inquiries;

-- Lecture par le demandeur OU le propriétaire
CREATE POLICY "inquiries_select_parties" ON inquiries
  FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = owner_id);

-- Création par le demandeur uniquement
CREATE POLICY "inquiries_insert_user" ON inquiries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Modification par le propriétaire (pour répondre)
CREATE POLICY "inquiries_update_owner" ON inquiries
  FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);



