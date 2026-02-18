# 🚀 Instructions pour Activer le RLS

## 📋 Étapes Simples

### Étape 1 : Ouvrir Supabase Dashboard
1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Connectez-vous à votre compte
3. Sélectionnez votre projet **Niumba**

### Étape 2 : Ouvrir SQL Editor
1. Dans le menu de gauche, cliquez sur **SQL Editor**
2. Cliquez sur **New Query** (ou utilisez le raccourci `Ctrl+N`)

### Étape 3 : Copier le Script
1. Ouvrez le fichier `supabase/ACTIVER_RLS_MAINTENANT.sql` dans votre éditeur
2. **Sélectionnez tout** le contenu (Ctrl+A)
3. **Copiez** le contenu (Ctrl+C)

### Étape 4 : Exécuter le Script
1. Dans Supabase SQL Editor, **collez** le script (Ctrl+V)
2. Cliquez sur **Run** (ou appuyez sur `Ctrl+Enter`)
3. Attendez que le script s'exécute (quelques secondes)

### Étape 5 : Vérifier
1. Vous devriez voir un message de confirmation en bas
2. Si vous voyez des erreurs, notez-les et contactez-moi
3. Pour vérifier, exécutez `supabase/VERIFIER_RLS.sql`

## ✅ Résultat Attendu

Après l'exécution, vous devriez voir :
- ✅ RLS activé sur toutes les tables
- ✅ Toutes les policies créées
- ✅ Aucune erreur

## 🔍 Vérification Rapide

Exécutez ce script pour vérifier :

```sql
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN '✅' ELSE '❌' END as rls,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = t.tablename) as policies
FROM pg_tables t
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'properties', 'saved_properties', 'inquiries', 'appointments', 'reviews')
ORDER BY tablename;
```

**Résultat attendu** : Toutes les tables doivent avoir `✅` et au moins 2-3 policies.

## ⚠️ En Cas d'Erreur

### Erreur : "relation does not exist"
**Cause** : Une table n'existe pas encore dans votre base de données

**Solution** : C'est normal, le script utilise `IF EXISTS` donc il ignore les tables manquantes

### Erreur : "permission denied"
**Cause** : Vous n'avez pas les droits nécessaires

**Solution** : Assurez-vous d'être connecté avec un compte administrateur du projet

### Erreur : "policy already exists"
**Cause** : Les policies existent déjà

**Solution** : C'est normal, le script supprime d'abord les anciennes policies avant de créer les nouvelles

## 🎯 Après l'Activation

Une fois le RLS activé :
1. ✅ Les utilisateurs non authentifiés ne peuvent plus accéder aux données privées
2. ✅ Chaque utilisateur ne voit que ses propres données
3. ✅ Les admins ont accès à tout
4. ✅ Les propriétés actives restent visibles publiquement

## 📞 Besoin d'Aide ?

Si vous rencontrez des problèmes :
1. Copiez le message d'erreur complet
2. Vérifiez que vous êtes bien connecté à Supabase
3. Vérifiez que vous avez les droits administrateur

---

**Fichier à utiliser** : `supabase/ACTIVER_RLS_MAINTENANT.sql` ⭐


