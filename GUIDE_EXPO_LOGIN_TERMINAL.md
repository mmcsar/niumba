# 🔐 Guide : Se Connecter à Expo dans le Terminal

## 📋 Méthode 1 : Se Connecter Manuellement

### Étape 1 : Ouvrir le Terminal
Ouvrez PowerShell ou votre terminal dans le répertoire du projet :
```powershell
cd C:\Users\mmcsa\Niumba
```

### Étape 2 : Se Connecter à Expo
Tapez cette commande dans votre terminal :
```powershell
npx expo login
```

### Étape 3 : Entrer vos Identifiants
Expo va vous demander :
- **Email** : Votre adresse email Expo
- **Password** : Votre mot de passe Expo

### Étape 4 : Démarrer Expo avec Tunnel
Une fois connecté, démarrez Expo :
```powershell
npx expo start --tunnel
```

---

## 📋 Méthode 2 : Continuer Anonymement (Plus Rapide)

Si vous n'avez pas de compte Expo ou voulez démarrer rapidement :

### Étape 1 : Démarrer Expo avec Tunnel
```powershell
npx expo start --tunnel
```

### Étape 2 : Choisir "Proceed anonymously"
Quand Expo demande de se connecter, choisissez **"Proceed anonymously"**

---

## 🔍 Vérifier votre Statut de Connexion

Pour voir si vous êtes connecté :
```powershell
npx expo whoami
```

Pour vous déconnecter :
```powershell
npx expo logout
```

---

## 💡 Recommandation

Pour le **développement local**, vous pouvez utiliser **"Proceed anonymously"** sans problème.

Pour la **publication** et les **builds**, vous devrez vous connecter avec un compte Expo.

---

## 🚀 Commandes Rapides

```powershell
# Se connecter
npx expo login

# Démarrer avec tunnel
npx expo start --tunnel

# Vérifier le statut
npx expo whoami
```


