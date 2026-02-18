# 🔐 Réinitialiser le Mot de Passe - christian@maintenancemc.com

## 📋 Méthode 1 : Via Supabase Dashboard (Recommandé)

### Étape 1 : Réinitialiser le mot de passe dans Supabase

1. **Ouvrez Supabase Dashboard**
   - Allez dans votre projet Niumba
   - Cliquez sur **"Authentication"** dans le menu de gauche
   - Cliquez sur **"Users"**

2. **Trouver l'utilisateur**
   - Recherchez : `christian@maintenancemc.com`
   - Cliquez sur l'utilisateur

3. **Réinitialiser le mot de passe**
   - Cliquez sur **"Reset Password"** ou **"Send Password Reset Email"**
   - OU cliquez sur **"Update Password"** et entrez un nouveau mot de passe

4. **Nouveau mot de passe suggéré** :
   - `Christian2024!@#`
   - Ou un mot de passe de votre choix

---

## 📋 Méthode 2 : Via SQL (Si vous avez accès admin)

Si vous avez un autre compte admin, exécutez ce script dans SQL Editor :

```sql
-- Vérifier que l'utilisateur existe
SELECT id, email, role FROM profiles WHERE email = 'christian@maintenancemc.com';

-- Note: Le mot de passe doit être réinitialisé via Supabase Auth Dashboard
-- Pas possible de le faire directement via SQL pour des raisons de sécurité
```

---

## 📋 Méthode 3 : Via l'Application (Réinitialisation automatique)

1. **Dans l'application Niumba**
   - Allez sur l'écran de connexion
   - Cliquez sur **"Mot de passe oublié ?"** ou **"Forgot Password?"**
   - Entrez : `christian@maintenancemc.com`
   - Un email de réinitialisation sera envoyé

---

## 🔐 Nouveau Mot de Passe Suggéré

**Email** : `christian@maintenancemc.com`  
**Nouveau Password** : `Christian2024!@#`

⚠️ **Changez-le après la première connexion si vous voulez !**

---

## ✅ Vérifier le Rôle Admin

Après avoir réinitialisé le mot de passe, vérifiez que le compte est admin :

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

Si le rôle n'est pas `'admin'`, exécutez :

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'christian@maintenancemc.com';
```

---

## 🚀 Après Réinitialisation

1. **Connectez-vous** avec :
   - Email : `christian@maintenancemc.com`
   - Nouveau Password : (celui que vous avez défini)

2. **Accédez au Dashboard Admin**
   - Le dashboard devrait être accessible
   - Vous pouvez gérer tout le système

---

**➡️ Utilisez la Méthode 1 pour réinitialiser le mot de passe rapidement !**


