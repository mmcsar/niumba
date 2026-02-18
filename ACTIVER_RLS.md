# 🔒 Guide Simple : Activer le RLS dans Supabase

## 📍 Où trouver le fichier RLS

Le fichier se trouve ici : **`supabase/rls_with_auth.sql`**

---

## 🚀 Étapes pour activer le RLS

### Étape 1 : Ouvrir Supabase Dashboard

1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Connectez-vous
3. Sélectionnez votre projet **mbenioxoabiusjdqzhtk**

### Étape 2 : Ouvrir le SQL Editor

1. Dans le menu de gauche, cliquez sur **SQL Editor** (icône avec `</>`)
2. Cliquez sur **New Query** (bouton en haut à droite)

### Étape 3 : Copier le contenu du fichier

1. Ouvrez le fichier `supabase/rls_with_auth.sql` dans votre éditeur de code
2. **Sélectionnez TOUT le contenu** (Ctrl+A)
3. **Copiez** (Ctrl+C)

### Étape 4 : Coller et exécuter dans Supabase

1. Dans le SQL Editor de Supabase, **collez** le contenu (Ctrl+V)
2. Cliquez sur **Run** (ou appuyez sur **Ctrl+Enter**)
3. Attendez que le script s'exécute (quelques secondes)

### Étape 5 : Vérifier que ça a fonctionné

Vous devriez voir un message de succès. Si vous voyez des erreurs, c'est normal si certaines policies existent déjà.

---

## ✅ Vérification rapide

Après avoir exécuté le script, testez avec cette requête dans le SQL Editor :

```sql
-- Vérifier que RLS est activé
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'properties';
```

**Résultat attendu** : `rowsecurity` doit être `true`

---

## 🆘 Si vous ne trouvez pas le fichier

Le fichier est dans votre projet à cette adresse :
```
C:\Users\mmcsa\Niumba\supabase\rls_with_auth.sql
```

**Ou** vous pouvez copier directement le contenu ci-dessous :



