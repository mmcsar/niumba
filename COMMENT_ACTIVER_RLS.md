# 🚀 Comment Activer le RLS - Guide Étape par Étape

## ⚠️ Vous voyez "Policy name" ?

Cela signifie que vous êtes dans l'interface manuelle de Supabase. 
**Ne créez pas les policies une par une !** Utilisez le SQL Editor à la place.

---

## ✅ Méthode Simple (Recommandée)

### Étape 1 : Ouvrir SQL Editor dans Supabase

1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Dans le menu de gauche, cherchez **SQL Editor** (icône avec `</>` ou `SQL`)
4. Cliquez dessus

### Étape 2 : Créer une nouvelle requête

1. Cliquez sur le bouton **"New Query"** (en haut à droite, bouton vert/bleu)
2. Une nouvelle fenêtre de code s'ouvre

### Étape 3 : Copier le script

**Option A : Script complet (recommandé)**
1. Ouvrez le fichier `supabase/rls_with_auth.sql` dans votre éditeur
2. Sélectionnez TOUT (Ctrl+A)
3. Copiez (Ctrl+C)
4. Collez dans le SQL Editor de Supabase (Ctrl+V)
5. Cliquez sur **Run** (ou Ctrl+Enter)

**Option B : Script rapide (si le complet ne fonctionne pas)**
1. Ouvrez le fichier `supabase/rls_quick.sql` (version simplifiée)
2. Copiez-collez dans SQL Editor
3. Cliquez sur **Run**

### Étape 4 : Vérifier

Vous devriez voir un message de succès. Si vous voyez des erreurs "already exists", c'est normal et sans danger.

---

## 📍 Où trouver les fichiers ?

Dans votre projet Niumba :
- `supabase/rls_with_auth.sql` ← Script complet (435 lignes)
- `supabase/rls_quick.sql` ← Version simplifiée (plus court)

---

## 🆘 Si vous ne trouvez pas SQL Editor

1. Dans Supabase Dashboard, regardez le menu de gauche
2. Cherchez une icône avec `</>` ou le texte "SQL Editor"
3. Si vous ne le voyez pas, cliquez sur "Database" puis "SQL Editor"

---

## 🎯 Résumé

**Ne créez PAS les policies une par une dans l'interface !**

✅ **Utilisez SQL Editor** avec le script `rls_with_auth.sql` ou `rls_quick.sql`

C'est 100x plus rapide et moins d'erreurs ! 🚀



