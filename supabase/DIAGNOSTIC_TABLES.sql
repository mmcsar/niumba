-- ============================================
-- DIAGNOSTIC: Quelles tables existent ?
-- Copiez dans SQL Editor
-- ============================================

SELECT tablename as "Tables existantes"
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;



