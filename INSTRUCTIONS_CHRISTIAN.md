# ✅ Créer le Profil Admin pour christian@maintenancemc.com

## 📋 Informations

**Email** : `christian@maintenancemc.com`  
**ID Auth** : `5afbf42c-2d01-4d5f-91e4-754d04d6d147`

---

## 🚀 Étapes

### 1. Réinitialiser le mot de passe dans Supabase Auth

1. **Ouvrez Supabase Dashboard**
   - Allez dans votre projet Niumba
   - Cliquez sur **"Authentication"** → **"Users"**
   - Recherchez : `christian@maintenancemc.com`
   - Cliquez sur l'utilisateur

2. **Réinitialiser le mot de passe**
   - Cliquez sur **"Update Password"**
   - Entrez : `Christian2024!@#`
   - Cliquez sur **"Save"**

3. **Vérifier que l'utilisateur est confirmé**
   - La colonne "Confirmed" doit être "Yes"
   - Si non, cliquez sur **"Confirm User"**

---

### 2. Créer le profil admin via SQL

1. **Ouvrez SQL Editor** dans Supabase
2. **Exécutez le script** : `CREER_PROFIL_CHRISTIAN.sql`

**OU** exécutez directement ce script :

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
  '5afbf42c-2d01-4d5f-91e4-754d04d6d147',
  'christian@maintenancemc.com',
  'Christian Admin',
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

### 3. Vérifier

Exécutez ce script pour vérifier :

```sql
SELECT 
  id,
  email,
  full_name,
  role,
  is_verified,
  is_active
FROM profiles
WHERE email = 'christian@maintenancemc.com';
```

Vous devriez voir :
- `role` = `'admin'`
- `is_verified` = `true`
- `is_active` = `true`

---

## ✅ Informations de Connexion

**Email** : `christian@maintenancemc.com`  
**Password** : `Christian2024!@#` (après réinitialisation dans Supabase)

---

## 🚀 Tester

1. **Ouvrez l'application** Niumba
2. **Connectez-vous** avec :
   - Email : `christian@maintenancemc.com`
   - Password : `Christian2024!@#`
3. **Accédez au Dashboard Admin**

---

**➡️ Exécutez le script SQL pour créer le profil admin !**


