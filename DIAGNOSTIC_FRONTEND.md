# 🔍 Diagnostic Front-End - Problèmes dans l'Application

## Problèmes Front-End Courants

### 1. ⚠️ Erreurs de Navigation
**Symptômes** :
- L'app crash au démarrage
- Navigation vers certains écrans ne fonctionne pas
- Erreur "Cannot read property 'navigate' of undefined"

**Vérification** :
- Vérifier que tous les écrans sont bien importés dans `src/navigation/index.tsx`
- Vérifier que les noms des routes correspondent

### 2. ⚠️ Hooks qui retournent des erreurs
**Symptômes** :
- Écrans vides
- Erreurs "Cannot read property of undefined"
- Données ne s'affichent pas

**Hooks à vérifier** :
- `useProperties` - Liste des propriétés
- `useProperty` - Détails d'une propriété
- `useAuth` - Authentification
- `useNotifications` - Notifications
- `useAppointments` - Rendez-vous
- `useInquiries` - Demandes

### 3. ⚠️ Erreurs de State Management
**Symptômes** :
- État ne se met pas à jour
- Re-renders infinis
- Performance lente

**Vérification** :
- Vérifier les dépendances dans `useEffect`
- Vérifier les `useCallback` et `useMemo`

### 4. ⚠️ Erreurs de Rendu
**Symptômes** :
- Composants ne s'affichent pas
- Erreurs "Cannot read property 'map' of undefined"
- Erreurs "Cannot read property 'length' of undefined"

**Vérification** :
- Vérifier que les données sont bien initialisées avant `.map()`
- Ajouter des vérifications `data?.length > 0`

### 5. ⚠️ Erreurs d'Images
**Symptômes** :
- Images ne s'affichent pas
- Erreurs "Failed to load image"
- Placeholders toujours affichés

**Vérification** :
- Vérifier les URLs des images
- Vérifier le bucket Storage Supabase

## Script de Vérification Front-End

Créez un fichier `src/utils/debugUtils.ts` pour diagnostiquer :

```typescript
// Debug utilities
export const logError = (error: any, context: string) => {
  console.error(`[${context}]`, error);
  if (error?.message) {
    console.error('Error message:', error.message);
  }
  if (error?.stack) {
    console.error('Error stack:', error.stack);
  }
};

export const checkData = (data: any, name: string) => {
  if (!data) {
    console.warn(`[${name}] Data is null or undefined`);
    return false;
  }
  if (Array.isArray(data) && data.length === 0) {
    console.warn(`[${name}] Array is empty`);
    return false;
  }
  return true;
};
```

## Checklist de Vérification Front-End

### Navigation
- [ ] Tous les écrans sont importés
- [ ] Tous les écrans sont dans le Stack Navigator
- [ ] Les types TypeScript sont corrects
- [ ] Pas d'erreurs de navigation dans les logs

### Hooks
- [ ] `useProperties` retourne des données
- [ ] `useAuth` fonctionne correctement
- [ ] `useNotifications` charge les notifications
- [ ] Tous les hooks gèrent les cas d'erreur

### Composants
- [ ] Tous les composants gèrent les données vides
- [ ] Pas d'erreurs "Cannot read property"
- [ ] Les images s'affichent correctement
- [ ] Les listes se chargent correctement

### Performance
- [ ] Pas de re-renders infinis
- [ ] Les dépendances `useEffect` sont correctes
- [ ] Les `useCallback` et `useMemo` sont utilisés correctement

## Solutions Rapides

### Solution 1 : Ajouter des vérifications de données
```typescript
// Avant
{properties.map(p => <PropertyCard key={p.id} property={p} />)}

// Après
{properties && properties.length > 0 ? (
  properties.map(p => <PropertyCard key={p.id} property={p} />)
) : (
  <Text>Aucune propriété disponible</Text>
)}
```

### Solution 2 : Gérer les erreurs dans les hooks
```typescript
const { data, error, loading } = useProperties();

if (loading) return <ActivityIndicator />;
if (error) return <Text>Erreur: {error.message}</Text>;
if (!data || data.length === 0) return <Text>Aucune donnée</Text>;
```

### Solution 3 : Vérifier les imports
```typescript
// Vérifier que tous les imports sont corrects
import { useProperties } from '../hooks/useProperties'; // ✅
import { useProperties } from '../hooks/useProperties.ts'; // ❌ Ne pas mettre .ts
```

## Prochaines Étapes

1. Ouvrir la console Expo (appuyez sur `j` dans le terminal Expo)
2. Vérifier les erreurs affichées
3. Identifier les écrans qui ne fonctionnent pas
4. Vérifier les hooks qui retournent des erreurs
5. Corriger chaque problème un par un


