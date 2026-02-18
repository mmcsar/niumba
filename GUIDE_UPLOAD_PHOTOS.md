# 📸 Guide - Configuration Upload de Photos

## Problème Identifié

L'application essaie d'uploader des photos dans Supabase Storage, mais le bucket `property-images` n'existe pas encore.

## Solution

### Étape 1 : Créer le Bucket Storage

1. **Ouvrez Supabase Dashboard**
   - Allez sur https://supabase.com
   - Connectez-vous et sélectionnez votre projet

2. **Ouvrez SQL Editor**
   - Cliquez sur "SQL Editor" dans le menu de gauche

3. **Exécutez le Script**
   - Ouvrez le fichier : `supabase/CREER_BUCKET_STORAGE.sql`
   - Copiez tout le contenu (Ctrl+A puis Ctrl+C)
   - Collez dans Supabase SQL Editor
   - Cliquez sur **"Run"**

### Étape 2 : Vérifier dans Supabase Dashboard (Optionnel)

1. **Allez dans Storage**
   - Cliquez sur "Storage" dans le menu de gauche
   - Vous devriez voir le bucket "property-images"

2. **Vérifier les Permissions**
   - Cliquez sur "property-images"
   - Allez dans l'onglet "Policies"
   - Vous devriez voir 3 policies créées

## Ce que fait le Script

✅ Crée le bucket `property-images`  
✅ Configure les permissions pour :
   - Upload : Utilisateurs authentifiés peuvent uploader
   - Lecture : Public (pour afficher les images)
   - Suppression : Propriétaire ou admin peut supprimer

✅ Limite de taille : 5MB par fichier  
✅ Types autorisés : JPEG, JPG, PNG, WebP

## Test

Après avoir exécuté le script, essayez d'ajouter une propriété avec des photos dans l'application. L'upload devrait maintenant fonctionner !

## Si vous avez encore des erreurs

Envoyez-moi :
- Le message d'erreur exact
- L'écran où vous essayez d'uploader
- Les logs de la console (si disponibles)


