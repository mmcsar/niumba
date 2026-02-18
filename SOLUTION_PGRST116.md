# 🔧 Solution Erreur PGRST116

## 🎯 Problème

L'erreur `PGRST116` signifie généralement un problème avec :
- Les permissions RLS (Row Level Security)
- La structure de la base de données
- Les foreign keys

## ✅ Solution en 2 Étapes

### Étape 1 : Trouver l'ID de l'utilisateur

Exécute ce script dans Supabase SQL Editor :

```sql
SELECT id, email, email_confirmed_at 
FROM auth.users 
WHERE email = 'kzadichris@gmail.com';
```

**Copie l'ID** que tu vois (c'est un UUID comme `12345678-1234-1234-1234-123456789abc`)

### Étape 2 : Créer le profil avec l'ID exact

Remplace `TON_USER_ID_ICI` par l'ID que tu as copié :

```sql
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
  'TON_USER_ID_ICI',  -- Colle l'ID ici
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
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  is_verified = true,
  is_active = true,
  updated_at = NOW();
```

## 🔍 Alternative : Vérifier les Policies RLS

Si ça ne fonctionne toujours pas, vérifie les policies :

```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'profiles';
```

Si tu vois une policy `profiles_insert_own`, elle pourrait bloquer. Dans ce cas, dis-moi et je te donnerai la solution.

## ✅ Après la Création

Une fois le profil créé :

1. **Vérifie** avec :
```sql
SELECT id, email, role FROM profiles WHERE email = 'kzadichris@gmail.com';
```

2. **Dans l'app** :
   - Déconnecte-toi complètement
   - Reconnecte-toi
   - L'erreur devrait disparaître


