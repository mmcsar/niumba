# 🎯 Guide : Tester le Dashboard Admin

## 📋 Étapes pour Créer un Compte Admin

### Méthode 1 : Via Supabase Dashboard (Recommandé)

#### Étape 1 : Créer l'utilisateur dans Supabase Auth

1. **Ouvrez Supabase Dashboard**
   - Allez dans votre projet Niumba
   - Cliquez sur **"Authentication"** dans le menu de gauche
   - Cliquez sur **"Users"**

2. **Créer un nouvel utilisateur**
   - Cliquez sur **"Add User"** (ou "Invite User")
   - Remplissez :
     - **Email** : `admin@niumba.com`
     - **Password** : `Admin123!@#`
     - **Auto Confirm User** : ✅ Cochez cette case
   - Cliquez sur **"Create User"**

3. **Copier l'ID de l'utilisateur**
   - Une fois créé, copiez l'**User ID** (UUID)
   - Vous en aurez besoin pour l'étape suivante

#### Étape 2 : Promouvoir en Admin via SQL

1. **Ouvrez SQL Editor** dans Supabase
2. **Exécutez ce script** (remplacez `VOTRE_USER_ID_ICI` par l'ID copié) :

```sql
-- Mettre à jour le profil pour être admin
UPDATE profiles
SET 
  role = 'admin',
  full_name = 'Administrateur Niumba',
  is_verified = true,
  is_active = true
WHERE id = 'VOTRE_USER_ID_ICI';

-- OU créer le profil s'il n'existe pas
INSERT INTO profiles (
  id,
  email,
  full_name,
  role,
  is_verified,
  is_active,
  language
)
VALUES (
  'VOTRE_USER_ID_ICI',  -- Remplacez par l'ID de l'utilisateur Auth
  'admin@niumba.com',
  'Administrateur Niumba',
  'admin',
  true,
  true,
  'fr'
)
ON CONFLICT (id) DO UPDATE
SET 
  role = 'admin',
  is_verified = true,
  is_active = true;
```

3. **Vérifier** que l'admin a été créé :

```sql
SELECT 
  id,
  email,
  full_name,
  role,
  is_verified,
  is_active
FROM profiles
WHERE role = 'admin';
```

---

### Méthode 2 : Via l'Application (Si vous avez déjà un compte)

1. **Connectez-vous** à l'application avec votre compte
2. **Exécutez ce script SQL** pour promouvoir votre compte en admin :

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'votre-email@example.com';
```

---

## 🔐 Informations de Connexion par Défaut

**Email** : `admin@niumba.com`  
**Password** : `Admin123!@#`

⚠️ **IMPORTANT** : Changez le mot de passe après la première connexion !

---

## ✅ Tester le Dashboard

1. **Ouvrez l'application** Niumba
2. **Connectez-vous** avec :
   - Email : `admin@niumba.com`
   - Password : `Admin123!@#`
3. **Accédez au Dashboard Admin**
   - Le dashboard devrait être accessible
   - Vous devriez voir toutes les statistiques
   - Vous pouvez gérer les agents, utilisateurs, etc.

---

## 🔍 Vérification

Si le dashboard ne s'affiche pas :

1. **Vérifiez le rôle** dans Supabase :
   ```sql
   SELECT email, role FROM profiles WHERE email = 'admin@niumba.com';
   ```
   - Le rôle doit être `'admin'`

2. **Vérifiez la connexion** :
   - Déconnectez-vous et reconnectez-vous
   - Le profil doit être rechargé

3. **Vérifiez les logs** :
   - Regardez la console pour voir les erreurs
   - Vérifiez que `isAdmin` retourne `true`

---

## 🎯 Fonctionnalités du Dashboard

Une fois connecté en admin, vous pouvez :

- ✅ Voir les statistiques (propriétés, utilisateurs, agents)
- ✅ Gérer les agents (créer, modifier, supprimer)
- ✅ Gérer les utilisateurs
- ✅ Gérer les rendez-vous
- ✅ Gérer les demandes
- ✅ Voir toutes les propriétés

---

**➡️ Suivez la Méthode 1 pour créer votre compte admin !**


