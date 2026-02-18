# ✅ Guide de Vérification du RLS

## 🚀 Vérification Rapide

### Étape 1 : Exécuter le script de vérification

1. Allez dans **Supabase Dashboard** → **SQL Editor**
2. Cliquez sur **New Query**
3. Copiez-collez le contenu de `supabase/verify_rls_complete.sql`
4. Cliquez sur **Run**

### Étape 2 : Interpréter les résultats

Le script affiche 8 sections :

#### ✅ Section 1 : RLS Status
- **✅ Activé** = RLS est activé sur cette table
- **❌ DÉSACTIVÉ** = RLS n'est pas activé (problème de sécurité!)

#### ✅ Section 2 : Policies Count
- **✅ Policies OK** = Table a suffisamment de policies
- **⚠️ Policies incomplètes** = Manque des policies
- **❌ Aucune policy** = Problème critique!

#### ✅ Section 3 : Existing Policies
- Liste toutes les policies existantes avec leur type d'opération

#### ⚠️ Section 4 : Tables sans RLS
- Si cette section affiche des tables, **c'est un problème de sécurité**
- Ces tables sont accessibles sans restriction

#### ⚠️ Section 5 : Tables sans Policies
- Si cette section affiche des tables, **RLS est activé mais bloque tout**
- Il faut créer des policies pour ces tables

#### 📊 Section 6 : Résumé Global
- **✅ RLS correctement configuré** = Tout est bon!
- **⚠️ Policies incomplètes** = Il manque des policies
- **❌ RLS non activé** = Problème de sécurité

#### 🔍 Section 7 : Détail des Policies
- Montre quelles opérations (SELECT, INSERT, UPDATE, DELETE) sont autorisées par table

#### 🧪 Section 8 : Test Rapide
- Test spécifique sur la table `properties`

---

## ✅ Résultat Attendu

### Si tout est correct, vous devriez voir :

1. **Section 1** : Toutes les tables avec "✅ Activé"
2. **Section 2** : Toutes les tables avec "✅ Policies OK"
3. **Section 4** : Aucune table (vide)
4. **Section 5** : Aucune table (vide)
5. **Section 6** : "✅ RLS correctement configuré"

---

## 🆘 Si vous voyez des problèmes

### Problème 1 : "❌ DÉSACTIVÉ" dans Section 1

**Solution** : Exécutez `supabase/rls_fixed.sql` pour activer RLS

### Problème 2 : "❌ Aucune policy" dans Section 2

**Solution** : Exécutez `supabase/rls_fixed.sql` pour créer les policies

### Problème 3 : Tables listées dans Section 4 ou 5

**Solution** : Exécutez `supabase/rls_fixed.sql` pour corriger

---

## 🧪 Test Manuel Rapide

Vous pouvez aussi tester manuellement avec ces requêtes :

### Test 1 : Vérifier RLS sur properties
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'properties';
```
**Résultat attendu** : `rowsecurity = true`

### Test 2 : Compter les policies
```sql
SELECT COUNT(*) 
FROM pg_policies 
WHERE schemaname = 'public';
```
**Résultat attendu** : Au moins 30+ policies

### Test 3 : Vérifier une policy spécifique
```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'properties';
```
**Résultat attendu** : Plusieurs policies (SELECT, INSERT, UPDATE, DELETE)

---

## 📋 Checklist de Vérification

- [ ] RLS activé sur toutes les tables importantes
- [ ] Au moins 2-3 policies par table
- [ ] Section 4 (tables sans RLS) est vide
- [ ] Section 5 (tables sans policies) est vide
- [ ] Résumé global indique "✅ RLS correctement configuré"
- [ ] Test rapide sur `properties` réussit

---

## ✅ Une fois vérifié

Si tout est vert ✅, votre RLS est correctement configuré et votre base de données est sécurisée ! 🔒



