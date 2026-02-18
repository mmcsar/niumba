# 🔒 Vérification RLS (Row Level Security) - Niumba

## ✅ Statut de la configuration RLS

Le RLS est **configuré** dans les fichiers SQL, mais doit être **activé dans Supabase**.

---

## 📋 Fichiers RLS disponibles

1. **`supabase/rls_with_auth.sql`** ⭐ **RECOMMANDÉ**
   - Configuration complète avec authentification requise
   - Toutes les tables protégées
   - Policies détaillées pour chaque fonctionnalité

2. **`supabase/setup_part4_data_rls.sql`**
   - Version simplifiée
   - Bon pour les tests initiaux

---

## 🔧 Comment activer le RLS dans Supabase

### Option 1 : Via SQL Editor (Recommandé)

1. Allez dans **Supabase Dashboard** → **SQL Editor**
2. Cliquez sur **New Query**
3. Copiez et collez le contenu de `supabase/rls_with_auth.sql`
4. Cliquez sur **Run** (ou Ctrl+Enter)

### Option 2 : Via l'interface Supabase

1. Allez dans **Database** → **Tables**
2. Pour chaque table, cliquez dessus
3. Allez dans l'onglet **Policies**
4. Activez **Row Level Security** si ce n'est pas déjà fait

---

## ✅ Vérification que le RLS est activé

### 1. Vérifier via SQL Editor

Exécutez cette requête dans le SQL Editor :

```sql
-- Vérifier si RLS est activé sur toutes les tables
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Résultat attendu** : `rls_enabled` doit être `true` pour toutes les tables importantes.

### 2. Vérifier les policies existantes

```sql
-- Voir toutes les policies RLS
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
ORDER BY tablename, policyname;
```

**Résultat attendu** : Vous devriez voir des policies pour :
- `profiles`
- `properties`
- `saved_properties`
- `inquiries`
- `appointments`
- `reviews`
- `conversations`
- `messages`
- `notifications`
- `search_alerts`
- `agents`
- `cities`
- `price_history`
- `property_views`

---

## 🎯 Tables avec RLS activé (selon rls_with_auth.sql)

| Table | RLS Activé | Accès Public | Accès Authentifié |
|-------|-----------|--------------|-------------------|
| `profiles` | ✅ | Lecture | Modification (propre profil) |
| `properties` | ✅ | Lecture (actives) | Création/Modification (owner/agent) |
| `saved_properties` | ✅ | ❌ | Toutes opérations |
| `inquiries` | ✅ | ❌ | Toutes opérations |
| `appointments` | ✅ | ❌ | Toutes opérations |
| `reviews` | ✅ | Lecture | Création/Modification (propre avis) |
| `conversations` | ✅ | ❌ | Toutes opérations |
| `messages` | ✅ | ❌ | Toutes opérations |
| `notifications` | ✅ | ❌ | Toutes opérations |
| `search_alerts` | ✅ | ❌ | Toutes opérations |
| `agents` | ✅ | Lecture (actifs) | Création/Modification (propre profil) |
| `cities` | ✅ | Lecture | Modification (admin uniquement) |
| `price_history` | ✅ | Lecture | - |
| `property_views` | ✅ | Insertion | Lecture (owner/admin) |

---

## 🚨 Problèmes courants

### Problème 1 : "permission denied for table"
**Cause** : RLS activé mais aucune policy ne permet l'accès

**Solution** : Exécutez `supabase/rls_with_auth.sql` pour créer les policies

### Problème 2 : Les utilisateurs non authentifiés ne peuvent rien voir
**Cause** : Policies trop restrictives

**Solution** : Vérifiez que les policies `*_select_public` existent pour les tables publiques

### Problème 3 : Les utilisateurs authentifiés ne peuvent pas créer de données
**Cause** : Policies INSERT manquantes ou incorrectes

**Solution** : Vérifiez que les policies `*_insert_authenticated` existent

---

## 🔍 Test rapide du RLS

### Test 1 : Vérifier l'accès public aux propriétés

```sql
-- Doit fonctionner même sans authentification
SELECT id, title, status FROM properties WHERE status = 'active' LIMIT 5;
```

### Test 2 : Vérifier l'accès authentifié aux favoris

```sql
-- Doit échouer sans authentification
SELECT * FROM saved_properties;
-- Erreur attendue: "permission denied for table saved_properties"
```

### Test 3 : Vérifier l'accès aux conversations

```sql
-- Doit échouer sans authentification
SELECT * FROM conversations;
-- Erreur attendue: "permission denied for table conversations"
```

---

## 📝 Checklist de vérification

- [ ] RLS activé sur toutes les tables importantes
- [ ] Policies créées pour toutes les tables
- [ ] Accès public configuré pour : properties (actives), reviews, agents (actifs), cities, price_history
- [ ] Accès authentifié configuré pour : saved_properties, inquiries, appointments, conversations, messages, notifications, search_alerts
- [ ] Policies admin configurées pour les tables sensibles
- [ ] Test d'accès public réussi
- [ ] Test d'accès authentifié réussi
- [ ] Test d'accès non authentifié échoue correctement

---

## 🛠️ Script de vérification complète

Exécutez ce script dans le SQL Editor pour vérifier tout :

```sql
-- ============================================
-- VÉRIFICATION COMPLÈTE DU RLS
-- ============================================

-- 1. Vérifier RLS activé
SELECT 
  'RLS Status' as check_type,
  tablename,
  CASE 
    WHEN rowsecurity THEN '✅ Activé'
    ELSE '❌ Désactivé'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'properties', 'saved_properties', 'inquiries',
    'appointments', 'reviews', 'conversations', 'messages',
    'notifications', 'search_alerts', 'agents', 'cities',
    'price_history', 'property_views'
  )
ORDER BY tablename;

-- 2. Compter les policies par table
SELECT 
  'Policies Count' as check_type,
  tablename,
  COUNT(*) as policy_count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Policies existantes'
    ELSE '❌ Aucune policy'
  END as status
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- 3. Vérifier les types de policies
SELECT 
  'Policy Types' as check_type,
  tablename,
  cmd as operation,
  COUNT(*) as count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename, cmd
ORDER BY tablename, cmd;
```

---

## ✅ Résumé

**Le RLS est configuré dans les fichiers SQL**, mais vous devez :

1. ✅ Exécuter `supabase/rls_with_auth.sql` dans Supabase SQL Editor
2. ✅ Vérifier que RLS est activé sur toutes les tables
3. ✅ Tester l'accès avec et sans authentification

Une fois fait, votre base de données sera sécurisée avec le RLS ! 🔒



