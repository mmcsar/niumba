# 🚀 Guide pour Build de Test - Niumba

## ✅ Prérequis Vérifiés

- ✅ EAS CLI installé et connecté
- ✅ Project ID configuré : `5ea6774f-b903-4959-bc2a-9766697cca55`
- ✅ Secrets EAS configurés :
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `eas.json` configuré correctement
- ✅ `app.json` configuré

## 📱 Build de Test Android (Preview)

### Commande à exécuter

```bash
eas build --platform android --profile preview
```

### Ce qui va se passer

1. **EAS va** :
   - Vérifier votre configuration
   - Utiliser les secrets configurés
   - Créer un build Android (APK)
   - Le build prendra environ **20-40 minutes**

2. **Vous recevrez** :
   - Un lien pour télécharger l'APK
   - Un QR code pour installer directement sur votre téléphone

### Options pendant le build

- **Local build** (plus rapide, nécessite Android SDK) :
  ```bash
  eas build --platform android --profile preview --local
  ```

- **Voir les logs en temps réel** :
  ```bash
  eas build --platform android --profile preview --non-interactive
  ```

## 🧪 Tests à Effectuer Après le Build

### 1. Installation
- [ ] Installer l'APK sur un appareil Android
- [ ] Vérifier que l'app démarre correctement

### 2. Connexion Supabase
- [ ] Vérifier que l'app se connecte à Supabase
- [ ] Tester l'authentification (login/register)
- [ ] Vérifier que les données se chargent

### 3. Fonctionnalités Principales
- [ ] Navigation entre les écrans
- [ ] Recherche de propriétés
- [ ] Affichage des propriétés
- [ ] Upload d'images (si testé)
- [ ] Dashboard admin (si compte admin)

### 4. Vérification des Secrets
- [ ] Vérifier dans les logs que les secrets sont bien injectés
- [ ] Confirmer qu'il n'y a pas d'erreurs de connexion

## 📊 Vérifier le Statut du Build

```bash
# Voir tous vos builds
eas build:list

# Voir les détails d'un build spécifique
eas build:view [BUILD_ID]
```

## 🔍 Dépannage

### Si le build échoue

1. **Vérifier les logs** :
   ```bash
   eas build:view [BUILD_ID]
   ```

2. **Vérifier les secrets** :
   ```bash
   eas secret:list
   ```

3. **Vérifier la configuration** :
   ```bash
   eas project:info
   ```

### Erreurs courantes

- **"Secret not found"** : Vérifier que les secrets sont bien créés
- **"Invalid project ID"** : Vérifier `app.json` ligne 71
- **"Build timeout"** : Réessayer, parfois les serveurs sont occupés

## 🎯 Prochaines Étapes Après le Test

Si le build de test fonctionne :

1. **Build de production** :
   ```bash
   eas build --platform android --profile production
   ```

2. **Soumission au Google Play Store** :
   ```bash
   eas submit --platform android
   ```

## ⏱️ Temps Estimé

- **Build preview** : 20-40 minutes
- **Tests** : 30-60 minutes
- **Total** : ~1-2 heures

## 💡 Conseils

1. **Premier build** : Faites-le quand vous avez du temps (peut prendre jusqu'à 1h)
2. **Builds suivants** : Plus rapides grâce au cache
3. **Notifications** : EAS vous enverra un email quand le build est prêt
4. **Suivi** : Vous pouvez suivre le build sur https://expo.dev

---

**✅ Tout est prêt pour le build de test !**

Exécutez simplement :
```bash
eas build --platform android --profile preview
```

Et attendez que le build soit terminé. Vous recevrez un lien pour télécharger l'APK.

