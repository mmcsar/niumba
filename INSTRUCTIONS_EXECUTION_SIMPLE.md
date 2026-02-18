# Instructions d'Exécution Simple

## ✅ Script à Exécuter

Utilisez le fichier : **`supabase/CORRIGER_PROBLEMES_UNIQUE.sql`**

## 📋 Étapes

1. **Ouvrez Supabase Dashboard**
   - Allez sur https://supabase.com
   - Connectez-vous à votre projet

2. **Ouvrez SQL Editor**
   - Cliquez sur "SQL Editor" dans le menu de gauche

3. **Copiez le Script**
   - Ouvrez le fichier `supabase/CORRIGER_PROBLEMES_UNIQUE.sql`
   - Copiez TOUT le contenu (Ctrl+A puis Ctrl+C)

4. **Collez dans SQL Editor**
   - Collez le script dans l'éditeur SQL
   - ⚠️ **IMPORTANT** : Assurez-vous qu'il n'y a qu'UNE SEULE requête visible

5. **Exécutez**
   - Cliquez sur le bouton **"Run"** (ou appuyez sur Ctrl+Enter)
   - ⚠️ **NE CLIQUEZ PAS sur "Explain"** - cela ne fonctionne qu'avec une seule requête

6. **Vérifiez le Résultat**
   - Vous devriez voir des messages de succès dans les logs
   - Pas d'erreur "already exists" car le script vérifie avant de créer

## ✅ Résultat Attendu

```
✅ RLS activé sur toutes les tables !
✅ Toutes les policies créées/vérifiées !
✅ Problèmes corrigés !
```

## 🔍 Si Vous Avez Encore des Erreurs

Si vous voyez encore "already exists", c'est normal - le script vérifie et ignore les policies qui existent déjà.

Si vous voyez d'autres erreurs, envoyez-moi le message d'erreur exact.


