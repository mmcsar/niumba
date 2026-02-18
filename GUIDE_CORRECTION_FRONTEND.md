# 🔧 Guide de Correction Front-End

## Comment Identifier les Problèmes

### 1. Ouvrir la Console Expo
Dans le terminal où Expo tourne, appuyez sur :
- `j` pour ouvrir la console
- Regardez les erreurs en rouge

### 2. Erreurs Courantes et Solutions

#### Erreur : "Cannot read property 'map' of undefined"
**Cause** : Données non initialisées avant `.map()`
**Solution** :
```typescript
// ❌ Mauvais
{properties.map(p => <PropertyCard property={p} />)}

// ✅ Bon
{properties && properties.length > 0 ? (
  properties.map(p => <PropertyCard key={p.id} property={p} />)
) : (
  <Text>Aucune propriété disponible</Text>
)}
```

#### Erreur : "Cannot read property 'navigate' of undefined"
**Cause** : Navigation non disponible dans le composant
**Solution** :
```typescript
// Utiliser useNavigation hook
import { useNavigation } from '@react-navigation/native';

const MyScreen = () => {
  const navigation = useNavigation();
  // ...
};
```

#### Erreur : "Hook called conditionally"
**Cause** : Hook appelé dans une condition
**Solution** :
```typescript
// ❌ Mauvais
if (condition) {
  const data = useHook();
}

// ✅ Bon
const data = useHook();
if (condition) {
  // utiliser data
}
```

#### Erreur : "Network request failed"
**Cause** : Problème de connexion ou Supabase
**Solution** :
- Vérifier la connexion internet
- Vérifier les clés Supabase dans `src/lib/supabase.ts`
- Vérifier que Supabase est accessible

## Checklist de Vérification

### Écrans Principaux
- [ ] **HomeScreen** : Affiche les propriétés featured
- [ ] **SearchScreen** : Recherche fonctionne
- [ ] **MapScreen** : Carte affiche les propriétés
- [ ] **PropertyDetailScreen** : Détails s'affichent
- [ ] **ProfileScreen** : Profil utilisateur s'affiche

### Authentification
- [ ] **LoginScreen** : Connexion fonctionne
- [ ] **RegisterScreen** : Inscription fonctionne
- [ ] **ForgotPasswordScreen** : Réinitialisation fonctionne

### Admin
- [ ] **AdminDashboard** : Statistiques s'affichent
- [ ] **AdminProperties** : Liste des propriétés s'affiche
- [ ] **AddPropertyScreen** : Ajout de propriété fonctionne
- [ ] **AdminAgents** : Liste des agents s'affiche

## Commandes de Debug

### Voir les logs en temps réel
```bash
# Dans le terminal Expo
npx expo start
# Puis appuyez sur 'j' pour voir les logs
```

### Vérifier les erreurs TypeScript
```bash
npx tsc --noEmit
```

### Vérifier les erreurs ESLint
```bash
npx eslint src/
```

## Problèmes Spécifiques à Vérifier

### 1. Hooks qui ne retournent pas de données
**Vérifier** :
- `useProperties` retourne des données
- `useAuth` charge le profil
- `useNotifications` charge les notifications

**Solution** : Vérifier que Supabase retourne des données

### 2. Images ne s'affichent pas
**Vérifier** :
- Bucket Storage créé
- URLs des images correctes
- Permissions Storage configurées

**Solution** : Exécuter `CREER_BUCKET_STORAGE.sql`

### 3. Navigation ne fonctionne pas
**Vérifier** :
- Tous les écrans sont dans `RootStackParamList`
- Les noms de routes correspondent
- Les imports sont corrects

**Solution** : Vérifier `src/navigation/index.tsx`

## Prochaines Étapes

1. **Ouvrir la console Expo** et noter toutes les erreurs
2. **Identifier les écrans** qui ne fonctionnent pas
3. **Vérifier les hooks** qui retournent des erreurs
4. **Corriger chaque problème** un par un

## Besoin d'Aide ?

Envoyez-moi :
- Les erreurs de la console Expo
- Les écrans qui ne fonctionnent pas
- Les actions que vous faites avant l'erreur

Je pourrai créer des corrections spécifiques pour chaque problème.


