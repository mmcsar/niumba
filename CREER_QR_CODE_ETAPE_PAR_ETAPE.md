# 📱 Créer un QR code pour l'APK - Guide étape par étape

## 🎯 Objectif

Créer un QR code qui permet aux utilisateurs de télécharger directement l'APK Niumba en le scannant.

---

## 📋 Étapes détaillées

### Étape 1 : Télécharger l'APK

**Lien de téléchargement :**
```
https://expo.dev/artifacts/eas/ocaSBMXsJcC6j5pGEJVTP8.apk
```

**Action :**
1. Cliquez sur le lien ci-dessus
2. L'APK se téléchargera (~28-30 Mo)
3. Enregistrez-le dans un dossier accessible (ex: `C:\Users\mmcsa\Downloads\`)

---

### Étape 2 : Héberger l'APK (pour avoir un lien permanent)

#### Option A : Google Drive (Recommandé - Le plus simple)

**1. Uploadez l'APK :**
   - Allez sur https://drive.google.com
   - Cliquez sur "Nouveau" → "Téléverser un fichier"
   - Sélectionnez l'APK téléchargé
   - Attendez la fin du téléchargement

**2. Partagez le fichier :**
   - Clic droit sur le fichier → "Partager"
   - Cliquez sur "Modifier" à côté de "Accès restreint"
   - Sélectionnez **"Toute personne avec le lien"**
   - Cliquez sur "Terminé"
   - Copiez le lien de partage

**3. Obtenez le lien direct de téléchargement :**

   **Méthode 1 : Service en ligne (Simple)**
   - Allez sur : https://gdrive-direct-link.com/
   - Collez le lien Google Drive
   - Cliquez sur "Generate Direct Link"
   - Copiez le lien direct généré

   **Méthode 2 : Modification manuelle**
   - Le lien Google Drive ressemble à :
     ```
     https://drive.google.com/file/d/FILE_ID/view?usp=sharing
     ```
   - Remplacez par :
     ```
     https://drive.google.com/uc?export=download&id=FILE_ID
     ```
   - Remplacez `FILE_ID` par l'ID du fichier dans votre lien

**Exemple de lien final :**
```
https://drive.google.com/uc?export=download&id=1ABC123XYZ789...
```

---

#### Option B : Dropbox (Alternative)

**1. Uploadez l'APK sur Dropbox**
**2. Partagez le fichier :**
   - Clic droit → "Copier le lien"
**3. Modifiez le lien :**
   - Remplacez `www.dropbox.com` par `dl.dropboxusercontent.com`
   - Supprimez `?dl=0` à la fin
   - Ajoutez `?dl=1` à la fin

**Exemple :**
```
https://dl.dropboxusercontent.com/s/FILE_ID/niumba.apk?dl=1
```

---

### Étape 3 : Créer le QR code

#### Méthode 1 : QR Code Generator (Recommandé)

**1. Allez sur :** https://www.qr-code-generator.com/

**2. Créez le QR code :**
   - Dans "Type de contenu", choisissez **"URL"**
   - Dans le champ "Votre URL", collez le lien de téléchargement direct
   - Exemple : `https://drive.google.com/uc?export=download&id=...`

**3. Personnalisez (optionnel) :**
   - Cliquez sur "Couleurs" pour changer les couleurs
   - Utilisez le bleu Niumba : `#006AFF`
   - Ajoutez votre logo au centre (optionnel)
   - Ajustez la taille

**4. Téléchargez :**
   - Cliquez sur "Télécharger"
   - Choisissez le format (PNG recommandé)
   - Téléchargez l'image

---

#### Méthode 2 : QRCode Monkey (Avec plus d'options)

**1. Allez sur :** https://www.qrcode-monkey.com/

**2. Créez le QR code :**
   - Choisissez "URL"
   - Collez le lien de téléchargement
   - Personnalisez le design :
     - Couleurs
     - Logo au centre
     - Style
     - Taille

**3. Téléchargez :**
   - Cliquez sur "Créer le QR code"
   - Téléchargez en PNG ou SVG

---

#### Méthode 3 : Google Charts API (Rapide mais basique)

**Format :**
```
https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=VOTRE_LIEN
```

**Exemple :**
```
https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=https://drive.google.com/uc?export=download&id=FILE_ID
```

Remplacez `VOTRE_LIEN` par votre lien de téléchargement direct.

**Avantage :** Très rapide, pas besoin de site
**Inconvénient :** Moins de personnalisation

---

### Étape 4 : Tester le QR code

**Important : Testez toujours avant de partager !**

1. **Téléchargez l'image du QR code**
2. **Ouvrez-la sur votre ordinateur**
3. **Scannez avec votre téléphone :**
   - Utilisez l'appareil photo (Android/iOS)
   - Ou une app de scan QR code
4. **Vérifiez que le lien fonctionne :**
   - Le téléchargement doit démarrer
   - Ou rediriger vers la page de téléchargement

---

## ✅ Checklist complète

### Avant de créer le QR code :
- [ ] APK téléchargé depuis Expo
- [ ] APK hébergé (Google Drive, Dropbox, etc.)
- [ ] Lien direct de téléchargement obtenu
- [ ] Lien testé (ouvrir dans un navigateur)

### Création du QR code :
- [ ] QR code créé avec le lien
- [ ] QR code testé (scanné avec un téléphone)
- [ ] Téléchargement fonctionne
- [ ] Image du QR code téléchargée

### Après création :
- [ ] QR code prêt à être partagé
- [ ] Instructions pour utilisateurs préparées

---

## 🎨 Personnalisation recommandée

### Pour Niumba :

**Couleurs :**
- Couleur principale : `#006AFF` (Bleu Niumba)
- Couleur de fond : Blanc ou `#FFFFFF`

**Logo (optionnel) :**
- Ajoutez le logo Niumba au centre
- Taille : 20-30% du QR code

**Taille :**
- Minimum : 300x300 px
- Recommandé : 500x500 px pour impression
- Pour écran : 200x200 px suffit

---

## 📱 Instructions pour les utilisateurs

Quand ils scannent le QR code, ils doivent :

1. **Autoriser l'installation depuis des sources inconnues**
   - Paramètres → Sécurité → Sources inconnues (Android)
   - Ou : Paramètres → Applications → Installer des applications inconnues

2. **Scanner le QR code**
   - Utiliser l'appareil photo
   - Ou une app de scan QR code

3. **Télécharger et installer**
   - Cliquer sur le lien
   - Télécharger l'APK
   - Installer l'application

---

## 🚀 Action immédiate

### Pour créer le QR code maintenant :

**Option rapide (sans hébergement) :**
1. Utilisez le lien Expo directement
2. Créez le QR code : https://www.qr-code-generator.com/
3. Collez : `https://expo.dev/artifacts/eas/ocaSBMXsJcC6j5pGEJVTP8.apk`
4. Téléchargez le QR code

**Note :** Le lien Expo peut expirer, donc hébergez l'APK pour un lien permanent.

**Option recommandée (avec hébergement) :**
1. Téléchargez l'APK
2. Uploadez sur Google Drive
3. Obtenez le lien direct
4. Créez le QR code avec ce lien
5. Testez et partagez

---

## 💡 Conseils

- **Testez toujours** le QR code avant de le partager
- **Utilisez un lien permanent** (hébergé) plutôt qu'un lien temporaire
- **Personnalisez** avec vos couleurs pour la reconnaissance de marque
- **Ajoutez des instructions** pour les utilisateurs (comment installer)

---

## 📋 Résumé

1. **Téléchargez** l'APK : https://expo.dev/artifacts/eas/ocaSBMXsJcC6j5pGEJVTP8.apk
2. **Hébergez** sur Google Drive (recommandé)
3. **Obtenez** le lien direct de téléchargement
4. **Créez** le QR code : https://www.qr-code-generator.com/
5. **Testez** le QR code
6. **Partagez** !

Souhaitez-vous que je vous guide étape par étape pour l'une de ces actions ? 📱✨



