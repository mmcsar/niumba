-- ============================================
-- NIUMBA - RLS Policies with Required Authentication
-- Les utilisateurs DOIVENT avoir un compte pour :
-- - Sauvegarder des propriétés
-- - Envoyer des demandes/messages
-- - Laisser des avis
-- - Prendre rendez-vous
-- - Créer des alertes
-- ============================================

-- ============================================
-- 1. PROFILES - Profils utilisateurs
-- ============================================

-- Supprimer anciennes policies
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;

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

DROP POLICY IF EXISTS "properties_select_public" ON properties;
DROP POLICY IF EXISTS "properties_select" ON properties;
DROP POLICY IF EXISTS "properties_insert_own" ON properties;
DROP POLICY IF EXISTS "properties_insert" ON properties;
DROP POLICY IF EXISTS "properties_update_own" ON properties;
DROP POLICY IF EXISTS "properties_update" ON properties;
DROP POLICY IF EXISTS "properties_delete_own" ON properties;
DROP POLICY IF EXISTS "properties_delete" ON properties;
DROP POLICY IF EXISTS "properties_admin_all" ON properties;

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

DROP POLICY IF EXISTS "saved_properties_select_own" ON saved_properties;
DROP POLICY IF EXISTS "saved_select_own" ON saved_properties;
DROP POLICY IF EXISTS "saved_select" ON saved_properties;
DROP POLICY IF EXISTS "saved_properties_insert_own" ON saved_properties;
DROP POLICY IF EXISTS "saved_insert_own" ON saved_properties;
DROP POLICY IF EXISTS "saved_insert" ON saved_properties;
DROP POLICY IF EXISTS "saved_properties_delete_own" ON saved_properties;
DROP POLICY IF EXISTS "saved_delete_own" ON saved_properties;
DROP POLICY IF EXISTS "saved_delete" ON saved_properties;

-- COMPTE REQUIS: Voir ses favoris
CREATE POLICY "saved_select_authenticated" ON saved_properties
  FOR SELECT USING (
    auth.uid() IS NOT NULL 
    AND auth.uid() = user_id
  );

-- COMPTE REQUIS: Ajouter aux favoris
CREATE POLICY "saved_insert_authenticated" ON saved_properties
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid() = user_id
  );

-- COMPTE REQUIS: Retirer des favoris
CREATE POLICY "saved_delete_authenticated" ON saved_properties
  FOR DELETE USING (
    auth.uid() IS NOT NULL 
    AND auth.uid() = user_id
  );

-- ============================================
-- 4. INQUIRIES - Demandes de contact (COMPTE REQUIS)
-- ============================================

DROP POLICY IF EXISTS "inquiries_select_involved" ON inquiries;
DROP POLICY IF EXISTS "inquiries_select" ON inquiries;
DROP POLICY IF EXISTS "inquiries_insert_all" ON inquiries;
DROP POLICY IF EXISTS "inquiries_insert" ON inquiries;
DROP POLICY IF EXISTS "inquiries_update_owner" ON inquiries;
DROP POLICY IF EXISTS "inquiries_update" ON inquiries;

-- COMPTE REQUIS: Voir ses demandes envoyées ou reçues
CREATE POLICY "inquiries_select_authenticated" ON inquiries
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (auth.uid() = sender_id OR auth.uid() = owner_id)
  );

-- COMPTE REQUIS: Envoyer une demande
CREATE POLICY "inquiries_insert_authenticated" ON inquiries
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = sender_id
  );

-- Le propriétaire peut mettre à jour le statut
CREATE POLICY "inquiries_update_owner" ON inquiries
  FOR UPDATE USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Les admins voient tout
CREATE POLICY "inquiries_admin_select" ON inquiries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- 5. APPOINTMENTS - Rendez-vous (COMPTE REQUIS)
-- ============================================

DROP POLICY IF EXISTS "appointments_select_involved" ON appointments;
DROP POLICY IF EXISTS "appointments_select" ON appointments;
DROP POLICY IF EXISTS "appointments_insert_all" ON appointments;
DROP POLICY IF EXISTS "appointments_insert" ON appointments;
DROP POLICY IF EXISTS "appointments_update_involved" ON appointments;
DROP POLICY IF EXISTS "appointments_update" ON appointments;
DROP POLICY IF EXISTS "appointments_delete_involved" ON appointments;

-- COMPTE REQUIS: Voir ses rendez-vous
CREATE POLICY "appointments_select_authenticated" ON appointments
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (
      auth.uid() = client_id 
      OR auth.uid() = agent_id
      OR EXISTS (SELECT 1 FROM properties WHERE id = property_id AND owner_id = auth.uid())
    )
  );

-- COMPTE REQUIS: Prendre un rendez-vous
CREATE POLICY "appointments_insert_authenticated" ON appointments
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = client_id
  );

-- Les personnes impliquées peuvent modifier
CREATE POLICY "appointments_update_authenticated" ON appointments
  FOR UPDATE USING (
    auth.uid() IS NOT NULL
    AND (
      auth.uid() = client_id 
      OR auth.uid() = agent_id
      OR EXISTS (SELECT 1 FROM properties WHERE id = property_id AND owner_id = auth.uid())
    )
  );

-- COMPTE REQUIS: Annuler son rendez-vous
CREATE POLICY "appointments_delete_authenticated" ON appointments
  FOR DELETE USING (
    auth.uid() IS NOT NULL
    AND auth.uid() = client_id
  );

-- Les admins ont tous les droits
CREATE POLICY "appointments_admin_full" ON appointments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- 6. REVIEWS - Avis (COMPTE REQUIS pour écrire)
-- ============================================

DROP POLICY IF EXISTS "reviews_select_all" ON reviews;
DROP POLICY IF EXISTS "reviews_select" ON reviews;
DROP POLICY IF EXISTS "reviews_insert_auth" ON reviews;
DROP POLICY IF EXISTS "reviews_insert" ON reviews;
DROP POLICY IF EXISTS "reviews_update_own" ON reviews;
DROP POLICY IF EXISTS "reviews_update" ON reviews;
DROP POLICY IF EXISTS "reviews_delete_own" ON reviews;

-- Tout le monde peut lire les avis
CREATE POLICY "reviews_select_public" ON reviews
  FOR SELECT USING (true);

-- COMPTE REQUIS: Laisser un avis
CREATE POLICY "reviews_insert_authenticated" ON reviews
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = user_id
  );

-- Seul l'auteur peut modifier
CREATE POLICY "reviews_update_own" ON reviews
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Seul l'auteur peut supprimer
CREATE POLICY "reviews_delete_own" ON reviews
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 7. CONVERSATIONS & MESSAGES (COMPTE REQUIS)
-- ============================================

DROP POLICY IF EXISTS "conversations_select" ON conversations;
DROP POLICY IF EXISTS "conversations_insert" ON conversations;
DROP POLICY IF EXISTS "messages_select" ON messages;
DROP POLICY IF EXISTS "messages_insert" ON messages;

-- COMPTE REQUIS: Voir ses conversations
CREATE POLICY "conversations_select_authenticated" ON conversations
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (auth.uid() = participant_1 OR auth.uid() = participant_2)
  );

-- COMPTE REQUIS: Démarrer une conversation
CREATE POLICY "conversations_insert_authenticated" ON conversations
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND (auth.uid() = participant_1 OR auth.uid() = participant_2)
  );

-- COMPTE REQUIS: Voir les messages
CREATE POLICY "messages_select_authenticated" ON messages
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM conversations 
      WHERE id = conversation_id 
      AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
    )
  );

-- COMPTE REQUIS: Envoyer un message
CREATE POLICY "messages_insert_authenticated" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations 
      WHERE id = conversation_id 
      AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
    )
  );

-- ============================================
-- 8. SEARCH_ALERTS - Alertes (COMPTE REQUIS)
-- ============================================

DROP POLICY IF EXISTS "alerts_select_own" ON search_alerts;
DROP POLICY IF EXISTS "alerts_select" ON search_alerts;
DROP POLICY IF EXISTS "alerts_insert_own" ON search_alerts;
DROP POLICY IF EXISTS "alerts_insert" ON search_alerts;
DROP POLICY IF EXISTS "alerts_update_own" ON search_alerts;
DROP POLICY IF EXISTS "alerts_update" ON search_alerts;
DROP POLICY IF EXISTS "alerts_delete_own" ON search_alerts;
DROP POLICY IF EXISTS "alerts_delete" ON search_alerts;

-- COMPTE REQUIS: Toutes les opérations sur les alertes
CREATE POLICY "alerts_select_authenticated" ON search_alerts
  FOR SELECT USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "alerts_insert_authenticated" ON search_alerts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "alerts_update_authenticated" ON search_alerts
  FOR UPDATE USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "alerts_delete_authenticated" ON search_alerts
  FOR DELETE USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- ============================================
-- 9. NOTIFICATIONS (COMPTE REQUIS)
-- ============================================

DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
DROP POLICY IF EXISTS "notifications_select" ON notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
DROP POLICY IF EXISTS "notifications_update" ON notifications;
DROP POLICY IF EXISTS "notifications_insert" ON notifications;

-- COMPTE REQUIS: Voir ses notifications
CREATE POLICY "notifications_select_authenticated" ON notifications
  FOR SELECT USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- COMPTE REQUIS: Marquer comme lue
CREATE POLICY "notifications_update_authenticated" ON notifications
  FOR UPDATE USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Système/Admin peut créer des notifications
CREATE POLICY "notifications_insert_system" ON notifications
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- 10. PROPERTY_VIEWS - Vues (Anonyme OK)
-- ============================================

DROP POLICY IF EXISTS "views_insert_all" ON property_views;
DROP POLICY IF EXISTS "views_insert" ON property_views;
DROP POLICY IF EXISTS "views_select_owner" ON property_views;

-- Tout le monde peut enregistrer une vue (analytics)
CREATE POLICY "views_insert_public" ON property_views
  FOR INSERT WITH CHECK (true);

-- Les propriétaires et admins peuvent voir les stats
CREATE POLICY "views_select_authorized" ON property_views
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM properties WHERE id = property_id AND owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- 11. AGENTS (Public lecture, COMPTE pour modifier)
-- ============================================

DROP POLICY IF EXISTS "agents_select" ON agents;
DROP POLICY IF EXISTS "agents_insert_own" ON agents;
DROP POLICY IF EXISTS "agents_insert" ON agents;
DROP POLICY IF EXISTS "agents_update_own" ON agents;
DROP POLICY IF EXISTS "agents_update" ON agents;

-- Les agents actifs sont visibles par tous
CREATE POLICY "agents_select_public" ON agents
  FOR SELECT USING (is_active = true OR user_id = auth.uid());

-- COMPTE REQUIS: S'inscrire comme agent
CREATE POLICY "agents_insert_authenticated" ON agents
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = user_id
  );

-- COMPTE REQUIS: Modifier son profil agent
CREATE POLICY "agents_update_authenticated" ON agents
  FOR UPDATE USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Les admins ont tous les droits
CREATE POLICY "agents_admin_full" ON agents
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- 12. CITIES - Villes (Public)
-- ============================================

DROP POLICY IF EXISTS "cities_select_all" ON cities;
DROP POLICY IF EXISTS "cities_select" ON cities;

-- Tout le monde peut voir les villes
CREATE POLICY "cities_select_public" ON cities
  FOR SELECT USING (true);

-- Seuls les admins peuvent modifier
CREATE POLICY "cities_admin_full" ON cities
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- 13. PRICE_HISTORY - Historique prix (Public)
-- ============================================

DROP POLICY IF EXISTS "price_history_select" ON price_history;

-- Tout le monde peut voir l'historique des prix
CREATE POLICY "price_history_select_public" ON price_history
  FOR SELECT USING (true);

-- ============================================
-- RÉSUMÉ DES ACCÈS
-- ============================================

-- ╔══════════════════════════════════════════════════════════════╗
-- ║ Fonctionnalité          │ Sans compte │ Avec compte         ║
-- ╠══════════════════════════════════════════════════════════════╣
-- ║ Voir les propriétés     │ ✅ OUI      │ ✅ OUI              ║
-- ║ Voir les avis           │ ✅ OUI      │ ✅ OUI              ║
-- ║ Voir les agents         │ ✅ OUI      │ ✅ OUI              ║
-- ║ Voir l'historique prix  │ ✅ OUI      │ ✅ OUI              ║
-- ╠══════════════════════════════════════════════════════════════╣
-- ║ Sauvegarder (favoris)   │ ❌ NON      │ ✅ OUI              ║
-- ║ Contacter propriétaire  │ ❌ NON      │ ✅ OUI              ║
-- ║ Prendre RDV             │ ❌ NON      │ ✅ OUI              ║
-- ║ Laisser un avis         │ ❌ NON      │ ✅ OUI              ║
-- ║ Envoyer message         │ ❌ NON      │ ✅ OUI              ║
-- ║ Créer alertes           │ ❌ NON      │ ✅ OUI              ║
-- ║ Publier propriété       │ ❌ NON      │ ✅ (Owner/Agent)    ║
-- ╚══════════════════════════════════════════════════════════════╝

COMMENT ON SCHEMA public IS 'Niumba RLS: Compte requis pour fonctionnalités avancées';

