# Guide de Build de Production - Niumba

## ✅ Vérifications préalables

Avant de créer un build de production, assurez-vous que :

1. ✅ Toutes les erreurs sont corrigées (OptimizedImage, etc.)
2. ✅ Les variables d'environnement Supabase sont configurées
3. ✅ Le numéro de version est à jour dans `app.json`
4. ✅ Les assets (icônes, splash screen) sont présents
5. ✅ Vous êtes connecté à EAS : `eas login`

## 📱 Build Android (Production)

### Option 1 : Build APK (pour tests)
```bash
# Modifier eas.json temporairement pour production avec APK
eas build --profile production --platform android
```

### Option 2 : Build AAB (pour Google Play Store)
```bash
# Utilise le profil production par défaut (app-bundle)
npm run build:prod:android
# ou
eas build --profile production --platform android
```

**Note** : Le build AAB est requis pour la soumission sur Google Play Store.

## 🍎 Build iOS (Production)

```bash
npm run build:prod:ios
# ou
eas build --profile production --platform ios
```

**Note** : Pour iOS, vous devez avoir :
- Un compte Apple Developer actif
- Les certificats et provisioning profiles configurés
- L'identifiant de bundle configuré dans `app.json` (déjà fait : `com.niumba.app`)

## 🔧 Configuration des variables d'environnement

Si vous utilisez des variables d'environnement (Supabase, etc.), créez un fichier `.env.production` ou configurez-les dans EAS :

```bash
# Voir les secrets actuels
eas secret:list

# Ajouter un secret
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "votre-url"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "votre-key"
```

## 📦 Après le build

1. **Télécharger le build** : Le lien de téléchargement sera fourni après le build
2. **Tester le build** : Installez l'APK/AAB sur un appareil de test
3. **Soumettre aux stores** :
   - **Google Play** : Utilisez le AAB généré
   - **Apple App Store** : Utilisez `eas submit --platform ios`

## 🚀 Commandes rapides

```bash
# Build Android (AAB pour production)
npm run build:prod:android

# Build iOS (pour production)
npm run build:prod:ios

# Build pour les deux plateformes
eas build --profile production --platform all

# Soumettre à Google Play
eas submit --platform android

# Soumettre à App Store
eas submit --platform ios
```

## ⚠️ Notes importantes

1. **Version Code** : Android utilise `versionCode` dans `app.json` (actuellement 1)
2. **Version** : iOS et Android utilisent `version` dans `app.json` (actuellement 1.0.0)
3. **Temps de build** : Comptez 15-30 minutes pour un build de production
4. **Coûts** : Les builds EAS peuvent avoir des coûts selon votre plan

## 🔍 Vérification finale

Avant de lancer le build, vérifiez :

- [ ] Version mise à jour dans `app.json`
- [ ] Toutes les fonctionnalités testées en développement
- [ ] Variables d'environnement configurées
- [ ] Assets (icônes, splash) présents
- [ ] Connecté à EAS (`eas whoami`)

## 📞 Support

En cas de problème :
- Documentation EAS : https://docs.expo.dev/build/introduction/
- Status EAS : https://status.expo.dev/


