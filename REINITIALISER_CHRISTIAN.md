# 🔐 Réinitialiser le Mot de Passe - christian@maintenancemc.com

## ❌ Problème : Mot de passe invalide

Le mot de passe `Christian2024!@#` ne fonctionne pas. Réinitialisons-le.

---

## 🚀 Solution : Réinitialiser dans Supabase Dashboard

### Étape 1 : Ouvrir Supabase Dashboard

1. **Ouvrez Supabase Dashboard**
   - Allez dans votre projet Niumba
   - Cliquez sur **"Authentication"** dans le menu de gauche
   - Cliquez sur **"Users"**

### Étape 2 : Trouver l'utilisateur

1. **Recherchez** : `christian@maintenancemc.com`
2. **Cliquez** sur l'utilisateur

### Étape 3 : Réinitialiser le mot de passe

1. **Cliquez sur "Update Password"** ou **"Reset Password"**
2. **Entrez le nouveau mot de passe** : `Christian2024!@#`
3. **Confirmez** le nouveau mot de passe
4. **Cliquez sur "Save"** ou **"Update"**

---

## ✅ Nouveau Mot de Passe

**Email** : `christian@maintenancemc.com`  
**Nouveau Password** : `Christian2024!@#`

⚠️ **Assurez-vous que** :
- Pas d'espace avant/après
- Respect des majuscules/minuscules : `C` majuscule, `h` minuscule, etc.
- Caractères spéciaux : `!@#`

---

## 🔍 Vérifications

### 1. Vérifier que l'utilisateur existe

Dans Supabase Dashboard → Authentication → Users :
- L'utilisateur `christian@maintenancemc.com` doit exister
- L'utilisateur doit être **confirmé** (colonne "Confirmed" = Yes)

### 2. Si l'utilisateur n'est pas confirmé

1. Cliquez sur l'utilisateur
2. Cliquez sur **"Confirm User"** ou **"Auto Confirm"**

### 3. Vérifier le profil admin

Exécutez ce script SQL pour vérifier :

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
SET 
  role = 'admin',
  is_verified = true,
  is_active = true
WHERE email = 'christian@maintenancemc.com';
```

---

## 🚀 Après Réinitialisation

1. **Déconnectez-vous** de l'application (si connecté)
2. **Reconnectez-vous** avec :
   - Email : `christian@maintenancemc.com`
   - Password : `Christian2024!@#`
3. **Vérifiez** que la connexion fonctionne

---

## 📝 Alternative : Créer un Nouveau Mot de Passe

Si vous préférez un autre mot de passe :

1. **Supabase Dashboard** → **Authentication** → **Users**
2. Recherchez : `christian@maintenancemc.com`
3. Cliquez sur l'utilisateur
4. Cliquez sur **"Update Password"**
5. Entrez votre nouveau mot de passe
6. Cliquez sur **"Save"**

**Mots de passe suggérés** :
- `Christian2024!@#`
- `Chris2024!@#`
- `Maintenance2024!@#`

---

## ⚠️ Si ça ne fonctionne toujours pas

1. **Vérifiez l'email** : Pas d'espace, exactement `christian@maintenancemc.com`
2. **Vérifiez le mot de passe** : Respectez les majuscules/minuscules
3. **Vérifiez que l'utilisateur est confirmé** dans Supabase Auth
4. **Essayez de réinitialiser** à nouveau dans Supabase Dashboard

---

**➡️ Réinitialisez le mot de passe dans Supabase Dashboard → Authentication → Users !**


