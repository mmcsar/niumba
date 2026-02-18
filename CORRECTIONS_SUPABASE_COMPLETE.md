# ✅ Corrections Supabase - Guide Complet

## 📋 Résumé des Corrections

Deux scripts SQL ont été créés pour corriger les problèmes de configuration Supabase :

1. **Création automatique des profils** (Trigger)
2. **Politiques RLS pour les profils** (Sécurité)

## 🔧 Script 1 : Création Automatique des Profils

### Fichier : `CREATE_PROFILE_TRIGGER.txt`

**Problème** : Le warning `Profile not found, attempting to create it...` apparaissait car les profils n'étaient pas créés automatiquement lors de l'inscription.

**Solution** : 
- ✅ Trigger automatique qui crée un profil dans `profiles` quand un utilisateur s'inscrit
- ✅ Mise à jour automatique de l'email si l'utilisateur change son email

**Instructions** :
1. Ouvrir Supabase → SQL Editor
2. Copier le contenu de `CREATE_PROFILE_TRIGGER.txt`
3. Exécuter le script

## 🔒 Script 2 : Politiques RLS pour Profiles

### Fichier : `FIX_PROFILES_RLS.txt`

**Problème** : Les politiques RLS (Row Level Security) pour la table `profiles` peuvent être incomplètes ou incorrectes.

**Solution** :
- ✅ Activation de RLS sur la table `profiles`
- ✅ Politiques pour SELECT (lecture)
- ✅ Politiques pour INSERT (création)
- ✅ Politiques pour UPDATE (modification)
- ✅ Politiques pour DELETE (suppression)
- ✅ Permissions spéciales pour les admins

**Instructions** :
1. Ouvrir Supabase → SQL Editor
2. Copier le contenu de `FIX_PROFILES_RLS.txt`
3. Exécuter le script

## 📝 Ordre d'Exécution Recommandé

### Étape 1 : Créer le Trigger (OBLIGATOIRE)
```sql
-- Exécuter CREATE_PROFILE_TRIGGER.txt
```
**Pourquoi** : Cela garantit que tous les nouveaux utilisateurs auront automatiquement un profil.

### Étape 2 : Corriger les Politiques RLS (RECOMMANDÉ)
```sql
-- Exécuter FIX_PROFILES_RLS.txt
```
**Pourquoi** : Cela garantit que les utilisateurs peuvent lire et modifier leur propre profil, et que les admins ont les permissions nécessaires.

## ✅ Vérification Après Installation

### Vérifier le Trigger
```sql
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'auth'
  AND event_object_table = 'users';
```

**Résultat attendu** :
- `on_auth_user_created`
- `on_auth_user_email_updated`

### Vérifier les Fonctions
```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%user%';
```

**Résultat attendu** :
- `handle_new_user`
- `handle_user_email_update`

### Vérifier les Politiques RLS
```sql
SELECT policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'profiles';
```

**Résultat attendu** :
- `Users can view profiles` (SELECT)
- `Public can view active profiles` (SELECT)
- `Users can insert their own profile` (INSERT)
- `Users can update their own profile` (UPDATE)
- `Admins can update all profiles` (UPDATE)
- `Admins can delete profiles` (DELETE)

## 🎯 Avantages

### Avant (❌)
- ⚠️ Warning "Profile not found" à chaque connexion
- ⚠️ Création manuelle du profil dans le code React Native
- ⚠️ Risque de race condition
- ⚠️ Politiques RLS potentiellement incomplètes

### Après (✅)
- ✅ Profil créé automatiquement lors de l'inscription
- ✅ Pas de warning
- ✅ Code plus simple côté client
- ✅ Politiques RLS complètes et sécurisées
- ✅ Permissions correctes pour admins et utilisateurs

## 🚀 Impact sur l'Application

### Code React Native
Le code dans `AuthContext.tsx` qui crée manuellement le profil peut rester comme **fallback** (sécurité supplémentaire), mais ne sera normalement plus nécessaire.

### Utilisateurs Existants
Les utilisateurs existants qui n'ont pas de profil peuvent toujours utiliser le fallback dans le code React Native, ou vous pouvez créer leurs profils manuellement :

```sql
-- Créer les profils manquants pour les utilisateurs existants
INSERT INTO public.profiles (id, email, full_name, role, is_verified, is_active, language)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', email, 'User'),
  COALESCE(raw_user_meta_data->>'role', 'user')::user_role,
  email_confirmed_at IS NOT NULL,
  true,
  COALESCE(raw_user_meta_data->>'language', 'fr')
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;
```

## 📋 Checklist de Déploiement

- [ ] Exécuter `CREATE_PROFILE_TRIGGER.txt` dans Supabase
- [ ] Vérifier que les triggers sont créés
- [ ] Exécuter `FIX_PROFILES_RLS.txt` dans Supabase
- [ ] Vérifier que les politiques RLS sont créées
- [ ] Tester en créant un nouvel utilisateur
- [ ] Vérifier que le profil est créé automatiquement
- [ ] Vérifier que le warning "Profile not found" a disparu
- [ ] Tester la mise à jour du profil
- [ ] Tester les permissions admin

---

**Date** : 2026-01-31
**Status** : ✅ PRÊT À DÉPLOYER

