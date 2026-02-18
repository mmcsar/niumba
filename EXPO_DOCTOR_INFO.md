# 🔍 Expo Doctor - Outil de Diagnostic

## Qu'est-ce que `expo-doctor` ?

`expo-doctor` est un **outil de diagnostic** créé par Expo pour vérifier la configuration de votre projet Expo/React Native.

## D'où vient-il ?

- **Package npm** : `expo-doctor`
- **Créé par** : L'équipe Expo
- **Disponible via** : `npx expo-doctor` (pas besoin de l'installer)
- **Fonction** : Vérifie automatiquement les problèmes de configuration

## Que fait-il ?

`expo-doctor` vérifie :

1. **Dépendances** :
   - Versions compatibles entre les packages
   - Packages manquants
   - Conflits de versions

2. **Configuration** :
   - `app.json` / `app.config.js`
   - `package.json`
   - Configuration Expo SDK

3. **Problèmes courants** :
   - Versions incompatibles
   - Packages obsolètes
   - Configuration incorrecte

## Comment l'utiliser ?

### Commande de base
```powershell
npx expo-doctor
```

**Note** : `npx` télécharge et exécute temporairement le package sans l'installer globalement.

### Installation locale (optionnel)
```powershell
npm install --save-dev expo-doctor
```

Puis :
```powershell
npx expo-doctor
```

## Exemple de sortie

```
✔ The following packages are up to date:
  - expo@~54.0.32
  - react-native@^0.80.2

⚠ Some packages are out of date:
  - @expo/vector-icons (latest: 15.0.3, installed: 15.0.3)

✔ No issues found with app.json
```

## Utilité pour Niumba

C'est utile pour :
- ✅ Vérifier que tout est bien configuré avant un build
- ✅ Détecter les problèmes de dépendances
- ✅ S'assurer que la configuration est correcte

## Alternative

Si vous préférez ne pas l'utiliser, vous pouvez :
- Vérifier manuellement les dépendances
- Lancer le build directement (EAS détectera aussi certains problèmes)

---

**💡 En résumé** : `expo-doctor` est un outil de diagnostic Expo disponible via npm, que vous pouvez utiliser avec `npx` sans installation.

