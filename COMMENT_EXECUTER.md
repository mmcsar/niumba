# ✅ Comment Exécuter le Script SQL dans Supabase

## ⚠️ IMPORTANT : Ne Cliquez PAS sur "Explain" !

L'erreur "EXPLAIN only works on a single SQL statement" apparaît si vous cliquez sur le bouton **"Explain"** au lieu de **"Run"**.

## 📋 Étapes Correctes :

1. **Ouvrez Supabase Dashboard**
   - Allez sur https://supabase.com
   - Connectez-vous et sélectionnez votre projet

2. **Ouvrez SQL Editor**
   - Cliquez sur **"SQL Editor"** dans le menu de gauche

3. **Créez une Nouvelle Requête**
   - Cliquez sur **"New query"** (ou le bouton +)

4. **Copiez le Script**
   - Ouvrez le fichier : `supabase/CORRIGER_PROBLEMES_UNIQUE.sql`
   - Sélectionnez TOUT (Ctrl+A)
   - Copiez (Ctrl+C)

5. **Collez dans l'Éditeur**
   - Collez le script dans l'éditeur SQL (Ctrl+V)
   - Assurez-vous qu'il n'y a qu'UNE SEULE requête visible (un seul bloc `DO $$ ... END $$;`)

6. **Exécutez avec "Run"**
   - ⚠️ **CLIQUEZ SUR "RUN"** (ou appuyez sur Ctrl+Enter)
   - ❌ **NE CLIQUEZ PAS sur "Explain"**

7. **Vérifiez le Résultat**
   - Vous devriez voir dans les logs :
     ```
     ✅ RLS activé sur toutes les tables !
     ✅ Toutes les policies créées/vérifiées !
     ✅ Problèmes corrigés !
     ```

## 🔍 Si Vous Voyez Encore l'Erreur :

- Assurez-vous de cliquer sur **"Run"** et non **"Explain"**
- Vérifiez qu'il n'y a qu'une seule requête dans l'éditeur
- Si vous avez plusieurs requêtes, supprimez-les et gardez seulement le bloc `DO $$ ... END $$;`

## 📍 Emplacement du Script :

```
C:\Users\mmcsa\Niumba\supabase\CORRIGER_PROBLEMES_UNIQUE.sql
```


