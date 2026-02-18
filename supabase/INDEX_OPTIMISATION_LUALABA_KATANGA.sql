-- ============================================
-- NIUMBA - INDEX OPTIMISATION
-- Pour Lualaba & Haut-Katanga (Haute Scalabilité)
-- ============================================
-- 
-- INSTRUCTIONS :
-- 1. Allez dans Supabase Dashboard → SQL Editor
-- 2. Exécutez ce script
-- 3. Vérifiez que les index sont créés
-- ============================================

-- ============================================
-- 1. INDEX POUR PROPRIÉTÉS PAR RÉGION
-- ============================================

-- Index pour recherche rapide par ville/région
CREATE INDEX IF NOT EXISTS idx_properties_city_status 
ON properties(city_id, status) 
WHERE status = 'active';

-- Index pour tri par prix (très utilisé)
CREATE INDEX IF NOT EXISTS idx_properties_price_active 
ON properties(price) 
WHERE status = 'active' AND price IS NOT NULL;

-- Index composite pour filtres multiples
CREATE INDEX IF NOT EXISTS idx_properties_city_type_status 
ON properties(city_id, property_type, status) 
WHERE status = 'active';

-- Index pour recherche par date (nouveautés)
CREATE INDEX IF NOT EXISTS idx_properties_created_at 
ON properties(created_at DESC) 
WHERE status = 'active';

-- Index pour recherche par propriétaire
CREATE INDEX IF NOT EXISTS idx_properties_owner 
ON properties(owner_id, status);

-- ============================================
-- 2. INDEX POUR VILLES/RÉGIONS
-- ============================================

-- Index pour recherche par province
CREATE INDEX IF NOT EXISTS idx_cities_province_active 
ON cities(province, is_active) 
WHERE is_active = true;

-- Index pour recherche de villes
CREATE INDEX IF NOT EXISTS idx_cities_name_search 
ON cities USING gin(to_tsvector('french', name || ' ' || COALESCE(name_en, '')));

-- Index pour recherche par code
CREATE INDEX IF NOT EXISTS idx_cities_code 
ON cities(code) 
WHERE code IS NOT NULL;

-- ============================================
-- 3. INDEX POUR AGENTS
-- ============================================

-- Index pour agents actifs
CREATE INDEX IF NOT EXISTS idx_agents_active_verified 
ON agents(is_active, is_verified) 
WHERE is_active = true;

-- Index pour recherche d'agents par région
CREATE INDEX IF NOT EXISTS idx_agents_regions 
ON agents USING gin(service_areas);

-- ============================================
-- 4. INDEX POUR DEMANDES (INQUIRIES)
-- ============================================

-- Index pour demandes par propriété
CREATE INDEX IF NOT EXISTS idx_inquiries_property 
ON inquiries(property_id, status);

-- Index pour demandes par propriétaire
CREATE INDEX IF NOT EXISTS idx_inquiries_owner 
ON inquiries(owner_id, status, created_at DESC);

-- Index pour demandes par envoyeur
CREATE INDEX IF NOT EXISTS idx_inquiries_sender 
ON inquiries(sender_id, created_at DESC) 
WHERE sender_id IS NOT NULL;

-- ============================================
-- 5. INDEX POUR RENDEZ-VOUS (APPOINTMENTS)
-- ============================================

-- Index pour rendez-vous par client
CREATE INDEX IF NOT EXISTS idx_appointments_client 
ON appointments(client_id, status, appointment_date);

-- Index pour rendez-vous par agent
CREATE INDEX IF NOT EXISTS idx_appointments_agent 
ON appointments(agent_id, status, appointment_date) 
WHERE agent_id IS NOT NULL;

-- Index pour rendez-vous par propriété
CREATE INDEX IF NOT EXISTS idx_appointments_property 
ON appointments(property_id, appointment_date);

-- ============================================
-- 6. INDEX POUR AVIS (REVIEWS)
-- ============================================

-- Index pour avis par propriété
CREATE INDEX IF NOT EXISTS idx_reviews_property 
ON reviews(property_id, created_at DESC);

-- Index pour avis par utilisateur
CREATE INDEX IF NOT EXISTS idx_reviews_user 
ON reviews(user_id, created_at DESC);

-- ============================================
-- 7. INDEX POUR NOTIFICATIONS
-- ============================================

-- Index pour notifications par utilisateur
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
ON notifications(user_id, is_read, created_at DESC) 
WHERE is_read = false;

-- ============================================
-- 8. INDEX POUR FAVORIS (SAVED PROPERTIES)
-- ============================================

-- Index pour favoris par utilisateur
CREATE INDEX IF NOT EXISTS idx_saved_properties_user 
ON saved_properties(user_id, created_at DESC);

-- Index pour favoris par propriété
CREATE INDEX IF NOT EXISTS idx_saved_properties_property 
ON saved_properties(property_id);

-- ============================================
-- 9. INDEX POUR STATISTIQUES
-- ============================================

-- Index pour vues de propriétés (analytics)
CREATE INDEX IF NOT EXISTS idx_property_views_property_date 
ON property_views(property_id, viewed_at DESC);

-- Index pour historique des prix
CREATE INDEX IF NOT EXISTS idx_price_history_property_date 
ON price_history(property_id, recorded_at DESC);

-- ============================================
-- 10. INDEX POUR RECHERCHE FULL-TEXT
-- ============================================

-- Index full-text pour recherche dans propriétés
CREATE INDEX IF NOT EXISTS idx_properties_search_text 
ON properties USING gin(
  to_tsvector('french', 
    COALESCE(title, '') || ' ' || 
    COALESCE(description, '') || ' ' ||
    COALESCE(address, '')
  )
);

-- Index full-text pour recherche dans villes
CREATE INDEX IF NOT EXISTS idx_cities_search_text 
ON cities USING gin(
  to_tsvector('french', 
    name || ' ' || 
    COALESCE(name_en, '') || ' ' ||
    COALESCE(province, '')
  )
);

-- ============================================
-- 11. INDEX POUR PERFORMANCE GLOBALE
-- ============================================

-- Index pour profils actifs
CREATE INDEX IF NOT EXISTS idx_profiles_active_role 
ON profiles(is_active, role) 
WHERE is_active = true;

-- Index pour conversations
CREATE INDEX IF NOT EXISTS idx_conversations_participants 
ON conversations(participant1_id, participant2_id);

-- Index pour messages par conversation
CREATE INDEX IF NOT EXISTS idx_messages_conversation_date 
ON messages(conversation_id, created_at DESC);

-- ============================================
-- 12. VACUUM ET ANALYZE (OPTIMISATION)
-- ============================================

-- Analyser les tables pour optimiser les requêtes
ANALYZE properties;
ANALYZE cities;
ANALYZE agents;
ANALYZE inquiries;
ANALYZE appointments;
ANALYZE reviews;
ANALYZE notifications;
ANALYZE saved_properties;

-- ============================================
-- VÉRIFICATION DES INDEX
-- ============================================

-- Voir tous les index créés
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'properties', 'cities', 'agents', 'inquiries',
    'appointments', 'reviews', 'notifications', 'saved_properties'
  )
ORDER BY tablename, indexname;

-- ============================================
-- FIN DU SCRIPT
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Tous les index ont été créés avec succès !';
  RAISE NOTICE '✅ Les tables ont été analysées pour optimisation !';
  RAISE NOTICE '🚀 Performance améliorée pour Lualaba & Haut-Katanga !';
END $$;


