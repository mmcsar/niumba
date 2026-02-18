# 🔒 Guide Simple : Activer le RLS (3 étapes)

## 📍 Où est le fichier ?

Le fichier est ici dans votre projet :
```
C:\Users\mmcsa\Niumba\supabase\rls_with_auth.sql
```

---

## 🚀 3 Étapes pour activer le RLS

### Étape 1 : Ouvrir le fichier

1. Dans votre éditeur (VS Code, etc.)
2. Ouvrez le fichier : `supabase/rls_with_auth.sql`
3. **Sélectionnez TOUT** (Ctrl+A)
4. **Copiez** (Ctrl+C)

### Étape 2 : Aller dans Supabase

1. Ouvrez [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Connectez-vous
3. Sélectionnez votre projet
4. Dans le menu de gauche, cliquez sur **SQL Editor** (icône `</>`)

### Étape 3 : Coller et exécuter

1. Dans le SQL Editor, cliquez sur **New Query** (en haut à droite)
2. **Collez** le contenu (Ctrl+V)
3. Cliquez sur **Run** (ou Ctrl+Enter)
4. ✅ C'est fait !

---

## ✅ Vérification

Après avoir exécuté, testez avec cette requête dans le SQL Editor :

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'properties';
```

Si `rowsecurity` est `true`, c'est bon ! ✅

---

## 🆘 Si vous avez des erreurs

C'est normal si vous voyez des erreurs comme "policy already exists". 
Le script utilise `DROP POLICY IF EXISTS` donc c'est sans danger.

---

## 📝 Alternative : Copier directement

Si vous ne trouvez pas le fichier, voici le début du script à copier :

```sql
-- NIUMBA - RLS Policies with Required Authentication
-- Copiez TOUT le contenu de supabase/rls_with_auth.sql
```

**Le fichier complet fait 435 lignes** - assurez-vous de tout copier !



