# 🚀 Instructions pour Exécuter le Script dans Supabase

## 📋 Étapes Détaillées

### Étape 1 : Ouvrir Supabase Dashboard
1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Connectez-vous avec votre compte
3. Sélectionnez votre projet **Niumba**

### Étape 2 : Ouvrir SQL Editor
1. Dans le menu de gauche, cliquez sur **SQL Editor**
2. Cliquez sur **New Query** (ou utilisez le raccourci `Ctrl+N`)

### Étape 3 : Ouvrir le Fichier
1. Ouvrez le fichier `supabase/SECURITE_SUPABASE_COMPLETE.sql` dans votre éditeur de code
2. **Sélectionnez tout** le contenu (Ctrl+A)
3. **Copiez** le contenu (Ctrl+C)

### Étape 4 : Coller dans Supabase
1. Dans Supabase SQL Editor, **collez** le script (Ctrl+V)
2. Vérifiez que tout le contenu est bien collé

### Étape 5 : Exécuter
1. Cliquez sur **Run** (ou appuyez sur `Ctrl+Enter`)
2. Attendez quelques secondes que le script s'exécute

### Étape 6 : Vérifier
1. Vous devriez voir un message de confirmation en bas
2. Si vous voyez des erreurs, notez-les et contactez-moi
3. Pour vérifier, exécutez ce script de vérification :

```sql
-- Vérification rapide
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN '✅ RLS Activé' ELSE '❌ RLS Désactivé' END as rls_status,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = t.tablename) as nb_policies
FROM pg_tables t
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'properties', 'saved_properties', 'inquiries', 'appointments', 'reviews')
ORDER BY tablename;
```

---

## ⚠️ En Cas d'Erreur

### Erreur : "relation does not exist"
**Cause** : Une table n'existe pas encore

**Solution** : C'est normal, le script utilise `IF EXISTS` donc il ignore les tables manquantes

### Erreur : "permission denied"
**Cause** : Vous n'avez pas les droits nécessaires

**Solution** : Assurez-vous d'être connecté avec un compte administrateur du projet

### Erreur : "extension already exists"
**Cause** : L'extension est déjà activée

**Solution** : C'est normal, le script utilise `IF NOT EXISTS` donc il ignore les extensions existantes

### Erreur : "policy already exists"
**Cause** : Les policies existent déjà

**Solution** : C'est normal, le script supprime d'abord les anciennes policies avant de créer les nouvelles

---

## ✅ Résultat Attendu

Après exécution réussie, vous devriez voir :
- ✅ Message de confirmation
- ✅ RLS activé sur toutes les tables
- ✅ Policies créées
- ✅ Aucune erreur critique

---

## 📸 Capture d'Écran (Guide Visuel)

1. **SQL Editor** : Menu gauche → SQL Editor
2. **New Query** : Bouton en haut à droite
3. **Coller le script** : Zone de texte principale
4. **Run** : Bouton en bas à droite ou Ctrl+Enter

---

**Temps estimé** : 2-3 minutes
**Difficulté** : Facile ⭐


