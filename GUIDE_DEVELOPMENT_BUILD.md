# Guide Development Build - Niumba

## 📱 Configuration pour les Notifications Push

Le projet est maintenant configuré pour supporter les notifications push via un **development build**. Les notifications ne fonctionnent **PAS** dans Expo Go (SDK 53+), mais fonctionneront dans un development build.

## ✅ Ce qui a été configuré

1. **Plugin `expo-notifications` activé** dans `app.json`
2. **Configuration EAS Build** améliorée dans `eas.json`
3. **Scripts npm** ajoutés pour faciliter les builds
4. **Service de notifications** optimisé pour détecter l'environnement

## 🚀 Commandes disponibles

### Démarrer en mode développement (avec dev client)
```bash
npm run start:dev
```

### Build Development Build

#### Android
```bash
npm run build:dev:android
```

#### iOS
```bash
npm run build:dev:ios
```

### Build Preview (pour tester)

#### Android
```bash
npm run build:preview:android
```

#### iOS
```bash
npm run build:preview:ios
```

### Build Production

#### Android
```bash
npm run build:prod:android
```

#### iOS
```bash
npm run build:prod:ios
```

## 📋 Étapes pour créer un Development Build

### 1. Installer EAS CLI (si pas déjà fait)
```bash
npm install -g eas-cli
```

### 2. Se connecter à Expo
```bash
eas login
```

### 3. Configurer le projet (si première fois)
```bash
eas build:configure
```

### 4. Créer un Development Build Android
```bash
npm run build:dev:android
```

### 5. Installer le build sur ton appareil
- EAS te donnera un lien de téléchargement
- Installe l'APK sur ton appareil Android
- Ouvre l'app "Expo Dev Client" installée

### 6. Démarrer le serveur de développement
```bash
npm run start:dev
```

### 7. Scanner le QR code
- Ouvre Expo Dev Client sur ton téléphone
- Scanne le QR code affiché dans le terminal
- L'app se chargera avec toutes les fonctionnalités, y compris les notifications push !

## 🔔 Tester les Notifications

Une fois le development build installé :

1. Les notifications push fonctionneront automatiquement
2. Le service `notificationService.ts` détectera qu'on n'est pas dans Expo Go
3. Les notifications seront activées et fonctionnelles

## ⚠️ Notes importantes

- **Expo Go** : Les notifications push ne fonctionnent PAS (limitation SDK 53+)
- **Development Build** : Les notifications push fonctionnent ✅
- **Production Build** : Les notifications push fonctionnent ✅

## 🐛 Dépannage

### L'erreur expo-notifications apparaît toujours
- C'est normal dans Expo Go, ignore-la
- Utilise un development build pour les notifications

### Le build échoue
- Vérifie que tu es connecté : `eas whoami`
- Vérifie ta configuration : `eas build:configure`
- Consulte les logs : `eas build:list`

### Les notifications ne fonctionnent pas dans le dev build
- Vérifie les permissions dans les paramètres de l'appareil
- Vérifie que le plugin est bien activé dans `app.json`
- Redémarre l'app après l'installation

## 📚 Ressources

- [Documentation EAS Build](https://docs.expo.dev/build/introduction/)
- [Documentation Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [Documentation expo-notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)


