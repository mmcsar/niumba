# 🚀 Commandes pour la Production - Niumba

## ✅ Configuration Déjà Faite

- ✅ EAS CLI installé
- ✅ Connecté à Expo (compte : mmcsal)
- ✅ Project ID configuré : `5ea6774f-b903-4959-bc2a-9766697cca55`
- ✅ Secrets EAS configurés

## 📱 Commandes de Build

### Build de Test (Preview) - APK
```powershell
eas build --platform android --profile preview
```
**Résultat** : APK pour tester sur appareil Android
**Temps** : 20-40 minutes

### Build de Production - AAB (pour Google Play)
```powershell
eas build --platform android --profile production
```
**Résultat** : Fichier .aab pour Google Play Store
**Temps** : 30-60 minutes

## 📤 Soumission au Google Play Store

### Option 1 : Via EAS (Recommandé)
```powershell
eas submit --platform android
```
**Prérequis** : 
- Compte Google Play Developer créé
- App créée dans Google Play Console
- Build de production terminé

### Option 2 : Manuellement
1. Télécharger le fichier .aab depuis https://expo.dev
2. Aller dans Google Play Console
3. Uploader le fichier .aab
4. Compléter les métadonnées
5. Soumettre pour révision

## 🔍 Vérifications

### Voir les builds
```powershell
eas build:list
```

### Voir les détails d'un build
```powershell
eas build:view [BUILD_ID]
```

### Vérifier les secrets
```powershell
eas secret:list
```

### Vérifier le projet
```powershell
eas project:info
```

## ⚠️ Note PowerShell

PowerShell n'utilise pas `&&` comme séparateur. Utilisez `;` ou exécutez les commandes séparément :

```powershell
# ❌ Ne fonctionne pas
npm install --global eas-cli && eas build

# ✅ Fonctionne
npm install --global eas-cli; eas build

# ✅ Ou exécutez séparément
npm install --global eas-cli
eas build
```

## 🎯 Prochaines Étapes

1. **Build de test** (si pas encore fait) :
   ```powershell
   eas build --platform android --profile preview
   ```

2. **Build de production** (après tests réussis) :
   ```powershell
   eas build --platform android --profile production
   ```

3. **Soumission** (après build de production) :
   ```powershell
   eas submit --platform android
   ```

---

**✅ Tout est prêt ! Vous pouvez lancer le build de production maintenant.**

