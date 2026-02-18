# 🎯 Créer Admin pour kzadichris@gmail.com

## 📋 Étapes Rapides

### Option 1 : Si l'utilisateur existe déjà dans Supabase Auth

1. **Ouvrez Supabase SQL Editor**
2. **Exécutez ce script** :

```sql
-- Promouvoir en admin
UPDATE profiles
SET 
  role = 'admin',
  is_verified = true,
  is_active = true,
  updated_at = NOW()
WHERE email = 'kzadichris@gmail.com';

-- Vérifier
SELECT 
  id,
  email,
  full_name,
  role,
  is_verified,
  is_active
FROM profiles
WHERE email = 'kzadichris@gmail.com';
```

3. **C'est tout !** L'utilisateur est maintenant admin.

---

### Option 2 : Si l'utilisateur n'existe pas encore

#### Étape 1 : Créer l'utilisateur dans Supabase Auth

1. **Ouvrez Supabase Dashboard**
   - Allez dans votre projet Niumba
   - Cliquez sur **"Authentication"** dans le menu de gauche
   - Cliquez sur **"Users"**

2. **Créer un nouvel utilisateur**
   - Cliquez sur **"Add User"**
   - Remplissez :
     - **Email** : `kzadichris@gmail.com`
     - **Password** : (choisissez un mot de passe)
     - **Auto Confirm User** : ✅ **Cochez cette case**
   - Cliquez sur **"Create User"**

3. **Copier l'ID de l'utilisateur**
   - Une fois créé, copiez l'**User ID** (UUID)
   - Exemple : `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

#### Étape 2 : Créer le profil admin

1. **Ouvrez SQL Editor** dans Supabase
2. **Exécutez ce script** (remplacez `'VOTRE_USER_ID_ICI'` par l'ID copié) :

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
  'kzadichris@gmail.com',
  'Admin Kzadichris',
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
WHERE email = 'kzadichris@gmail.com';
```

Vous devriez voir :
- `email` = `'kzadichris@gmail.com'`
- `role` = `'admin'`
- `is_verified` = `true`
- `is_active` = `true`

---

## 🚀 Tester le Dashboard

1. **Ouvrez l'application** Niumba
2. **Connectez-vous** avec :
   - Email : `kzadichris@gmail.com`
   - Password : (celui que vous avez défini dans Supabase Auth)
3. **Accédez au Dashboard Admin**
   - Le dashboard devrait être accessible
   - Vous verrez toutes les statistiques
   - Vous pouvez gérer les agents, utilisateurs, etc.

---

## 📝 Résumé

1. ✅ Si l'utilisateur existe : Exécutez le script UPDATE
2. ✅ Si l'utilisateur n'existe pas : Créez-le dans Auth, puis exécutez le script INSERT
3. ✅ Vérifiez avec le SELECT
4. ✅ Connectez-vous et testez le dashboard

**➡️ Suivez l'Option 1 si l'utilisateur existe déjà, sinon l'Option 2 !**


