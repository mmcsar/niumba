# ✅ Checklist Publication Android & iOS

## 🔧 Configuration Technique

### 1. EAS Build
- [ ] `eas.json` créé ✅ (fichier créé)
- [ ] EAS CLI installé : `npm install -g eas-cli`
- [ ] Connecté à EAS : `eas login`

### 2. Assets
- [ ] `assets/icon.png` (1024x1024) existe
- [ ] `assets/splash-icon.png` existe
- [ ] `assets/adaptive-icon.png` (Android) existe
- [ ] `assets/favicon.png` (Web) existe

### 3. Configuration App
- [ ] `app.json` configuré ✅ (déjà fait)
- [ ] Bundle ID Android : `com.niumba.app` ✅
- [ ] Bundle ID iOS : `com.niumba.app` ✅
- [ ] Version : `1.0.0` ✅

### 4. Permissions
- [ ] Permissions Android configurées
- [ ] Permissions iOS configurées
- [ ] Notifications push configurées

### 5. Variables d'Environnement
- [ ] `.env` créé avec les clés Supabase
- [ ] EAS Secrets configurés : `eas secret:create`

---

## 📱 Android

### Compte & Certificats
- [ ] Compte Google Play Developer créé ($25)
- [ ] Clé de signature Android générée automatiquement par EAS

### Build
- [ ] Build de test : `eas build --platform android --profile preview`
- [ ] Test sur appareil Android
- [ ] Build production : `eas build --platform android --profile production`

### Soumission Google Play
- [ ] App créée dans Google Play Console
- [ ] Description complète
- [ ] Captures d'écran (minimum 2)
- [ ] Icône de l'application
- [ ] Politique de confidentialité
- [ ] Catégorie sélectionnée
- [ ] Version soumise pour révision

---

## 🍎 iOS

### Compte & Certificats
- [ ] Compte Apple Developer créé ($99/an)
- [ ] Certificats iOS générés automatiquement par EAS

### Build
- [ ] Build de test : `eas build --platform ios --profile preview`
- [ ] Test sur appareil iOS
- [ ] Build production : `eas build --platform ios --profile production`

### Soumission App Store
- [ ] App créée dans App Store Connect
- [ ] Description complète
- [ ] Captures d'écran (iPhone & iPad)
- [ ] Icône de l'application
- [ ] Politique de confidentialité
- [ ] Catégorie sélectionnée
- [ ] Version soumise pour révision

---

## 📋 Métadonnées Stores

### Description
- [ ] Titre : "Niumba"
- [ ] Sous-titre (iOS) : "Immobilier Lualaba & Haut-Katanga"
- [ ] Description courte (4000 caractères max)
- [ ] Mots-clés (iOS)

### Visuels
- [ ] Icône 1024x1024
- [ ] Captures d'écran Android (minimum 2)
- [ ] Captures d'écran iOS (iPhone & iPad)
- [ ] Bannière promotionnelle (optionnel)

### Légal
- [ ] Politique de confidentialité (URL)
- [ ] Conditions d'utilisation (URL)
- [ ] Contact support

---

## 🚀 Commandes Rapides

### Installation EAS
```bash
npm install -g eas-cli
eas login
```

### Builds
```bash
# Android Preview
eas build --platform android --profile preview

# Android Production
eas build --platform android --profile production

# iOS Preview
eas build --platform ios --profile preview

# iOS Production
eas build --platform ios --profile production
```

### Soumission
```bash
# Android
eas submit --platform android

# iOS
eas submit --platform ios
```

---

## ⏱️ Temps Estimé

- **Configuration** : 2-3 heures
- **Builds** : 30-60 min par build
- **Soumission** : 1-2 heures
- **Révision Stores** : 1-7 jours

---

## 💰 Coûts

- **Google Play Developer** : $25 (une fois)
- **Apple Developer** : $99/an
- **EAS Build** : Gratuit jusqu'à 30 builds/mois

---

**➡️ Commencez par installer EAS CLI et créer les assets manquants !**


