# 🔐 Guide : Connexion Expo dans le Terminal

## 📋 Options Disponibles

Quand Expo vous demande de vous connecter, vous avez 2 options :

### Option 1 : Se connecter avec un compte Expo (Recommandé)

1. **Sélectionnez "Log in"** dans le menu
2. **Entrez vos identifiants Expo** :
   - Email de votre compte Expo
   - Mot de passe
3. **Avantages** :
   - Accès à toutes les fonctionnalités
   - Historique des builds
   - Meilleure sécurité

### Option 2 : Continuer anonymement (Plus rapide)

1. **Sélectionnez "Proceed anonymously"** dans le menu
2. **Avantages** :
   - Pas besoin de compte
   - Démarrage immédiat
   - Fonctionne pour le développement local

## 🚀 Commandes

### Se connecter à Expo
```bash
npx expo login
```

### Se déconnecter
```bash
npx expo logout
```

### Vérifier votre statut
```bash
npx expo whoami
```

### Démarrer sans authentification
```bash
npx expo start --offline
```

## 💡 Recommandation

Pour le développement, vous pouvez **"Proceed anonymously"** sans problème. L'application fonctionnera normalement.

Pour la publication et les builds, vous devrez vous connecter avec un compte Expo.

## ⚠️ Note

Si vous choisissez "Proceed anonymously", vous verrez peut-être un avertissement, mais l'application fonctionnera quand même.


