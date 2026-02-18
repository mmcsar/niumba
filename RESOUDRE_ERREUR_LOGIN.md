# 🔧 Résoudre l'Erreur "Invalid Credentials"

## ❌ Erreur : "Invalid Credentials" ou "Invalid login credentials"

Cette erreur signifie que l'email ou le mot de passe est incorrect.

---

## 🔍 Vérifications à Faire

### 1. Vérifier que l'utilisateur existe dans Supabase Auth

1. **Ouvrez Supabase Dashboard**
   - Allez dans votre projet Niumba
   - Cliquez sur **"Authentication"** → **"Users"**
   - Recherchez : `kzadichris@gmail.com`

2. **Si l'utilisateur n'existe pas** :
   - Créez-le (voir ci-dessous)

3. **Si l'utilisateur existe** :
   - Vérifiez que l'email est correct
   - Vérifiez que l'utilisateur est **confirmé** (colonne "Confirmed")

---

## 🚀 Solution : Créer/Réinitialiser le Compte

### Option 1 : Créer l'utilisateur (s'il n'existe pas)

1. **Supabase Dashboard** → **Authentication** → **Users**
2. Cliquez sur **"Add User"**
3. Remplissez :
   - **Email** : `kzadichris@gmail.com`
   - **Password** : `Kzadi2024!@#`
   - **Auto Confirm User** : ✅ **Cochez cette case** (très important !)
4. Cliquez sur **"Create User"**
5. **Copiez l'User ID** (UUID)

6. **Exécutez ce script SQL** (remplacez l'ID) :

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
  'VOTRE_USER_ID_ICI',  -- ⚠️ REMPLACEZ PAR L'ID
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

### Option 2 : Réinitialiser le mot de passe (si l'utilisateur existe)

1. **Supabase Dashboard** → **Authentication** → **Users**
2. Recherchez : `kzadichris@gmail.com`
3. Cliquez sur l'utilisateur
4. Cliquez sur **"Update Password"** ou **"Reset Password"**
5. Entrez le nouveau mot de passe : `Kzadi2024!@#`
6. Cliquez sur **"Save"**

---

### Option 3 : Vérifier que l'utilisateur est confirmé

1. **Supabase Dashboard** → **Authentication** → **Users**
2. Recherchez : `kzadichris@gmail.com`
3. Vérifiez la colonne **"Confirmed"**
4. Si c'est **"No"** :
   - Cliquez sur l'utilisateur
   - Cliquez sur **"Confirm User"** ou **"Auto Confirm"**

---

## ✅ Informations de Connexion Correctes

**Email** : `kzadichris@gmail.com`  
**Password** : `Kzadi2024!@#`

⚠️ **Assurez-vous que** :
- L'email est exactement : `kzadichris@gmail.com` (pas d'espace, pas de majuscule)
- Le mot de passe est exactement : `Kzadi2024!@#` (respectez les majuscules/minuscules)

---

## 🔍 Vérification dans SQL

Exécutez ce script pour vérifier le profil :

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

---

## 🚀 Après Correction

1. **Déconnectez-vous** de l'application (si connecté)
2. **Reconnectez-vous** avec :
   - Email : `kzadichris@gmail.com`
   - Password : `Kzadi2024!@#`
3. **Vérifiez** que la connexion fonctionne

---

## 📝 Checklist

- [ ] L'utilisateur existe dans Supabase Auth
- [ ] L'utilisateur est confirmé (Auto Confirm)
- [ ] Le mot de passe est correct (`Kzadi2024!@#`)
- [ ] L'email est correct (`kzadichris@gmail.com`)
- [ ] Le profil existe dans la table `profiles`
- [ ] Le rôle est `'admin'`

---

**➡️ Suivez l'Option 1 pour créer le compte, ou l'Option 2 pour réinitialiser le mot de passe !**


