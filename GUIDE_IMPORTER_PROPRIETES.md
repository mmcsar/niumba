# 📋 Guide : Importer les Propriétés d'Exemple dans Supabase

## 🎯 Objectif

Importer les 6 propriétés d'exemple depuis `src/constants/data.ts` dans Supabase pour pouvoir tester l'application avec des données réelles.

## 📍 Localisation des Données

Les propriétés d'exemple se trouvent dans :
- **Fichier** : `src/constants/data.ts`
- **Variable** : `SAMPLE_PROPERTIES`
- **Nombre** : 6 propriétés d'exemple

## 🚀 Étapes pour Importer

### Étape 1 : Ouvrir Supabase SQL Editor

1. Allez sur votre projet Supabase
2. Cliquez sur **"SQL Editor"** dans le menu de gauche
3. Cliquez sur **"New query"**

### Étape 2 : Copier le Script SQL

1. Ouvrez le fichier : `supabase/IMPORTER_PROPRIETES_EXEMPLE.sql`
2. **Copiez tout le contenu** du fichier
3. **Collez-le** dans l'éditeur SQL de Supabase

### Étape 3 : Exécuter le Script

1. Cliquez sur **"Run"** ou appuyez sur `Ctrl+Enter`
2. Attendez la fin de l'exécution
3. Vérifiez les messages de confirmation

## 📊 Propriétés qui seront Importées

### 1. Villa Moderne Golf (Lubumbashi)
- **Type** : Maison
- **Prix** : $350,000 (vente)
- **Caractéristiques** : 5 chambres, 4 salles de bain, 450 m²
- **Featured** : ✅ Oui

### 2. Appartement Centre-Ville (Lubumbashi)
- **Type** : Appartement
- **Prix** : $1,500/mois (location)
- **Caractéristiques** : 3 chambres, 2 salles de bain, 120 m²
- **Featured** : ✅ Oui

### 3. Maison Familiale Kolwezi
- **Type** : Maison
- **Prix** : $180,000 (vente)
- **Caractéristiques** : 4 chambres, 3 salles de bain, 280 m²
- **Featured** : ❌ Non

### 4. Entrepôt Zone Industrielle (Kipushi)
- **Type** : Entrepôt
- **Prix** : $5,000/mois (location)
- **Caractéristiques** : 1,200 m²
- **Featured** : ❌ Non

### 5. Terrain Commercial Likasi
- **Type** : Terrain
- **Prix** : $75,000 (vente)
- **Caractéristiques** : 2,000 m²
- **Featured** : ✅ Oui

### 6. Duplex Moderne Lubumbashi
- **Type** : Duplex
- **Prix** : $2,800/mois (location)
- **Caractéristiques** : 4 chambres, 3 salles de bain, 200 m²
- **Featured** : ✅ Oui

## ✅ Vérification

Après l'import, vous pouvez vérifier dans Supabase :

```sql
-- Voir toutes les propriétés importées
SELECT id, title, city, price, status, is_featured
FROM properties
WHERE id IN ('prop-1', 'prop-2', 'prop-3', 'prop-4', 'prop-5', 'prop-6')
ORDER BY created_at DESC;
```

## 🎯 Résultat

Une fois importées, ces propriétés seront visibles dans :
- ✅ **HomeScreen** - Propriétés en vedette
- ✅ **SearchScreen** - Recherche et filtres
- ✅ **MapScreen** - Carte avec positions GPS
- ✅ **ComparePropertiesScreen** - Comparaison
- ✅ **NearbySearchScreen** - Recherche GPS

## 📝 Note

Les propriétaires (owners) seront également créés automatiquement :
- **owner-1** : Jean-Pierre Mwamba
- **owner-2** : Marie Kasongo
- **owner-3** : Patrick Kabongo

---

**➡️ Exécutez le script SQL dans Supabase pour importer les propriétés d'exemple !**


