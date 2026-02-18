# ⚠️ URGENT : Activer le RLS

## 🔴 Problème Détecté

Le test montre **0 tables avec RLS activé**. Cela signifie que le RLS n'est pas encore activé sur vos tables.

**C'est un problème de sécurité** - vos données ne sont pas protégées !

---

## ✅ Solution Immédiate

### Étape 1 : Ouvrir Supabase SQL Editor

1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Cliquez sur **SQL Editor** (menu de gauche)

### Étape 2 : Exécuter le script d'activation

1. Cliquez sur **New Query**
2. **Copiez TOUT le contenu** de `supabase/activate_rls_simple.sql`
3. **Collez** dans le SQL Editor
4. Cliquez sur **Run** (ou Ctrl+Enter)

### Étape 3 : Vérifier

Après avoir exécuté le script, testez avec :

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'properties';
```

**Résultat attendu** : `rowsecurity = true`

---

## 📋 Scripts Disponibles

### Option 1 : Version Simple (Recommandée pour commencer)
**Fichier** : `supabase/activate_rls_simple.sql`
- Active RLS sur toutes les tables
- Crée les policies essentielles
- Plus rapide à exécuter

### Option 2 : Version Complète
**Fichier** : `supabase/rls_fixed.sql`
- Active RLS + toutes les policies détaillées
- Plus complet mais plus long

---

## ⚠️ Important

**Si vous ne créez pas les policies après avoir activé RLS**, toutes les tables seront **bloquées** (personne ne pourra y accéder).

C'est pourquoi le script `activate_rls_simple.sql` fait les deux :
1. Active RLS
2. Crée les policies nécessaires

---

## 🧪 Après Activation

Une fois le script exécuté, testez à nouveau :

```sql
SELECT COUNT(*) as tables_avec_rls
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = true
  AND tablename IN ('profiles', 'properties', 'saved_properties', 'inquiries', 'appointments', 'reviews');
```

**Résultat attendu** : Un nombre (6 ou plus)

---

## ✅ Checklist

- [ ] Script `activate_rls_simple.sql` exécuté
- [ ] Message "Success" dans Supabase
- [ ] Test de vérification montre des tables avec RLS
- [ ] Application fonctionne toujours

---

## 🆘 Si vous avez des erreurs

### Erreur : "relation does not exist"
**Cause** : La table n'existe pas encore
**Solution** : Exécutez d'abord `supabase/schema.sql` pour créer les tables

### Erreur : "policy already exists"
**Cause** : Certaines policies existent déjà
**Solution** : C'est normal, le script continue quand même

### Erreur : "permission denied"
**Cause** : Vous n'avez pas les droits
**Solution** : Vérifiez que vous êtes connecté en tant qu'admin du projet

---

## 🎯 Action Immédiate

**Exécutez `supabase/activate_rls_simple.sql` MAINTENANT** pour sécuriser votre base de données ! 🔒



