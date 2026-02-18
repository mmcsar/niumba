# ✅ Correction Supabase - Création Automatique des Profils

## 🐛 Problème Détecté

**Warning** : `Profile not found, attempting to create it...`

### Cause
Lorsqu'un utilisateur s'inscrit dans Supabase Auth, un profil n'est pas automatiquement créé dans la table `profiles`. Le code React Native essaie de créer le profil manuellement, mais il serait mieux d'avoir un trigger automatique dans Supabase.

## 🔧 Solution : Trigger Automatique

### Ce qui a été créé

1. **Fonction `handle_new_user()`** :
   - Crée automatiquement un profil dans `profiles` lorsqu'un utilisateur s'inscrit
   - Utilise les métadonnées de l'utilisateur (`raw_user_meta_data`) pour remplir les champs
   - Valeurs par défaut :
     - `role`: `'user'`
     - `is_verified`: basé sur `email_confirmed_at`
     - `is_active`: `true`
     - `language`: `'fr'` (ou depuis les métadonnées)

2. **Trigger `on_auth_user_created`** :
   - S'exécute automatiquement après chaque insertion dans `auth.users`
   - Appelle la fonction `handle_new_user()`

3. **Fonction `handle_user_email_update()`** :
   - Met à jour l'email dans le profil si l'email de l'utilisateur change

4. **Trigger `on_auth_user_email_updated`** :
   - S'exécute automatiquement après chaque mise à jour de l'email dans `auth.users`

## 📋 Instructions d'Installation

### Option 1 : Via l'Éditeur SQL de Supabase (Recommandé)

1. Ouvrez votre projet Supabase
2. Allez dans **SQL Editor**
3. Copiez le contenu de `CREATE_PROFILE_TRIGGER.txt`
4. Collez-le dans l'éditeur SQL
5. Cliquez sur **Run** ou appuyez sur `Ctrl+Enter`

### Option 2 : Via la CLI Supabase

```bash
supabase db execute -f supabase/CREATE_PROFILE_TRIGGER.sql
```

## ✅ Vérification

Après l'exécution du script, vous devriez voir :

1. **2 triggers** créés dans `auth.users` :
   - `on_auth_user_created`
   - `on_auth_user_email_updated`

2. **2 fonctions** créées dans le schéma `public` :
   - `handle_new_user()`
   - `handle_user_email_update()`

## 🎯 Avantages

### Avant (❌)
- Le profil était créé manuellement dans le code React Native
- Risque de race condition
- Code plus complexe côté client
- Warning "Profile not found" à chaque connexion

### Après (✅)
- Le profil est créé automatiquement par Supabase
- Pas de race condition
- Code plus simple côté client
- Pas de warning

## 🔄 Impact sur le Code React Native

Le code dans `AuthContext.tsx` qui crée manuellement le profil peut rester comme **fallback** (sécurité supplémentaire), mais ne sera normalement plus nécessaire.

## 📝 Notes Importantes

1. **Sécurité** : Les fonctions utilisent `SECURITY DEFINER` pour avoir les permissions nécessaires
2. **Idempotent** : Le script utilise `ON CONFLICT DO NOTHING` pour éviter les doublons
3. **Compatibilité** : Compatible avec les utilisateurs existants (ne crée pas de doublons)

## 🚀 Prochaines Étapes

1. ✅ Exécuter le script SQL dans Supabase
2. ✅ Vérifier que les triggers sont créés
3. ✅ Tester en créant un nouvel utilisateur
4. ✅ Vérifier que le profil est créé automatiquement
5. ✅ Le warning "Profile not found" devrait disparaître

---

**Date** : 2026-01-31
**Status** : ✅ PRÊT À DÉPLOYER

