# 📱 Guide de configuration iOS pour Niumba

## ✅ Configuration actuelle

Votre projet a déjà une configuration iOS de base dans `app.json` :

```json
"ios": {
  "supportsTablet": true,
  "bundleIdentifier": "com.niumba.app",
  "infoPlist": {
    "NSLocationWhenInUseUsageDescription": "...",
    "NSLocationAlwaysUsageDescription": "...",
    "NSPhotoLibraryUsageDescription": "...",
    "NSCameraUsageDescription": "..."
  }
}
```

---

## 📋 Étapes pour configurer iOS

### Étape 1 : Compte développeur Apple

**Prérequis :**
- ✅ Compte Apple ID
- ✅ Adhésion au programme développeur Apple (99$/an)
- ✅ Certificat de développeur

**Si vous n'avez pas encore :**
1. Allez sur : https://developer.apple.com/programs/
2. Inscrivez-vous au programme développeur
3. Payez les 99$ USD/an
4. Attendez la validation (1-2 jours)

---

### Étape 2 : Vérifier la configuration app.json

**Votre configuration actuelle est bonne, mais vous pouvez ajouter :**

```json
"ios": {
  "supportsTablet": true,
  "bundleIdentifier": "com.niumba.app",
  "buildNumber": "1",  // À ajouter
  "infoPlist": {
    "NSLocationWhenInUseUsageDescription": "...",
    "NSLocationAlwaysUsageDescription": "...",
    "NSPhotoLibraryUsageDescription": "...",
    "NSCameraUsageDescription": "..."
  }
}
```

---

### Étape 3 : Configurer les credentials iOS dans EAS

**EAS Build peut gérer automatiquement les credentials, mais vous devez :**

1. **Connecter votre compte Apple :**
   ```bash
   eas credentials
   ```

2. **Sélectionner iOS**

3. **EAS vous guidera pour :**
   - Créer un App ID
   - Générer des certificats
   - Créer des profils de provisioning

**Note :** EAS peut faire tout cela automatiquement si vous avez un compte développeur Apple.

---

### Étape 4 : Construire la version iOS

**Une fois les credentials configurés :**

```bash
# Build de production iOS
npm run build:prod:ios

# Ou avec EAS directement
eas build --profile production --platform ios
```

**Options :**
- **Simulator** : Pour tester sur simulateur
- **Device** : Pour installer sur un iPhone physique
- **App Store** : Pour soumettre sur l'App Store

---

### Étape 5 : Créer l'application sur App Store Connect

**Avant de soumettre :**

1. Allez sur : https://appstoreconnect.apple.com
2. Créez une nouvelle application
3. Remplissez les informations :
   - **Nom** : Niumba
   - **Bundle ID** : com.niumba.app
   - **SKU** : niumba-ios-001
   - **Langue principale** : Français

---

### Étape 6 : Soumettre sur l'App Store

**Une fois le build terminé :**

```bash
eas submit --platform ios
```

**EAS vous guidera pour :**
- Connecter App Store Connect
- Sélectionner l'application
- Soumettre le build

---

## 🔧 Configuration supplémentaire recommandée

### Ajouter buildNumber dans app.json

```json
"ios": {
  "supportsTablet": true,
  "bundleIdentifier": "com.niumba.app",
  "buildNumber": "1",
  ...
}
```

### Ajouter des icônes et splash screen

**Vérifiez que vous avez :**
- ✅ `assets/icon.png` (1024x1024 pour iOS)
- ✅ `assets/splash-icon.png`
- ✅ `assets/adaptive-icon.png`

---

## 📱 Informations nécessaires pour App Store

### Métadonnées de base :
- **Nom** : Niumba
- **Sous-titre** : Application Immobilière
- **Description** : (Utilisez le texte de votre fiche Play Store)
- **Mots-clés** : immobilier, propriété, location, vente, maison, appartement
- **Catégorie** : Lifestyle / Immobilier
- **Prix** : Gratuit
- **Langues** : Français, Anglais

### Captures d'écran :
- iPhone 6.7" (iPhone 14 Pro Max)
- iPhone 6.5" (iPhone 11 Pro Max)
- iPhone 5.5" (iPhone 8 Plus)
- iPad Pro 12.9"

### Icône :
- 1024x1024 px (sans transparence)

---

## ⚠️ Différences iOS vs Android

### Permissions :
- iOS utilise `infoPlist` au lieu de `AndroidManifest.xml`
- Les descriptions sont déjà configurées ✅

### Version :
- iOS utilise `buildNumber` (numéro de build)
- Android utilise `versionCode` (numéro de version)

### Bundle ID :
- iOS : `com.niumba.app` ✅
- Android : `com.niumba.app` ✅
- **Identiques** : Parfait ! ✅

---

## 🚀 Commandes utiles

### Construire iOS :
```bash
# Production
npm run build:prod:ios

# Preview
npm run build:preview:ios

# Development
npm run build:dev:ios
```

### Gérer les credentials :
```bash
eas credentials
```

### Soumettre sur App Store :
```bash
eas submit --platform ios
```

### Vérifier la configuration :
```bash
npx expo-doctor
```

---

## 📋 Checklist iOS

### Avant de construire :
- [ ] Compte développeur Apple actif (99$/an)
- [ ] Configuration iOS dans app.json ✅
- [ ] Bundle identifier configuré ✅
- [ ] Permissions configurées ✅
- [ ] Icônes et splash screen prêts

### Pour construire :
- [ ] Credentials iOS configurés dans EAS
- [ ] Build iOS lancé
- [ ] Build réussi

### Pour soumettre :
- [ ] Application créée sur App Store Connect
- [ ] Métadonnées remplies
- [ ] Captures d'écran ajoutées
- [ ] Politique de confidentialité ajoutée
- [ ] Build soumis via EAS

---

## 💡 Conseils

### 1. Testez d'abord sur simulateur
```bash
eas build --profile development --platform ios
```

### 2. Testez sur un iPhone physique
```bash
eas build --profile preview --platform ios
```

### 3. Soumettez en production
```bash
eas build --profile production --platform ios
eas submit --platform ios
```

---

## 🎯 Prochaines étapes

1. **Vérifiez votre compte développeur Apple**
   - Si vous n'avez pas : Inscrivez-vous
   - Si vous avez : Connectez-vous

2. **Configurez les credentials iOS**
   ```bash
   eas credentials
   ```

3. **Construisez la première version**
   ```bash
   npm run build:prod:ios
   ```

4. **Créez l'application sur App Store Connect**

5. **Soumettez le build**
   ```bash
   eas submit --platform ios
   ```

---

## ✅ Résumé

**Configuration actuelle :**
- ✅ Bundle ID configuré
- ✅ Permissions configurées
- ✅ EAS configuré pour iOS

**À faire :**
- ⏳ Compte développeur Apple (si pas encore)
- ⏳ Configurer credentials iOS
- ⏳ Construire la version iOS
- ⏳ Soumettre sur App Store

**Prêt à commencer ?** 🚀



