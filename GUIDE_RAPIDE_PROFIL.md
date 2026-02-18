# 🚀 Guide Rapide - Créer le Profil

## ❌ Problème Actuel

L'erreur `PGRST116 - The result contains 0 rows` signifie que **le profil n'existe pas** dans la table `profiles`.

## ✅ Solution Simple

### Étape 1 : Trouver l'ID

Dans Supabase SQL Editor, exécute :

```sql
SELECT id, email 
FROM auth.users 
WHERE email = 'kzadichris@gmail.com';
```

**Copie l'ID** (c'est un UUID long)

### Étape 2 : Créer le Profil

Exécute ce script (remplace `TON_ID` par l'ID copié) :

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
  'TON_ID',  -- Colle l'ID ici
  'kzadichris@gmail.com',
  'Admin Kzadichris',
  'admin',
  true,
  true,
  'fr'
)
ON CONFLICT (id) DO UPDATE
SET role = 'admin', is_verified = true, is_active = true;
```

### Étape 3 : Vérifier

```sql
SELECT id, email, role FROM profiles WHERE email = 'kzadichris@gmail.com';
```

Tu devrais voir une ligne avec ton email et `role: admin`.

## 🔄 Après

1. **Dans l'app** : Déconnecte-toi et reconnecte-toi
2. L'erreur `PGRST116` devrait disparaître
3. Tu pourras accéder au Dashboard Admin

## 📝 Note

Les warnings `expo-notifications` sont normaux avec Expo Go SDK 53+. Tu peux les ignorer pour le moment.


