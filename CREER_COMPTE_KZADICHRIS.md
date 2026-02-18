# 🔐 Créer le Compte Admin kzadichris@gmail.com

## 📋 Mot de Passe Suggéré

**Email** : `kzadichris@gmail.com`  
**Password** : `Kzadi2024!@#`

⚠️ **Changez le mot de passe après la première connexion si vous voulez !**

---

## 🚀 Étapes Complètes

### Étape 1 : Créer l'utilisateur dans Supabase Auth

1. **Ouvrez Supabase Dashboard**
   - Allez dans votre projet Niumba
   - Cliquez sur **"Authentication"** dans le menu de gauche
   - Cliquez sur **"Users"**

2. **Créer un nouvel utilisateur**
   - Cliquez sur **"Add User"** (ou "Invite User")
   - Remplissez :
     - **Email** : `kzadichris@gmail.com`
     - **Password** : `Kzadi2024!@#`
     - **Auto Confirm User** : ✅ **Cochez cette case** (très important !)
   - Cliquez sur **"Create User"**

3. **Copier l'ID de l'utilisateur**
   - Une fois créé, copiez l'**User ID** (UUID)
   - Exemple : `a1b2c3d4-e5f6-7890-abcd-ef1234567890`
   - Vous en aurez besoin pour l'étape suivante

---

### Étape 2 : Créer le profil admin via SQL

1. **Ouvrez SQL Editor** dans Supabase
2. **Exécutez ce script** (remplacez `'VOTRE_USER_ID_ICI'` par l'ID copié à l'étape 1) :

```sql
-- Créer le profil admin
INSERT INTO profiles (
  id,
  email,
  full_name,
  role,
  is_verified,
  is_active,
  language,
  created_at,
  updated_at
)
VALUES (
  'VOTRE_USER_ID_ICI',  -- ⚠️ REMPLACEZ PAR L'ID DE L'UTILISATEUR AUTH
  'kzadichris@gmail.com',
  'Admin Kzadichris',
  'admin',
  true,
  true,
  'fr',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET 
  role = 'admin',
  email = 'kzadichris@gmail.com',
  full_name = 'Admin Kzadichris',
  is_verified = true,
  is_active = true,
  updated_at = NOW();
```

---

### Étape 3 : Vérifier que tout est OK

Exécutez ce script pour vérifier :

```sql
SELECT 
  id,
  email,
  full_name,
  role,
  is_verified,
  is_active,
  created_at
FROM profiles
WHERE email = 'kzadichris@gmail.com';
```

Vous devriez voir :
- `email` = `'kzadichris@gmail.com'`
- `role` = `'admin'`
- `is_verified` = `true`
- `is_active` = `true`

---

## ✅ Informations de Connexion

**Email** : `kzadichris@gmail.com`  
**Password** : `Kzadi2024!@#`

---

## 🚀 Tester le Dashboard

1. **Ouvrez l'application** Niumba
2. **Connectez-vous** avec :
   - Email : `kzadichris@gmail.com`
   - Password : `Kzadi2024!@#`
3. **Accédez au Dashboard Admin**
   - Le dashboard devrait être accessible
   - Vous verrez toutes les statistiques
   - Vous pouvez gérer les agents, utilisateurs, etc.

---

## 📝 Résumé Rapide

1. ✅ Créer l'utilisateur dans Supabase Auth (`kzadichris@gmail.com` / `Kzadi2024!@#`)
2. ✅ Copier l'ID de l'utilisateur
3. ✅ Exécuter le script SQL pour créer le profil admin
4. ✅ Vérifier avec le SELECT
5. ✅ Se connecter et tester le dashboard

---

**➡️ Suivez ces 3 étapes et vous aurez votre compte admin en 2 minutes !**


