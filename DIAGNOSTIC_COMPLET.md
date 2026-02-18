# 🔍 Diagnostic Complet - Problèmes dans l'Application

## Problèmes Potentiels Identifiés

### 1. ✅ Supabase Configuration
- **Status** : Configuré
- **URL** : `https://mbenioxoabiusjdqzhtk.supabase.co`
- **Vérification** : ✅ Clés API présentes

### 2. ⚠️ Storage Bucket
- **Problème** : Bucket `property-images` peut ne pas exister
- **Solution** : Exécuter `CREER_BUCKET_STORAGE.sql`

### 3. ⚠️ RLS Policies
- **Status** : Vérifié (14 tables avec RLS activé)
- **Vérification** : ✅ Policies créées

### 4. ⚠️ Permissions Storage
- **Problème** : Policies Storage peuvent manquer
- **Solution** : Vérifier dans Supabase Dashboard > Storage > Policies

### 5. ⚠️ Hooks et Services
- **Problème** : Certains hooks peuvent retourner des erreurs
- **Vérification nécessaire** : Tous les hooks doivent être testés

## Script de Vérification SQL

Exécutez ce script dans Supabase SQL Editor pour vérifier tous les problèmes :

```sql
-- ============================================
-- NIUMBA - Diagnostic Complet
-- ============================================

-- 1. Vérifier les tables et RLS
SELECT 
  'Tables & RLS' as verification,
  tablename,
  CASE WHEN rowsecurity THEN '✅ RLS Activé' ELSE '❌ RLS Désactivé' END as rls_status,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = pg_tables.tablename) as nb_policies
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'properties', 'saved_properties', 'inquiries',
    'appointments', 'reviews', 'conversations', 'messages',
    'notifications', 'search_alerts', 'agents', 'cities',
    'price_history', 'property_views'
  )
ORDER BY tablename;

-- 2. Vérifier le bucket Storage
SELECT 
  'Storage Bucket' as verification,
  id,
  name,
  public,
  CASE WHEN public THEN '✅ Public' ELSE '❌ Privé' END as status
FROM storage.buckets
WHERE id = 'property-images';

-- 3. Vérifier les policies Storage
SELECT 
  'Storage Policies' as verification,
  policyname,
  cmd as operation,
  roles
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%property-images%'
ORDER BY policyname;

-- 4. Vérifier les données d'exemple
SELECT 
  'Données Exemple' as verification,
  'properties' as table_name,
  COUNT(*) as count
FROM properties
UNION ALL
SELECT 
  'Données Exemple',
  'profiles',
  COUNT(*)
FROM profiles
UNION ALL
SELECT 
  'Données Exemple',
  'cities',
  COUNT(*)
FROM cities;

-- 5. Vérifier les extensions
SELECT 
  'Extensions' as verification,
  extname as extension_name,
  CASE WHEN extname IN ('uuid-ossp', 'postgis') THEN '✅ Installée' ELSE '⚠️ Manquante' END as status
FROM pg_extension
WHERE extname IN ('uuid-ossp', 'postgis');
```

## Problèmes Courants et Solutions

### Problème : Erreur "Cannot read property of undefined"
**Cause** : Données manquantes ou hooks qui retournent undefined
**Solution** : Vérifier que les hooks gèrent les cas où les données sont vides

### Problème : Erreur "Network request failed"
**Cause** : Problème de connexion ou Supabase non accessible
**Solution** : Vérifier la connexion internet et les clés API

### Problème : Erreur "PGRST116" (0 rows)
**Cause** : Profil manquant après création de compte
**Solution** : Vérifier que le trigger crée automatiquement le profil

### Problème : Images ne s'affichent pas
**Cause** : Bucket Storage non créé ou permissions incorrectes
**Solution** : Exécuter `CREER_BUCKET_STORAGE.sql`

### Problème : Navigation ne fonctionne pas
**Cause** : Problème de configuration React Navigation
**Solution** : Vérifier `src/navigation/index.tsx`

## Checklist de Vérification

- [ ] Supabase configuré avec les bonnes clés
- [ ] RLS activé sur toutes les tables
- [ ] Policies créées pour toutes les tables
- [ ] Bucket Storage `property-images` créé
- [ ] Policies Storage configurées
- [ ] Données d'exemple présentes (propriétés, villes)
- [ ] Extensions PostgreSQL installées
- [ ] Hooks gèrent les cas d'erreur
- [ ] Navigation fonctionne correctement
- [ ] Permissions demandées (caméra, galerie, localisation)

## Prochaines Étapes

1. Exécuter le script de diagnostic SQL ci-dessus
2. Identifier les problèmes spécifiques
3. Corriger chaque problème un par un
4. Tester chaque fonctionnalité après correction


