# 🔧 Configuration Supabase Storage pour l'Upload d'Images

## 📋 **CONFIGURATIONS NÉCESSAIRES**

Pour que l'upload d'images fonctionne correctement, vous devez configurer Supabase Storage.

---

## 1. ✅ **CRÉER LES BUCKETS**

### Bucket 1 : `property-images`
Pour les images des propriétés.

### Bucket 2 : `avatars`
Pour les photos de profil (admin, agents, utilisateurs).

---

## 2. 📝 **ÉTAPES DE CONFIGURATION DANS SUPABASE**

### A. Créer le Bucket `property-images`

1. **Aller dans Supabase Dashboard** :
   - Ouvrir votre projet Supabase
   - Aller dans **Storage** (menu de gauche)

2. **Créer un nouveau bucket** :
   - Cliquer sur **"New bucket"**
   - **Nom** : `property-images`
   - **Public bucket** : ✅ **OUI** (pour que les images soient accessibles publiquement)
   - **File size limit** : `10 MB` (ou plus selon vos besoins)
   - **Allowed MIME types** : `image/jpeg, image/png, image/webp`
   - Cliquer sur **"Create bucket"**

3. **Configurer les permissions** :
   - Aller dans **Policies** du bucket `property-images`
   - Créer une politique pour **INSERT** (upload) :
     ```sql
     -- Allow authenticated users to upload images
     CREATE POLICY "Users can upload property images"
     ON storage.objects FOR INSERT
     TO authenticated
     WITH CHECK (bucket_id = 'property-images');
     ```
   
   - Créer une politique pour **SELECT** (lecture) :
     ```sql
     -- Allow public to read property images
     CREATE POLICY "Public can read property images"
     ON storage.objects FOR SELECT
     TO public
     USING (bucket_id = 'property-images');
     ```

---

### B. Créer le Bucket `avatars`

1. **Créer un nouveau bucket** :
   - Cliquer sur **"New bucket"**
   - **Nom** : `avatars`
   - **Public bucket** : ✅ **OUI**
   - **File size limit** : `5 MB`
   - **Allowed MIME types** : `image/jpeg, image/png, image/webp`
   - Cliquer sur **"Create bucket"**

2. **Configurer les permissions** :
   - Aller dans **Policies** du bucket `avatars`
   - Créer une politique pour **INSERT** :
     ```sql
     -- Allow authenticated users to upload avatars
     CREATE POLICY "Users can upload avatars"
     ON storage.objects FOR INSERT
     TO authenticated
     WITH CHECK (bucket_id = 'avatars');
     ```
   
   - Créer une politique pour **SELECT** :
     ```sql
     -- Allow public to read avatars
     CREATE POLICY "Public can read avatars"
     ON storage.objects FOR SELECT
     TO public
     USING (bucket_id = 'avatars');
     ```

---

## 3. 🔒 **POLITIQUES RLS COMPLÈTES**

### Pour `property-images` :

```sql
-- INSERT: Allow authenticated users to upload
CREATE POLICY "Users can upload property images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property-images');

-- SELECT: Allow public to read
CREATE POLICY "Public can read property images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'property-images');

-- UPDATE: Allow users to update their own images (optional)
CREATE POLICY "Users can update property images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'property-images');

-- DELETE: Allow users to delete their own images (optional)
CREATE POLICY "Users can delete property images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'property-images');
```

### Pour `avatars` :

```sql
-- INSERT: Allow authenticated users to upload
CREATE POLICY "Users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- SELECT: Allow public to read
CREATE POLICY "Public can read avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- UPDATE: Allow users to update their own avatar
CREATE POLICY "Users can update avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');

-- DELETE: Allow users to delete their own avatar
CREATE POLICY "Users can delete avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');
```

---

## 4. 📁 **STRUCTURE DES DOSSIERS**

Les images seront organisées comme suit :

```
property-images/
  └── properties/
      └── {userId}/
          └── {timestamp}_{random}.jpg

avatars/
  └── {userId}-{timestamp}.jpg
```

---

## 5. ✅ **VÉRIFICATION**

### Test 1 : Vérifier que les buckets existent
1. Aller dans **Storage** → **Buckets**
2. Vérifier que `property-images` et `avatars` sont présents
3. Vérifier qu'ils sont **Public**

### Test 2 : Vérifier les permissions
1. Aller dans **Storage** → **Policies**
2. Vérifier que les politiques sont créées pour chaque bucket
3. Vérifier que les utilisateurs authentifiés peuvent uploader
4. Vérifier que le public peut lire

### Test 3 : Tester l'upload depuis l'app
1. Ajouter une propriété avec des images
2. Vérifier que les images apparaissent dans Supabase Storage
3. Vérifier que les URLs sont accessibles publiquement

---

## 6. 🚨 **PROBLÈMES COURANTS**

### Erreur : "new row violates row-level security policy"
**Solution** : Vérifier que les politiques RLS sont créées et activées.

### Erreur : "The resource already exists"
**Solution** : Le bucket existe déjà. Vérifier qu'il est bien configuré.

### Erreur : "Storage bucket not found"
**Solution** : Vérifier que le nom du bucket correspond exactement à `property-images` ou `avatars`.

### Images non accessibles publiquement
**Solution** : Vérifier que les buckets sont marqués comme **Public**.

---

## 7. 📊 **CONFIGURATION RECOMMANDÉE**

### Bucket `property-images` :
- ✅ **Public** : Oui
- ✅ **File size limit** : 10 MB
- ✅ **Allowed MIME types** : `image/jpeg, image/png, image/webp`
- ✅ **Auto-optimize** : Activé (si disponible)

### Bucket `avatars` :
- ✅ **Public** : Oui
- ✅ **File size limit** : 5 MB
- ✅ **Allowed MIME types** : `image/jpeg, image/png, image/webp`
- ✅ **Auto-optimize** : Activé (si disponible)

---

## 8. 🔐 **SÉCURITÉ**

### Recommandations :
1. ✅ Limiter la taille des fichiers (10 MB pour propriétés, 5 MB pour avatars)
2. ✅ Limiter les types MIME (seulement images)
3. ✅ Utiliser RLS pour contrôler l'accès
4. ✅ Vérifier que seuls les utilisateurs authentifiés peuvent uploader

---

## 9. 📝 **SCRIPT SQL COMPLET**

Si vous préférez utiliser SQL directement dans Supabase SQL Editor :

```sql
-- Créer le bucket property-images (si n'existe pas)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-images',
  'property-images',
  true,
  10485760, -- 10 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Créer le bucket avatars (si n'existe pas)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Politiques pour property-images
CREATE POLICY IF NOT EXISTS "Users can upload property images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property-images');

CREATE POLICY IF NOT EXISTS "Public can read property images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'property-images');

-- Politiques pour avatars
CREATE POLICY IF NOT EXISTS "Users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY IF NOT EXISTS "Public can read avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

---

## ✅ **CHECKLIST**

- [ ] Bucket `property-images` créé et configuré
- [ ] Bucket `avatars` créé et configuré
- [ ] Les deux buckets sont **Public**
- [ ] Politiques RLS créées pour INSERT (authenticated)
- [ ] Politiques RLS créées pour SELECT (public)
- [ ] Taille de fichier limitée (10 MB / 5 MB)
- [ ] Types MIME limités (images seulement)
- [ ] Test d'upload réussi depuis l'app

---

**Date** : Aujourd'hui
**Status** : ⚠️ **À configurer dans Supabase**

