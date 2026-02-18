-- ============================================
-- SCRIPT DE VÉRIFICATION RLS - NIUMBA
-- Exécutez ce script dans Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. VÉRIFIER QUE RLS EST ACTIVÉ
-- ============================================
SELECT 
  '🔒 RLS Status' as verification_type,
  tablename,
  CASE 
    WHEN rowsecurity THEN '✅ Activé'
    ELSE '❌ DÉSACTIVÉ - À CORRIGER'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'properties', 'saved_properties', 'inquiries',
    'appointments', 'reviews', 'conversations', 'messages',
    'notifications', 'search_alerts', 'agents', 'cities',
    'price_history', 'property_views'
  )
ORDER BY 
  CASE WHEN rowsecurity THEN 0 ELSE 1 END,
  tablename;

-- ============================================
-- 2. COMPTER LES POLICIES PAR TABLE
-- ============================================
SELECT 
  '📋 Policies Count' as verification_type,
  tablename,
  COUNT(*) as policy_count,
  CASE 
    WHEN COUNT(*) = 0 THEN '❌ AUCUNE POLICY - CRITIQUE'
    WHEN COUNT(*) < 3 THEN '⚠️ Peu de policies'
    ELSE '✅ Policies configurées'
  END as status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'properties', 'saved_properties', 'inquiries',
    'appointments', 'reviews', 'conversations', 'messages',
    'notifications', 'search_alerts', 'agents', 'cities',
    'price_history', 'property_views'
  )
GROUP BY tablename
ORDER BY 
  CASE WHEN COUNT(*) = 0 THEN 0 ELSE 1 END,
  tablename;

-- ============================================
-- 3. DÉTAIL DES POLICIES PAR TABLE
-- ============================================
SELECT 
  '📝 Policy Details' as verification_type,
  tablename,
  policyname,
  cmd as operation,
  CASE 
    WHEN cmd = 'SELECT' THEN '📖 Lecture'
    WHEN cmd = 'INSERT' THEN '➕ Insertion'
    WHEN cmd = 'UPDATE' THEN '✏️ Modification'
    WHEN cmd = 'DELETE' THEN '🗑️ Suppression'
    WHEN cmd = 'ALL' THEN '🔓 Tous droits'
    ELSE cmd
  END as operation_fr,
  CASE
    WHEN qual LIKE '%auth.uid()%' THEN '🔐 Authentifié'
    WHEN qual LIKE '%true%' OR qual IS NULL THEN '🌐 Public'
    ELSE '🔒 Conditionnel'
  END as access_type
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'properties', 'saved_properties', 'inquiries',
    'appointments', 'reviews', 'conversations', 'messages',
    'notifications', 'search_alerts', 'agents', 'cities',
    'price_history', 'property_views'
  )
ORDER BY tablename, cmd, policyname;

-- ============================================
-- 4. VÉRIFIER LES POLICIES CRITIQUES
-- ============================================
SELECT 
  '🎯 Critical Policies Check' as verification_type,
  tablename,
  CASE 
    WHEN tablename = 'profiles' THEN 
      CASE 
        WHEN EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND cmd = 'SELECT') 
        AND EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND cmd = 'UPDATE')
        THEN '✅ OK'
        ELSE '❌ Manque SELECT ou UPDATE'
      END
    WHEN tablename = 'properties' THEN 
      CASE 
        WHEN EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'properties' AND cmd = 'SELECT') 
        AND EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'properties' AND cmd = 'INSERT')
        THEN '✅ OK'
        ELSE '❌ Manque SELECT ou INSERT'
      END
    WHEN tablename IN ('saved_properties', 'inquiries', 'appointments', 'conversations', 'messages', 'notifications', 'search_alerts') THEN 
      CASE 
        WHEN EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = tablename AND cmd = 'SELECT')
        AND EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = tablename AND cmd = 'INSERT')
        THEN '✅ OK'
        ELSE '❌ Manque SELECT ou INSERT'
      END
    ELSE '⚠️ Non vérifié'
  END as status
FROM (
  SELECT DISTINCT tablename 
  FROM pg_policies 
  WHERE schemaname = 'public'
  UNION
  SELECT 'profiles' UNION SELECT 'properties' UNION SELECT 'saved_properties'
  UNION SELECT 'inquiries' UNION SELECT 'appointments' UNION SELECT 'reviews'
  UNION SELECT 'conversations' UNION SELECT 'messages' UNION SELECT 'notifications'
  UNION SELECT 'search_alerts' UNION SELECT 'agents' UNION SELECT 'cities'
  UNION SELECT 'price_history' UNION SELECT 'property_views'
) t
WHERE tablename IN (
  'profiles', 'properties', 'saved_properties', 'inquiries',
  'appointments', 'reviews', 'conversations', 'messages',
  'notifications', 'search_alerts', 'agents', 'cities',
  'price_history', 'property_views'
)
ORDER BY tablename;

-- ============================================
-- 5. RÉSUMÉ DES PROBLÈMES
-- ============================================
WITH rls_status AS (
  SELECT 
    tablename,
    rowsecurity as rls_enabled
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename IN (
      'profiles', 'properties', 'saved_properties', 'inquiries',
      'appointments', 'reviews', 'conversations', 'messages',
      'notifications', 'search_alerts', 'agents', 'cities',
      'price_history', 'property_views'
    )
),
policy_count AS (
  SELECT 
    tablename,
    COUNT(*) as count
  FROM pg_policies
  WHERE schemaname = 'public'
  GROUP BY tablename
)
SELECT 
  '📊 Summary' as verification_type,
  COALESCE(r.tablename, p.tablename) as tablename,
  CASE 
    WHEN r.rls_enabled IS NULL THEN '❌ TABLE N''EXISTE PAS'
    WHEN NOT r.rls_enabled THEN '❌ RLS DÉSACTIVÉ'
    WHEN p.count IS NULL OR p.count = 0 THEN '❌ AUCUNE POLICY'
    WHEN p.count < 2 THEN '⚠️ Peu de policies'
    ELSE '✅ OK'
  END as status,
  COALESCE(p.count, 0) as policy_count
FROM rls_status r
FULL OUTER JOIN policy_count p ON r.tablename = p.tablename
ORDER BY 
  CASE 
    WHEN r.rls_enabled IS NULL THEN 0
    WHEN NOT r.rls_enabled THEN 1
    WHEN p.count IS NULL OR p.count = 0 THEN 2
    WHEN p.count < 2 THEN 3
    ELSE 4
  END,
  COALESCE(r.tablename, p.tablename);

-- ============================================
-- 6. INSTRUCTIONS DE CORRECTION
-- ============================================
SELECT 
  '💡 Instructions' as verification_type,
  'Si vous voyez des ❌, exécutez:' as instruction,
  'supabase/rls_with_auth.sql' as solution_file
WHERE EXISTS (
  SELECT 1 FROM pg_tables 
  WHERE schemaname = 'public' 
    AND tablename = 'profiles'
    AND NOT rowsecurity
)
OR EXISTS (
  SELECT 1 FROM pg_policies 
  WHERE schemaname = 'public' 
  GROUP BY tablename 
  HAVING COUNT(*) = 0
);


