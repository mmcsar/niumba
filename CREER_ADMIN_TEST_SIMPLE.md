# 🎯 Créer un Compte Admin de Test - Guide Simple

## 📋 Étapes Rapides (2 minutes)

### Étape 1 : Créer l'utilisateur dans Supabase Auth

1. **Ouvrez Supabase Dashboard**
   - Allez dans votre projet Niumba
   - Cliquez sur **"Authentication"** dans le menu de gauche
   - Cliquez sur **"Users"**

2. **Créer un nouvel utilisateur**
   - Cliquez sur **"Add User"** (ou "Invite User")
   - Remplissez :
     - **Email** : `admin@niumba.com`
     - **Password** : `Admin123!@#`
     - **Auto Confirm User** : ✅ **Cochez cette case** (important !)
   - Cliquez sur **"Create User"**

3. **Copier l'ID de l'utilisateur**
   - Une fois créé, copiez l'**User ID** (UUID)
   - Exemple : `a1b2c3d4-e5f6-7890-abcd-ef1234567890`
   - Vous en aurez besoin pour l'étape suivante

---

### Étape 2 : Promouvoir en Admin via SQL

1. **Ouvrez SQL Editor** dans Supabase
2. **Ouvrez le fichier** : `CREER_ADMIN_TEST.sql`
3. **Remplacez** `'VOTRE_USER_ID_ICI'` par l'ID copié à l'étape 1
4. **Exécutez** le script (Run ou Ctrl+Enter)

**OU** exécutez directement ce script (remplacez l'ID) :

```sql
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
  'VOTRE_USER_ID_ICI',  -- ⚠️ REMPLACEZ PAR L'ID DE L'UTILISATEUR AUTH
  'admin@niumba.com',
  'Admin Test Niumba',
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

---

## 🔐 Informations de Connexion

**Email** : `admin@niumba.com`  
**Password** : `Admin123!@#`

⚠️ **Changez le mot de passe après la première connexion si vous voulez !**

---

## ✅ Vérification

Après avoir exécuté le script, vérifiez que l'admin a été créé :

```sql
SELECT 
  id,
  email,
  full_name,
  role,
  is_verified,
  is_active
FROM profiles
WHERE email = 'admin@niumba.com';
```

Vous devriez voir :
- `role` = `'admin'`
- `is_verified` = `true`
- `is_active` = `true`

---

## 🚀 Tester le Dashboard

1. **Ouvrez l'application** Niumba
2. **Connectez-vous** avec :
   - Email : `admin@niumba.com`
   - Password : `Admin123!@#`
3. **Accédez au Dashboard Admin**
   - Le dashboard devrait être accessible
   - Vous verrez toutes les statistiques
   - Vous pouvez gérer les agents, utilisateurs, etc.

---

## 📝 Résumé

1. ✅ Créer l'utilisateur dans Supabase Auth (`admin@niumba.com` / `Admin123!@#`)
2. ✅ Copier l'ID de l'utilisateur
3. ✅ Exécuter le script SQL pour promouvoir en admin
4. ✅ Se connecter et tester le dashboard

**➡️ Suivez ces étapes et vous aurez votre compte admin de test en 2 minutes !**


