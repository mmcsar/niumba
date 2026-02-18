# 🔒 Vérification RLS (Row Level Security) - Niumba

## 📊 État Actuel

### ✅ Configuration RLS
- **Fichiers SQL disponibles** : ✅ Plusieurs fichiers de configuration RLS existent
- **Policies définies** : ✅ Policies complètes dans `rls_with_auth.sql`
- **Activation dans Supabase** : ⚠️ **À VÉRIFIER**

### ⚠️ Points à Vérifier

1. **RLS est-il activé dans Supabase ?**
   - Les fichiers SQL existent mais doivent être exécutés dans Supabase
   - Utilisez le script `supabase/VERIFIER_RLS.sql` pour vérifier

2. **Les services utilisent-ils l'authentification ?**
   - Les services utilisent `supabase.from()` qui respecte automatiquement le RLS
   - ✅ Configuration correcte dans `src/lib/supabase.ts`

## 🔍 Comment Vérifier

### Étape 1 : Vérifier dans Supabase Dashboard

1. Allez dans **Supabase Dashboard** → **SQL Editor**
2. Exécutez le script `supabase/VERIFIER_RLS.sql`
3. Vérifiez les résultats :
   - ✅ Toutes les tables doivent avoir RLS activé
   - ✅ Chaque table doit avoir au moins 2-3 policies

### Étape 2 : Vérification Rapide

Exécutez ce script simple dans SQL Editor :

```sql
-- Vérification rapide
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN '✅' ELSE '❌' END as rls,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = t.tablename) as policies
FROM pg_tables t
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'properties', 'saved_properties', 'inquiries', 'appointments', 'reviews')
ORDER BY tablename;
```

### Étape 3 : Tester l'Accès

#### Test 1 : Accès Public (doit fonctionner)
```sql
-- Doit retourner des résultats même sans authentification
SELECT id, title, status FROM properties WHERE status = 'active' LIMIT 5;
```

#### Test 2 : Accès Privé (doit échouer sans auth)
```sql
-- Doit échouer avec "permission denied" si RLS fonctionne
SELECT * FROM saved_properties;
SELECT * FROM inquiries;
SELECT * FROM conversations;
```

## 🛠️ Si RLS n'est pas Activé

### Solution : Exécuter le Script RLS

1. Allez dans **Supabase Dashboard** → **SQL Editor**
2. Copiez le contenu de `supabase/rls_with_auth.sql`
3. Exécutez le script
4. Vérifiez avec `supabase/VERIFIER_RLS.sql`

### Fichiers RLS Disponibles

- **`supabase/rls_with_auth.sql`** ⭐ **RECOMMANDÉ**
  - Configuration complète avec authentification
  - Toutes les tables protégées
  - Policies détaillées

- **`supabase/test_rls_quick.sql`**
  - Test rapide en 30 secondes

- **`supabase/VERIFIER_RLS.sql`** ⭐ **NOUVEAU**
  - Script de vérification complète
  - Détecte les problèmes
  - Donne des recommandations

## 📋 Tables Protégées par RLS

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

## 🔐 Comment le RLS Fonctionne

### Dans l'Application

1. **Authentification** : L'utilisateur se connecte via `supabase.auth.signIn()`
2. **Session** : Supabase stocke la session dans AsyncStorage
3. **Requêtes** : Toutes les requêtes via `supabase.from()` incluent automatiquement `auth.uid()`
4. **RLS** : Les policies vérifient `auth.uid()` pour autoriser/refuser l'accès

### Exemple de Policy

```sql
-- Les utilisateurs ne peuvent voir que leurs propres favoris
CREATE POLICY "saved_select_authenticated" ON saved_properties
  FOR SELECT USING (
    auth.uid() IS NOT NULL 
    AND auth.uid() = user_id
  );
```

Cette policy signifie :
- ✅ L'utilisateur doit être authentifié (`auth.uid() IS NOT NULL`)
- ✅ L'utilisateur ne peut voir que ses propres favoris (`auth.uid() = user_id`)

## ⚠️ Problèmes Courants

### Problème 1 : "permission denied for table"
**Cause** : RLS activé mais aucune policy ne permet l'accès

**Solution** : 
```sql
-- Exécutez dans Supabase SQL Editor
\i supabase/rls_with_auth.sql
```

### Problème 2 : Les utilisateurs non authentifiés ne peuvent rien voir
**Cause** : Policies trop restrictives

**Solution** : Vérifiez que les policies `*_select_public` existent pour :
- `properties` (status = 'active')
- `profiles` (lecture publique)
- `reviews` (lecture publique)
- `agents` (is_active = true)

### Problème 3 : Les utilisateurs authentifiés ne peuvent pas créer de données
**Cause** : Policies INSERT manquantes ou incorrectes

**Solution** : Vérifiez que les policies `*_insert_authenticated` existent et utilisent `auth.uid()`

## ✅ Checklist de Vérification

- [ ] RLS activé sur toutes les tables importantes
- [ ] Policies créées pour toutes les tables
- [ ] Accès public configuré pour : properties (actives), reviews, agents (actifs)
- [ ] Accès authentifié configuré pour : saved_properties, inquiries, appointments, etc.
- [ ] Policies admin configurées pour les tables sensibles
- [ ] Test d'accès public réussi
- [ ] Test d'accès authentifié réussi
- [ ] Test d'accès non authentifié échoue correctement

## 🎯 Résumé

**Configuration Code** : ✅ Les fichiers RLS sont prêts
**Activation Supabase** : ⚠️ **À VÉRIFIER** (exécutez `supabase/VERIFIER_RLS.sql`)
**Services** : ✅ Utilisent correctement Supabase avec RLS automatique

### Prochaines Étapes

1. ✅ Exécutez `supabase/VERIFIER_RLS.sql` dans Supabase
2. ✅ Si des ❌ apparaissent, exécutez `supabase/rls_with_auth.sql`
3. ✅ Testez l'accès avec et sans authentification
4. ✅ Vérifiez que les utilisateurs ne peuvent accéder qu'à leurs propres données

Une fois ces étapes complétées, votre base de données sera sécurisée avec le RLS ! 🔒


