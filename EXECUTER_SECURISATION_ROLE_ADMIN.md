# 🚀 Guide Étape par Étape - Exécuter la Sécurisation du Rôle Admin

## 📋 Prérequis

- ✅ Compte Supabase actif
- ✅ Accès au Dashboard Supabase
- ✅ Permissions pour exécuter des scripts SQL

---

## 🎯 Étapes d'Exécution

### Étape 1 : Ouvrir Supabase Dashboard

1. **Allez sur** : https://supabase.com/dashboard
2. **Connectez-vous** avec votre compte
3. **Sélectionnez** votre projet Niumba

### Étape 2 : Accéder au SQL Editor

1. Dans le menu de gauche, cliquez sur **"SQL Editor"**
2. Cliquez sur **"New query"** (Nouvelle requête)

### Étape 3 : Copier le Script

1. **Ouvrez** le fichier `supabase/SECURISER_ROLE_ADMIN.sql`
2. **Sélectionnez tout** le contenu (Ctrl+A)
3. **Copiez** (Ctrl+C)

### Étape 4 : Coller dans Supabase

1. **Collez** le script dans l'éditeur SQL de Supabase (Ctrl+V)
2. **Vérifiez** que tout le script est bien collé

### Étape 5 : Exécuter le Script

1. **Cliquez** sur le bouton **"Run"** (Exécuter) ou appuyez sur **Ctrl+Enter**
2. **Attendez** quelques secondes
3. **Vérifiez** les messages dans la console

### Étape 6 : Vérifier le Résultat

Vous devriez voir des messages comme :
```
✅ Sécurisation du rôle admin terminée !
✅ Vue profiles_public créée
✅ Vue profiles_public_secure créée
✅ Policy RLS sécurisée créée
✅ Fonction get_visible_role créée
🔒 Le rôle admin est maintenant masqué pour les utilisateurs normaux !
```

---

## 🔍 Vérification Post-Installation

### Test 1 : Vérifier que les Vues sont Créées

Exécutez cette requête dans le SQL Editor :

```sql
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'profiles%'
ORDER BY table_name;
```

**Résultat attendu** :
- `profiles` (table)
- `profiles_public` (vue)
- `profiles_public_secure` (vue)

### Test 2 : Vérifier les Policies

Exécutez cette requête :

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as operation
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'profiles'
ORDER BY policyname;
```

**Résultat attendu** :
- `profiles_insert_own`
- `profiles_select_secure` (nouvelle policy)
- `profiles_update_own`

### Test 3 : Tester la Fonction

Exécutez cette requête (remplacez `'admin-id'` par un ID réel) :

```sql
-- Tester avec un rôle admin (devrait retourner 'user' si vous n'êtes pas admin)
SELECT get_visible_role('admin-id', 'admin'::user_role);
```

---

## ⚠️ En Cas d'Erreur

### Erreur : "relation already exists"

Si vous voyez cette erreur, c'est normal. Le script utilise `DROP VIEW IF EXISTS` et `CREATE OR REPLACE`, donc il peut être exécuté plusieurs fois sans problème.

### Erreur : "permission denied"

Si vous voyez cette erreur :
1. Vérifiez que vous êtes connecté avec un compte ayant les permissions
2. Vérifiez que vous êtes dans le bon projet Supabase
3. Essayez d'exécuter le script section par section

### Erreur : "function already exists"

C'est normal. Le script utilise `CREATE OR REPLACE FUNCTION`, donc il peut être exécuté plusieurs fois.

---

## ✅ Après l'Exécution

Une fois le script exécuté avec succès :

1. ✅ **Les vues sont créées** : `profiles_public_secure`
2. ✅ **La fonction est créée** : `get_visible_role()`
3. ✅ **La policy est mise à jour** : `profiles_select_secure`
4. ✅ **Le rôle admin est masqué** : Pour les utilisateurs normaux

---

## 🧪 Test dans l'Application

Après avoir exécuté le script, testez dans votre application :

### Test 1 : Utilisateur Normal

1. Connectez-vous avec un compte **non-admin**
2. Essayez de voir un profil admin
3. **Résultat attendu** : Le rôle devrait être `'user'` au lieu de `'admin'`

### Test 2 : Admin

1. Connectez-vous avec un compte **admin**
2. Consultez les profils
3. **Résultat attendu** : Tous les rôles devraient être visibles (y compris `'admin'`)

---

## 📞 Support

Si vous rencontrez des problèmes :

1. **Vérifiez les logs** dans Supabase Dashboard → Logs
2. **Vérifiez les erreurs** dans la console SQL
3. **Testez section par section** si nécessaire

---

## 🎉 Félicitations !

Une fois le script exécuté, votre plateforme est **ultra-sécurisée** ! 🔒✅

Le rôle admin est maintenant **complètement masqué** pour les utilisateurs normaux, à la fois côté base de données et côté application.


