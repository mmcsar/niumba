# 📋 Configuration des Villes dans Supabase

## 🎯 Vue d'ensemble

Les villes du Haut-Katanga et du Lualaba sont maintenant configurées dans **deux endroits** :

1. **Code TypeScript** : `src/constants/cities.ts` (pour l'application)
2. **Base de données Supabase** : Table `cities` (pour les requêtes SQL et la validation)

## 📊 Structure de la Table `cities` dans Supabase

### Schéma SQL

```sql
CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  province TEXT NOT NULL CHECK (province IN ('Haut-Katanga', 'Lualaba')),
  latitude NUMERIC,
  longitude NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Index pour Performance

```sql
CREATE INDEX IF NOT EXISTS idx_cities_name ON cities(name);
CREATE INDEX IF NOT EXISTS idx_cities_province ON cities(province);
```

## 🚀 Installation dans Supabase

### Étape 1 : Exécuter le Script SQL

1. Ouvrez votre **Supabase Dashboard**
2. Allez dans **SQL Editor**
3. Copiez et exécutez le contenu de `supabase/INSERT_CITIES.sql`

### Étape 2 : Vérifier l'Insertion

```sql
-- Vérifier toutes les villes
SELECT * FROM cities ORDER BY province, name;

-- Compter par province
SELECT 
  province,
  COUNT(*) as nombre_villes
FROM cities
GROUP BY province;
```

## 📝 Villes Insérées

### Haut-Katanga (15 villes)
- Lubumbashi (capitale) - avec coordonnées GPS
- Likasi - avec coordonnées GPS
- Kipushi - avec coordonnées GPS
- Kasenga - avec coordonnées GPS
- Kakanda - avec coordonnées GPS
- Kambove - avec coordonnées GPS
- Kampemba
- Kisanga
- Kakontwe
- Pweto - avec coordonnées GPS
- Mitwaba
- Manono
- Kongolo
- Kabongo
- Kamina

### Lualaba (5 villes)
- Kolwezi (capitale) - avec coordonnées GPS
- Fungurume - avec coordonnées GPS
- Kasumbalesa - avec coordonnées GPS
- Mutshatsha
- Lubudi

## 🔄 Utilisation dans l'Application

### 1. Dans le Code TypeScript

```typescript
import { CITIES, CITY_NAMES, getProvinceByCity } from '../constants/cities';

// Obtenir toutes les villes
const allCities = CITIES;

// Obtenir les villes par province
const hautKatangaCities = getCitiesByProvince('Haut-Katanga');
const lualabaCities = getCitiesByProvince('Lualaba');

// Obtenir la province d'une ville
const province = getProvinceByCity('Lubumbashi'); // 'Haut-Katanga'
```

### 2. Dans Supabase (Requêtes SQL)

```sql
-- Récupérer toutes les villes
SELECT * FROM cities ORDER BY province, name;

-- Filtrer par province
SELECT * FROM cities WHERE province = 'Haut-Katanga';

-- Rechercher une ville
SELECT * FROM cities WHERE name ILIKE '%lub%';

-- Joindre avec properties
SELECT 
  p.title,
  c.name as city_name,
  c.province
FROM properties p
JOIN cities c ON p.city = c.name
WHERE c.province = 'Haut-Katanga';
```

## ✅ Avantages de la Configuration dans Supabase

1. **Validation** : Les villes peuvent être validées au niveau de la base de données
2. **Requêtes SQL** : Possibilité de faire des JOIN avec la table `cities`
3. **Cohérence** : Les villes sont centralisées et peuvent être mises à jour facilement
4. **Performance** : Index sur `name` et `province` pour des recherches rapides
5. **Évolutivité** : Facile d'ajouter de nouvelles villes sans modifier le code

## 🔧 Mise à Jour des Villes

### Ajouter une Nouvelle Ville

```sql
INSERT INTO cities (name, name_en, province, latitude, longitude) 
VALUES ('NouvelleVille', 'NewCity', 'Haut-Katanga', -11.0000, 27.0000)
ON CONFLICT (name) DO NOTHING;
```

### Mettre à Jour les Coordonnées

```sql
UPDATE cities 
SET latitude = -11.0000, longitude = 27.0000, updated_at = NOW()
WHERE name = 'Lubumbashi';
```

## 📋 Fichiers Créés

1. **`supabase/INSERT_CITIES.sql`** - Script SQL pour créer et remplir la table `cities`
2. **`src/constants/cities.ts`** - Constantes TypeScript pour l'application
3. **`CONFIGURATION_VILLES_SUPABASE.md`** - Ce document

## 🎯 Prochaines Étapes

1. ✅ Exécuter `supabase/INSERT_CITIES.sql` dans Supabase
2. ✅ Vérifier que les villes sont bien insérées
3. ✅ (Optionnel) Créer une contrainte de clé étrangère entre `properties.city` et `cities.name`
4. ✅ (Optionnel) Créer une vue pour faciliter les requêtes

## 🔗 Contrainte de Clé Étrangère (Optionnel)

Pour garantir que seules les villes valides sont utilisées :

```sql
-- Ajouter une contrainte de clé étrangère
ALTER TABLE properties 
ADD CONSTRAINT fk_properties_city 
FOREIGN KEY (city) REFERENCES cities(name);
```

**Note** : Cette contrainte nécessite que toutes les propriétés existantes aient des villes valides.

---

**Date** : Aujourd'hui
**Statut** : ✅ **Configuration complète prête pour Supabase !**

