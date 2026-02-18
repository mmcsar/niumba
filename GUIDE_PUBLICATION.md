# 🚀 Guide de Publication - Android & iOS

## 📋 État Actuel

✅ **Déjà Configuré** :
- ✅ Expo configuré (`app.json`)
- ✅ Bundle identifiers (Android & iOS)
- ✅ Version de base (1.0.0)
- ✅ Backend Supabase complet
- ✅ Application fonctionnelle

---

## ❌ Ce qui Manque pour la Publication

### 1. **EAS Build Configuration** ⚠️ IMPORTANT
- [ ] Créer `eas.json` pour les builds
- [ ] Configurer les profils de build (development, preview, production)

### 2. **Assets (Icônes & Splash Screens)** ⚠️ IMPORTANT
- [ ] Vérifier que `assets/icon.png` existe (1024x1024)
- [ ] Vérifier que `assets/splash-icon.png` existe
- [ ] Vérifier que `assets/adaptive-icon.png` existe (Android)
- [ ] Vérifier que `assets/favicon.png` existe (Web)

### 3. **Permissions Android** ⚠️ IMPORTANT
- [ ] Configurer les permissions dans `app.json`
- [ ] Créer `android/app/src/main/AndroidManifest.xml` si nécessaire

### 4. **Permissions iOS** ⚠️ IMPORTANT
- [ ] Configurer les permissions dans `app.json`
- [ ] Créer `Info.plist` si nécessaire

### 5. **Notifications Push** ⚠️ IMPORTANT
- [ ] Configurer les certificats APNs (iOS)
- [ ] Configurer Firebase Cloud Messaging (Android)
- [ ] Ajouter les plugins Expo Notifications

### 6. **Variables d'Environnement**
- [ ] Créer `.env` pour les clés API
- [ ] Configurer EAS Secrets pour les builds

### 7. **Comptes Développeur**
- [ ] Compte Google Play Developer ($25 une fois)
- [ ] Compte Apple Developer ($99/an)

### 8. **Métadonnées Store**
- [ ] Description de l'application
- [ ] Captures d'écran
- [ ] Icône de l'application
- [ ] Politique de confidentialité
- [ ] Conditions d'utilisation

---

## 🚀 Étapes de Publication

### Étape 1 : Installer EAS CLI

```bash
npm install -g eas-cli
eas login
```

### Étape 2 : Configurer EAS Build

Créer `eas.json` (voir fichier créé)

### Étape 3 : Préparer les Assets

Vérifier que tous les assets existent dans `assets/`

### Étape 4 : Build Android

```bash
eas build --platform android --profile production
```

### Étape 5 : Build iOS

```bash
eas build --platform ios --profile production
```

### Étape 6 : Soumettre aux Stores

- **Google Play** : Via Google Play Console
- **App Store** : Via App Store Connect

---

## 📝 Checklist Complète

### Configuration Technique
- [ ] `eas.json` créé et configuré
- [ ] Assets (icônes, splash) présents
- [ ] Permissions configurées
- [ ] Variables d'environnement configurées
- [ ] Notifications push configurées

### Comptes & Certificats
- [ ] Compte Google Play Developer créé
- [ ] Compte Apple Developer créé
- [ ] Certificats iOS générés
- [ ] Clés Android générées

### Builds
- [ ] Build Android réussi
- [ ] Build iOS réussi
- [ ] Tests sur appareils réels

### Soumission Stores
- [ ] Google Play : App créée et soumise
- [ ] App Store : App créée et soumise
- [ ] Métadonnées complètes
- [ ] Captures d'écran ajoutées

---

**➡️ Commencez par créer `eas.json` et vérifier les assets !**


