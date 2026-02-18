# 🔍 Debug - Pourquoi les propriétés ne s'affichent pas ?

## Problèmes identifiés

### 1. **IDs non-UUID dans le script SQL**
Le script `DONNEES_EXEMPLE_COMPLETE.sql` utilise des IDs comme `'prop-1'`, `'owner-1'` qui ne sont pas des UUIDs valides. Supabase attend des UUIDs pour les clés primaires.

### 2. **Vérification des données dans Supabase**
Il faut vérifier si les données ont été importées correctement.

## Solutions

### ✅ Solution 1 : Vérifier les données dans Supabase

1. **Ouvrez Supabase Dashboard** → SQL Editor
2. **Exécutez cette requête** pour vérifier les propriétés :

```sql
-- Vérifier toutes les propriétés
SELECT 
  id,
  title,
  status,
  is_featured,
  is_available,
  created_at
FROM properties
ORDER BY created_at DESC
LIMIT 10;
```

3. **Vérifier les propriétés featured** :

```sql
-- Vérifier les propriétés featured
SELECT 
  id,
  title,
  status,
  is_featured,
  is_available
FROM properties
WHERE status = 'active' 
  AND is_featured = true
ORDER BY created_at DESC;
```

### ✅ Solution 2 : Créer un script SQL avec des UUIDs valides

J'ai ajouté des logs de débogage dans le code. Maintenant :

1. **Ouvrez l'application** et regardez la console
2. **Vous devriez voir des logs** comme :
   - `[getFeaturedProperties] Fetching featured properties...`
   - `[getFeaturedProperties] Found X featured properties`
   - `[useFeaturedProperties] Loaded X properties`

### ✅ Solution 3 : Créer des propriétés d'exemple directement

Si les données ne sont pas dans Supabase, exécutez ce script dans Supabase SQL Editor :

```sql
-- Créer des propriétés d'exemple avec des UUIDs valides
-- D'abord, créer les profils propriétaires

-- Propriétaire 1
INSERT INTO profiles (
  id,
  email,
  full_name,
  phone,
  role,
  is_verified,
  is_active,
  language
)
VALUES (
  gen_random_uuid(),
  'owner1@niumba.com',
  'Jean-Pierre Mwamba',
  '+243971234567',
  'owner',
  true,
  true,
  'fr'
)
ON CONFLICT (email) DO NOTHING
RETURNING id;

-- Ensuite, créer les propriétés avec les IDs des propriétaires
-- (Remplacez OWNER_ID_1 par l'ID retourné ci-dessus)

INSERT INTO properties (
  id,
  owner_id,
  title,
  title_en,
  type,
  price,
  currency,
  price_type,
  address,
  city,
  province,
  latitude,
  longitude,
  bedrooms,
  bathrooms,
  area,
  garage,
  description,
  description_en,
  images,
  features,
  features_en,
  status,
  is_featured,
  is_available
)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM profiles WHERE email = 'owner1@niumba.com' LIMIT 1),
  'Villa Moderne Golf',
  'Modern Golf Villa',
  'house',
  350000,
  'USD',
  'sale',
  'Avenue du Golf, Quartier Golf',
  'Lubumbashi',
  'Haut-Katanga',
  -11.6876,
  27.4847,
  5,
  4,
  450,
  2,
  'Magnifique villa moderne située dans le prestigieux quartier Golf de Lubumbashi.',
  'Beautiful modern villa located in the prestigious Golf neighborhood of Lubumbashi.',
  ARRAY[
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'
  ],
  ARRAY['Piscine', 'Jardin', 'Sécurité 24h'],
  ARRAY['Swimming Pool', 'Garden', '24h Security'],
  'active',
  true,
  true
)
ON CONFLICT DO NOTHING;
```

## 🔧 Corrections apportées au code

1. ✅ **Ajout de logs de débogage** dans `propertyService.ts`
2. ✅ **Fallback automatique** : Si aucune propriété featured n'est trouvée, le système affiche toutes les propriétés actives
3. ✅ **Logs dans le hook** `useFeaturedProperties` pour suivre le chargement

## 📱 Comment tester

1. **Ouvrez l'application** dans Expo
2. **Regardez la console** (Metro bundler ou Expo Go)
3. **Vous devriez voir** :
   ```
   [getFeaturedProperties] Fetching featured properties...
   [getFeaturedProperties] Found X featured properties
   [useFeaturedProperties] Loaded X properties
   ```

4. **Si vous voyez "Found 0 featured properties"** :
   - Les données ne sont pas dans Supabase
   - Exécutez le script SQL ci-dessus
   - Ou vérifiez que les propriétés ont `is_featured = true`

## 🚀 Prochaines étapes

1. Vérifiez les logs dans la console
2. Exécutez les requêtes SQL pour vérifier les données
3. Si nécessaire, créez les propriétés d'exemple avec le script SQL ci-dessus


