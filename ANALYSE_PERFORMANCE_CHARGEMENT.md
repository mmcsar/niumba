# 🐌 Analyse des Problèmes de Chargement - Niumba

## 🔍 **PROBLÈMES IDENTIFIÉS**

### 1. **HomeScreen charge trop de données en parallèle** ⚠️

**Problème** :
```typescript
// HomeScreen.tsx charge 2 hooks en parallèle au démarrage
const { properties: featuredProperties, loading: featuredLoading } = useFeaturedProperties(6);
const { citiesWithCounts, loading: citiesLoading } = useCityProperties();
```

**Impact** :
- ⚠️ **2 requêtes simultanées** au chargement
- ⚠️ **useCityProperties** peut être TRÈS lent (voir problème #2)
- ⚠️ L'écran attend que TOUT soit chargé avant d'afficher

---

### 2. **useCityProperties est TRÈS LENT** 🔴 **CRITIQUE**

**Problème** :
```typescript
// useCityProperties.ts
// Si RPC n'existe pas, fallback charge TOUTES les propriétés actives
const { data, error } = await supabase
  .from('properties')
  .select('city, province')  // ⚠️ Charge TOUTES les propriétés !
  .eq('status', 'active')
  .not('city', 'is', null);
```

**Impact** :
- 🔴 **Charge TOUTES les propriétés actives** (peut être 1000+)
- 🔴 **Compte en mémoire** (lent si beaucoup de données)
- 🔴 **Bloque le chargement** de HomeScreen
- 🔴 **Pas de cache** - recharge à chaque fois

**Solution** : Vérifier que la fonction RPC `get_city_property_counts` existe et fonctionne

---

### 3. **Pas de Cache sur les Requêtes** ⚠️

**Problème** :
- ⚠️ Chaque ouverture de l'app recharge TOUT
- ⚠️ Pas de cache pour `useFeaturedProperties`
- ⚠️ Pas de cache pour `useCityProperties`
- ⚠️ `cacheService.ts` existe mais n'est pas utilisé dans les hooks

**Impact** :
- ⚠️ Requêtes répétées inutilement
- ⚠️ Temps de chargement à chaque ouverture

---

### 4. **Images Non Optimisées** ⚠️

**Problème** :
- ⚠️ Images chargées en pleine résolution
- ⚠️ Pas de lazy loading visible
- ⚠️ Pas de compression

**Impact** :
- ⚠️ Téléchargement lent sur connexion faible
- ⚠️ Consommation de données élevée

---

### 5. **Requêtes Non Optimisées** ⚠️

**Problème** :
```typescript
// useProperties.ts
// Charge peut-être trop de champs
const { data, count } = await getProperties({
  ...options,
  page: currentPage,
});
```

**Impact** :
- ⚠️ Transfert de données inutiles
- ⚠️ Requêtes lentes

---

## 🚀 **SOLUTIONS PROPOSÉES**

### Solution 1 : **Vérifier et Optimiser useCityProperties** 🔴 **PRIORITÉ 1**

**Action** :
1. ✅ Vérifier que `get_city_property_counts` RPC existe dans Supabase
2. ✅ Si oui : S'assurer qu'il est utilisé (déjà fait)
3. ✅ Si non : Créer la fonction RPC
4. ✅ Ajouter un cache pour éviter de recharger à chaque fois

**Gain** : **-70% du temps de chargement** si RPC fonctionne

---

### Solution 2 : **Ajouter du Cache** 🟡 **PRIORITÉ 2**

**Action** :
1. ✅ Utiliser `cacheService` dans `useFeaturedProperties`
2. ✅ Utiliser `cacheService` dans `useCityProperties`
3. ✅ Cache de 5-10 minutes pour les données qui changent peu

**Gain** : **-50% du temps de chargement** après la première ouverture

---

### Solution 3 : **Chargement Progressif** 🟡 **PRIORITÉ 2**

**Action** :
1. ✅ Afficher HomeScreen immédiatement avec skeleton/loading
2. ✅ Charger `featuredProperties` en premier (rapide)
3. ✅ Charger `citiesWithCounts` en arrière-plan (peut être lent)

**Gain** : **Meilleure UX** - L'utilisateur voit quelque chose rapidement

---

### Solution 4 : **Optimiser les Requêtes** 🟢 **PRIORITÉ 3**

**Action** :
1. ✅ Sélectionner seulement les champs nécessaires
2. ✅ Limiter les données transférées
3. ✅ Utiliser des index sur les colonnes filtrées

**Gain** : **-20% du temps de chargement**

---

### Solution 5 : **Optimiser les Images** 🟢 **PRIORITÉ 3**

**Action** :
1. ✅ Utiliser des thumbnails pour les listes
2. ✅ Lazy loading des images
3. ✅ Compression des images

**Gain** : **-30% du temps de chargement** sur connexion faible

---

## 📊 **ESTIMATION DES GAINS**

| Solution | Gain Estimé | Priorité |
|----------|-------------|----------|
| **Optimiser useCityProperties** | -70% | 🔴 Critique |
| **Ajouter Cache** | -50% | 🟡 Important |
| **Chargement Progressif** | Meilleure UX | 🟡 Important |
| **Optimiser Requêtes** | -20% | 🟢 Optionnel |
| **Optimiser Images** | -30% | 🟢 Optionnel |

**Gain Total Potentiel** : **-80% du temps de chargement** avec les 3 premières solutions

---

## 🎯 **PLAN D'ACTION RECOMMANDÉ**

### Étape 1 : Vérifier RPC (5 min) 🔴
```sql
-- Dans Supabase SQL Editor
SELECT * FROM get_city_property_counts();
```

### Étape 2 : Ajouter Cache (15 min) 🟡
- Modifier `useCityProperties` pour utiliser cache
- Modifier `useFeaturedProperties` pour utiliser cache

### Étape 3 : Chargement Progressif (20 min) 🟡
- Modifier `HomeScreen` pour afficher immédiatement
- Charger `citiesWithCounts` en arrière-plan

---

## 🔧 **CODE À MODIFIER**

### 1. Vérifier RPC dans Supabase
```sql
-- Vérifier si la fonction existe
SELECT proname FROM pg_proc WHERE proname = 'get_city_property_counts';

-- Si elle n'existe pas, la créer (voir FUNCTION_COUNT_CITIES.sql)
```

### 2. Ajouter Cache à useCityProperties
```typescript
// Ajouter cache avec TTL de 5 minutes
const cacheKey = 'city_property_counts';
const cached = cache.get(cacheKey);
if (cached) {
  setCitiesWithCounts(cached);
  setLoading(false);
  return;
}
```

### 3. Chargement Progressif dans HomeScreen
```typescript
// Afficher immédiatement même si citiesLoading est true
// Charger cities en arrière-plan
```

---

## ✅ **CONCLUSION**

**Problème Principal** : `useCityProperties` charge TOUTES les propriétés si RPC n'existe pas

**Solution Immédiate** : Vérifier et créer la fonction RPC `get_city_property_counts`

**Gain Attendu** : **-70% du temps de chargement**

---

**Date** : Aujourd'hui
**Priorité** : 🔴 **CRITIQUE** - À faire immédiatement

