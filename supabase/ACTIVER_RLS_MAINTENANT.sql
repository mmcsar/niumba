-- ============================================
-- NIUMBA - ACTIVATION RLS COMPLÈTE
-- Exécutez ce script dans Supabase SQL Editor
-- ============================================
-- 
-- INSTRUCTIONS :
-- 1. Allez dans Supabase Dashboard → SQL Editor
-- 2. Cliquez sur "New Query"
-- 3. Copiez-collez ce script
-- 4. Cliquez sur "Run" (ou Ctrl+Enter)
-- 5. Vérifiez qu'il n'y a pas d'erreurs
-- ============================================

-- ============================================
-- ÉTAPE 1 : ACTIVER RLS SUR TOUTES LES TABLES
-- ============================================

ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS saved_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS search_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS property_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS price_history ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ÉTAPE 2 : SUPPRIMER LES ANCIENNES POLICIES
-- ============================================

-- Profiles
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;

-- Properties
DROP POLICY IF EXISTS "properties_select_public" ON properties;
DROP POLICY IF EXISTS "properties_select" ON properties;
DROP POLICY IF EXISTS "properties_insert_own" ON properties;
DROP POLICY IF EXISTS "properties_insert" ON properties;
DROP POLICY IF EXISTS "properties_update_own" ON properties;
DROP POLICY IF EXISTS "properties_update" ON properties;
DROP POLICY IF EXISTS "properties_delete_own" ON properties;
DROP POLICY IF EXISTS "properties_delete" ON properties;
DROP POLICY IF EXISTS "properties_admin_all" ON properties;
DROP POLICY IF EXISTS "properties_admin_full" ON properties;

-- Saved Properties
DROP POLICY IF EXISTS "saved_properties_select_own" ON saved_properties;
DROP POLICY IF EXISTS "saved_select_own" ON saved_properties;
DROP POLICY IF EXISTS "saved_select" ON saved_properties;
DROP POLICY IF EXISTS "saved_properties_insert_own" ON saved_properties;
DROP POLICY IF EXISTS "saved_insert_own" ON saved_properties;
DROP POLICY IF EXISTS "saved_insert" ON saved_properties;
DROP POLICY IF EXISTS "saved_properties_delete_own" ON saved_properties;
DROP POLICY IF EXISTS "saved_delete_own" ON saved_properties;
DROP POLICY IF EXISTS "saved_delete" ON saved_properties;

-- Inquiries
DROP POLICY IF EXISTS "inquiries_select_own" ON inquiries;
DROP POLICY IF EXISTS "inquiries_select" ON inquiries;
DROP POLICY IF EXISTS "inquiries_insert_own" ON inquiries;
DROP POLICY IF EXISTS "inquiries_insert" ON inquiries;
DROP POLICY IF EXISTS "inquiries_update_own" ON inquiries;
DROP POLICY IF EXISTS "inquiries_update" ON inquiries;

-- Appointments
DROP POLICY IF EXISTS "appointments_select_own" ON appointments;
DROP POLICY IF EXISTS "appointments_select" ON appointments;
DROP POLICY IF EXISTS "appointments_insert_own" ON appointments;
DROP POLICY IF EXISTS "appointments_insert" ON appointments;
DROP POLICY IF EXISTS "appointments_update_own" ON appointments;
DROP POLICY IF EXISTS "appointments_update" ON appointments;

-- Reviews
DROP POLICY IF EXISTS "reviews_select_public" ON reviews;
DROP POLICY IF EXISTS "reviews_select" ON reviews;
DROP POLICY IF EXISTS "reviews_insert_own" ON reviews;
DROP POLICY IF EXISTS "reviews_insert" ON reviews;
DROP POLICY IF EXISTS "reviews_update_own" ON reviews;
DROP POLICY IF EXISTS "reviews_update" ON reviews;

-- Conversations
DROP POLICY IF EXISTS "conversations_select_own" ON conversations;
DROP POLICY IF EXISTS "conversations_select" ON conversations;
DROP POLICY IF EXISTS "conversations_insert_own" ON conversations;
DROP POLICY IF EXISTS "conversations_insert" ON conversations;

-- Messages
DROP POLICY IF EXISTS "messages_select_own" ON messages;
DROP POLICY IF EXISTS "messages_select" ON messages;
DROP POLICY IF EXISTS "messages_insert_own" ON messages;
DROP POLICY IF EXISTS "messages_insert" ON messages;

-- Notifications
DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
DROP POLICY IF EXISTS "notifications_select" ON notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
DROP POLICY IF EXISTS "notifications_update" ON notifications;

-- Search Alerts
DROP POLICY IF EXISTS "search_alerts_select_own" ON search_alerts;
DROP POLICY IF EXISTS "search_alerts_select" ON search_alerts;
DROP POLICY IF EXISTS "search_alerts_insert_own" ON search_alerts;
DROP POLICY IF EXISTS "search_alerts_insert" ON search_alerts;
DROP POLICY IF EXISTS "search_alerts_delete_own" ON search_alerts;
DROP POLICY IF EXISTS "search_alerts_delete" ON search_alerts;

-- Agents
DROP POLICY IF EXISTS "agents_select_public" ON agents;
DROP POLICY IF EXISTS "agents_select" ON agents;
DROP POLICY IF EXISTS "agents_insert_own" ON agents;
DROP POLICY IF EXISTS "agents_insert" ON agents;
DROP POLICY IF EXISTS "agents_update_own" ON agents;
DROP POLICY IF EXISTS "agents_update" ON agents;

-- ============================================
-- ÉTAPE 3 : CRÉER LES POLICIES
-- ============================================

-- ============================================
-- 1. PROFILES - Profils utilisateurs
-- ============================================

-- Tout le monde peut voir les profils publics
CREATE POLICY "profiles_select_public" ON profiles
  FOR SELECT USING (true);

-- Seul le propriétaire peut modifier son profil
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Un utilisateur authentifié peut créer son profil
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. PROPERTIES - Propriétés immobilières
-- ============================================

-- Tout le monde peut voir les propriétés actives (navigation sans compte)
CREATE POLICY "properties_select_public" ON properties
  FOR SELECT USING (
    status = 'active' 
    OR owner_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- COMPTE REQUIS: Seuls les propriétaires/agents peuvent ajouter
CREATE POLICY "properties_insert_authenticated" ON properties
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = owner_id
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'agent', 'admin'))
  );

-- Seul le propriétaire peut modifier
CREATE POLICY "properties_update_own" ON properties
  FOR UPDATE USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Seul le propriétaire peut supprimer
CREATE POLICY "properties_delete_own" ON properties
  FOR DELETE USING (auth.uid() = owner_id);

-- Les admins ont tous les droits
CREATE POLICY "properties_admin_full" ON properties
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- 3. SAVED_PROPERTIES - Favoris (COMPTE REQUIS)
-- ============================================

-- COMPTE REQUIS: Voir ses favoris
CREATE POLICY "saved_select_authenticated" ON saved_properties
  FOR SELECT USING (
    auth.uid() IS NOT NULL 
    AND auth.uid() = user_id
  );

-- COMPTE REQUIS: Ajouter un favori
CREATE POLICY "saved_insert_authenticated" ON saved_properties
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid() = user_id
  );

-- COMPTE REQUIS: Supprimer un favori
CREATE POLICY "saved_delete_authenticated" ON saved_properties
  FOR DELETE USING (
    auth.uid() IS NOT NULL 
    AND auth.uid() = user_id
  );

-- ============================================
-- 4. INQUIRIES - Demandes (COMPTE REQUIS)
-- ============================================

-- COMPTE REQUIS: Voir ses demandes (en tant qu'envoyeur ou propriétaire)
CREATE POLICY "inquiries_select_authenticated" ON inquiries
  FOR SELECT USING (
    auth.uid() IS NOT NULL 
    AND (
      sender_id = auth.uid() 
      OR owner_id = auth.uid()
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );

-- COMPTE REQUIS: Créer une demande
CREATE POLICY "inquiries_insert_authenticated" ON inquiries
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND (sender_id = auth.uid() OR sender_id IS NULL)
  );

-- COMPTE REQUIS: Modifier une demande (propriétaire ou admin)
CREATE POLICY "inquiries_update_authenticated" ON inquiries
  FOR UPDATE USING (
    auth.uid() IS NOT NULL 
    AND (
      owner_id = auth.uid()
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
  )
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND (
      owner_id = auth.uid()
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );

-- ============================================
-- 5. APPOINTMENTS - Rendez-vous (COMPTE REQUIS)
-- ============================================

-- COMPTE REQUIS: Voir ses rendez-vous
CREATE POLICY "appointments_select_authenticated" ON appointments
  FOR SELECT USING (
    auth.uid() IS NOT NULL 
    AND (
      client_id = auth.uid() 
      OR agent_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM properties p 
        WHERE p.id = appointments.property_id 
        AND p.owner_id = auth.uid()
      )
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );

-- COMPTE REQUIS: Créer un rendez-vous
CREATE POLICY "appointments_insert_authenticated" ON appointments
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL 
    AND client_id = auth.uid()
  );

-- COMPTE REQUIS: Modifier un rendez-vous
CREATE POLICY "appointments_update_authenticated" ON appointments
  FOR UPDATE USING (
    auth.uid() IS NOT NULL 
    AND (
      client_id = auth.uid() 
      OR agent_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM properties p 
        WHERE p.id = appointments.property_id 
        AND p.owner_id = auth.uid()
      )
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
  )
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND (
      client_id = auth.uid() 
      OR agent_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM properties p 
        WHERE p.id = appointments.property_id 
        AND p.owner_id = auth.uid()
      )
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );

-- ============================================
-- 6. REVIEWS - Avis
-- ============================================

-- Tout le monde peut voir les avis publics
CREATE POLICY "reviews_select_public" ON reviews
  FOR SELECT USING (true);

-- COMPTE REQUIS: Créer un avis
CREATE POLICY "reviews_insert_authenticated" ON reviews
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
  );

-- COMPTE REQUIS: Modifier son propre avis
CREATE POLICY "reviews_update_own" ON reviews
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 7. CONVERSATIONS - Conversations (COMPTE REQUIS)
-- ============================================

-- COMPTE REQUIS: Voir ses conversations
CREATE POLICY "conversations_select_authenticated" ON conversations
  FOR SELECT USING (
    auth.uid() IS NOT NULL 
    AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
  );

-- COMPTE REQUIS: Créer une conversation
CREATE POLICY "conversations_insert_authenticated" ON conversations
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL 
    AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
  );

-- ============================================
-- 8. MESSAGES - Messages (COMPTE REQUIS)
-- ============================================

-- COMPTE REQUIS: Voir les messages de ses conversations
CREATE POLICY "messages_select_authenticated" ON messages
  FOR SELECT USING (
    auth.uid() IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM conversations c 
      WHERE c.id = messages.conversation_id 
      AND (c.participant1_id = auth.uid() OR c.participant2_id = auth.uid())
    )
  );

-- COMPTE REQUIS: Envoyer un message
CREATE POLICY "messages_insert_authenticated" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL 
    AND sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversations c 
      WHERE c.id = messages.conversation_id 
      AND (c.participant1_id = auth.uid() OR c.participant2_id = auth.uid())
    )
  );

-- ============================================
-- 9. NOTIFICATIONS - Notifications (COMPTE REQUIS)
-- ============================================

-- COMPTE REQUIS: Voir ses notifications
CREATE POLICY "notifications_select_authenticated" ON notifications
  FOR SELECT USING (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
  );

-- COMPTE REQUIS: Marquer notification comme lue
CREATE POLICY "notifications_update_authenticated" ON notifications
  FOR UPDATE USING (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
  )
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
  );

-- ============================================
-- 10. SEARCH_ALERTS - Alertes de recherche (COMPTE REQUIS)
-- ============================================

-- COMPTE REQUIS: Voir ses alertes
CREATE POLICY "search_alerts_select_authenticated" ON search_alerts
  FOR SELECT USING (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
  );

-- COMPTE REQUIS: Créer une alerte
CREATE POLICY "search_alerts_insert_authenticated" ON search_alerts
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
  );

-- COMPTE REQUIS: Supprimer une alerte
CREATE POLICY "search_alerts_delete_authenticated" ON search_alerts
  FOR DELETE USING (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
  );

-- ============================================
-- 11. AGENTS - Agents immobiliers
-- ============================================

-- Tout le monde peut voir les agents actifs
CREATE POLICY "agents_select_public" ON agents
  FOR SELECT USING (
    is_active = true 
    OR user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- COMPTE REQUIS: Créer/modifier son profil agent
CREATE POLICY "agents_upsert_own" ON agents
  FOR ALL USING (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
  )
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
  );

-- ============================================
-- 12. CITIES - Villes (Lecture publique, modification admin)
-- ============================================

-- Tout le monde peut voir les villes
CREATE POLICY "cities_select_public" ON cities
  FOR SELECT USING (true);

-- Seuls les admins peuvent modifier
CREATE POLICY "cities_admin_modify" ON cities
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- 13. PRICE_HISTORY - Historique des prix (Lecture publique)
-- ============================================

-- Tout le monde peut voir l'historique des prix
CREATE POLICY "price_history_select_public" ON price_history
  FOR SELECT USING (true);

-- ============================================
-- 14. PROPERTY_VIEWS - Vues de propriétés
-- ============================================

-- Tout le monde peut enregistrer une vue (pour analytics)
CREATE POLICY "property_views_insert_public" ON property_views
  FOR INSERT WITH CHECK (true);

-- Seuls les propriétaires/admins peuvent voir les statistiques
CREATE POLICY "property_views_select_owner" ON property_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties p 
      WHERE p.id = property_views.property_id 
      AND (
        p.owner_id = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
      )
    )
  );

-- ============================================
-- FIN DU SCRIPT
-- ============================================

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '✅ RLS activé avec succès sur toutes les tables !';
  RAISE NOTICE '✅ Toutes les policies ont été créées !';
  RAISE NOTICE '🔒 Votre base de données est maintenant sécurisée !';
END $$;


