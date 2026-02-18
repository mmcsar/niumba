# 📱 Télécharger l'APK et créer un QR code

## 📦 Étape 1 : Télécharger l'APK

### Lien direct de téléchargement :

```
https://expo.dev/artifacts/eas/ocaSBMXsJcC6j5pGEJVTP8.apk
```

### Comment télécharger :

**Option A : Lien direct**
1. Cliquez sur le lien ci-dessus
2. L'APK se téléchargera automatiquement
3. Enregistrez-le dans un dossier accessible (ex: `C:\Users\mmcsa\Downloads\`)

**Option B : Via Expo Dashboard**
1. Allez sur : https://expo.dev/accounts/mmcsal/projects/niumba/builds
2. Trouvez le build `b3b850f6-9815-49d0-a3e1-1b6a524ff501`
3. Cliquez sur "Download" pour télécharger l'APK

---

## 🔗 Étape 2 : Héberger l'APK (pour le QR code)

Pour créer un QR code, vous devez héberger l'APK quelque part pour avoir un lien permanent.

### Option A : Google Drive (Recommandé - Simple)

1. **Uploadez l'APK sur Google Drive**
   - Créez un dossier ou utilisez votre Drive
   - Uploadez le fichier `ocaSBMXsJcC6j5pGEJVTP8.apk`
   - Renommez-le en `niumba.apk` (optionnel mais plus clair)

2. **Partagez le fichier**
   - Clic droit sur le fichier → "Partager"
   - Changez les permissions en **"Toute personne avec le lien"**
   - Copiez le lien

3. **Obtenez le lien direct**
   - Le lien Google Drive ressemble à : `https://drive.google.com/file/d/FILE_ID/view?usp=sharing`
   - Pour un lien direct de téléchargement, utilisez :
     ```
     https://drive.google.com/uc?export=download&id=FILE_ID
     ```
   - Ou utilisez un service comme : https://gdrive-direct-link.com/

**Exemple de lien final :**
```
https://drive.google.com/uc?export=download&id=VOTRE_FILE_ID
```

---

### Option B : Dropbox

1. **Uploadez l'APK sur Dropbox**
2. **Partagez le fichier**
   - Clic droit → "Copier le lien"
3. **Modifiez le lien**
   - Remplacez `www.dropbox.com` par `dl.dropboxusercontent.com`
   - Supprimez `?dl=0` à la fin
   - Ajoutez `?dl=1` à la fin

**Exemple :**
```
https://dl.dropboxusercontent.com/s/FILE_ID/niumba.apk?dl=1
```

---

### Option C : GitHub Releases

1. **Créez un repository GitHub** (si vous n'en avez pas)
2. **Créez une release**
3. **Uploadez l'APK**
4. **Copiez le lien de téléchargement direct**

**Exemple :**
```
https://github.com/votre-username/niumba/releases/download/v1.0.1/niumba.apk
```

---

### Option D : Votre propre serveur

1. **Uploadez l'APK sur votre serveur**
2. **Créez un lien direct** : `https://votresite.com/downloads/niumba.apk`

---

## 📱 Étape 3 : Créer le QR code

Une fois l'APK hébergé et le lien obtenu :

### Méthode 1 : Service en ligne (Recommandé)

1. **Allez sur un générateur de QR code :**
   - QR Code Generator : https://www.qr-code-generator.com/
   - QRCode Monkey : https://www.qrcode-monkey.com/
   - QR Code API : https://goqr.me/api/

2. **Créez le QR code :**
   - Choisissez "URL"
   - Collez le lien de téléchargement de l'APK
   - Générez le QR code
   - Téléchargez l'image

3. **Personnalisez (optionnel) :**
   - Ajoutez votre logo au centre
   - Changez les couleurs (bleu Niumba #006AFF)
   - Ajoutez un cadre

---

### Méthode 2 : Google Charts API (Rapide)

**Format :**
```
https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=VOTRE_LIEN_ICI
```

**Exemple :**
```
https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=https://drive.google.com/uc?export=download&id=VOTRE_FILE_ID
```

Remplacez `VOTRE_LIEN_ICI` par votre lien de téléchargement.

---

## ✅ Checklist complète

### Téléchargement APK
- [ ] Télécharger l'APK depuis Expo
- [ ] Vérifier que le fichier est complet (~28-30 Mo)
- [ ] Enregistrer dans un dossier accessible

### Hébergement
- [ ] Choisir une méthode d'hébergement (Google Drive recommandé)
- [ ] Uploadez l'APK
- [ ] Obtenir le lien de téléchargement direct
- [ ] Tester le lien (ouvrir dans un navigateur)

### QR Code
- [ ] Créer le QR code avec le lien
- [ ] Tester le QR code (scanner avec un téléphone)
- [ ] Vérifier que le téléchargement fonctionne
- [ ] Télécharger l'image du QR code

---

## 🎯 Instructions rapides

### Pour Google Drive (Méthode la plus simple) :

1. **Téléchargez l'APK** depuis Expo
2. **Uploadez sur Google Drive**
3. **Partagez** avec "Toute personne avec le lien"
4. **Obtenez le lien direct** (utilisez gdrive-direct-link.com si besoin)
5. **Créez le QR code** sur qr-code-generator.com
6. **Téléchargez le QR code**

---

## 📋 Exemple complet

### 1. Lien APK Expo :
```
https://expo.dev/artifacts/eas/ocaSBMXsJcC6j5pGEJVTP8.apk
```

### 2. Après hébergement sur Google Drive :
```
https://drive.google.com/uc?export=download&id=1ABC123XYZ...
```

### 3. QR code généré :
- Image PNG du QR code
- Peut être imprimée ou partagée en ligne

---

## 💡 Conseils

### Pour le QR code :
- **Taille minimale** : 300x300 px pour une bonne lisibilité
- **Contraste** : Assurez-vous que le QR code est bien visible
- **Testez toujours** : Scannez avec votre téléphone avant de partager

### Pour l'hébergement :
- **Google Drive** : Simple et gratuit
- **Dropbox** : Aussi simple
- **Votre serveur** : Plus de contrôle mais nécessite un serveur

### Pour le partage :
- **Imprimez** le QR code pour les événements
- **Partagez en ligne** sur les réseaux sociaux
- **Affichez** dans vos locaux
- **Envoyez par email** avec instructions

---

## 🚀 Action immédiate

1. **Téléchargez l'APK** : https://expo.dev/artifacts/eas/ocaSBMXsJcC6j5pGEJVTP8.apk
2. **Uploadez sur Google Drive**
3. **Obtenez le lien direct**
4. **Créez le QR code** : https://www.qr-code-generator.com/
5. **Testez et partagez** !

Souhaitez-vous que je vous guide étape par étape pour l'une de ces actions ? 📱✨



