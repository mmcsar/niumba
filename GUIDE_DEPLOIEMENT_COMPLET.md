# 🚀 Guide Complet de Déploiement - Niumba

## ✅ Vérification Pré-Déploiement

### 1. Configuration EAS ✅
- [x] EAS CLI installé
- [x] Connecté à Expo (compte : mmcsal)
- [x] Project ID configuré : `5ea6774f-b903-4959-bc2a-9766697cca55`
- [x] Secrets EAS configurés (Supabase URL et ANON_KEY)

### 2. Configuration Application ✅
- [x] `app.json` configuré
- [x] Version : `1.0.0`
- [x] Version code Android : `1`
- [x] Bundle ID : `com.niumba.app`
- [x] `eas.json` configuré avec profils

### 3. Sécurité ✅
- [x] Clés Supabase sécurisées (variables d'environnement)
- [x] Storage policies améliorées
- [x] RLS configuré dans Supabase

### 4. Code ✅
- [x] Aucune erreur TypeScript/linter
- [x] Toutes les fonctionnalités complètes
- [x] Politique de confidentialité créée

## 📋 Configuration Finale Avant Build

### Vérifier les Assets

Assurez-vous que ces fichiers existent dans `assets/` :
- [ ] `icon.png` (1024x1024)
- [ ] `splash-icon.png`
- [ ] `adaptive-icon.png` (1024x1024)
- [ ] `notification-icon.png` (optionnel)

### Vérifier app.json

Les valeurs importantes :
```json
{
  "name": "Niumba",
  "version": "1.0.0",
  "android": {
    "package": "com.niumba.app",
    "versionCode": 1
  }
}
```

## 🚀 Étapes de Déploiement

### Étape 1 : Build de Production

```powershell
eas build --platform android --profile production
```

**Ce qui va se passer** :
1. EAS va demander de générer un Keystore (répondre `Y`)
2. Compilation de l'application (30-60 minutes)
3. Génération du fichier `.aab` pour Google Play
4. Lien de téléchargement disponible

**Temps estimé** : 30-60 minutes

### Étape 2 : Télécharger le Build

Une fois le build terminé :
1. Aller sur https://expo.dev
2. Se connecter avec votre compte
3. Aller dans "Builds"
4. Télécharger le fichier `.aab`

### Étape 3 : Créer l'App dans Google Play Console

1. **Aller sur** : https://play.google.com/console
2. **Créer une application** :
   - Nom : "Niumba"
   - Langue par défaut : Français
   - Type : Application
   - Gratuit ou payant : Gratuit

### Étape 4 : Compléter les Métadonnées

**Informations de base** :
- Titre : "Niumba"
- Description courte : "Plateforme immobilière pour Haut-Katanga et Lualaba, RDC"
- Description complète : (voir `METADONNEES_GOOGLE_PLAY.md`)
- Catégorie : Immobilier / Real Estate
- Email : mmc@maintenancemc.com

**Contenu** :
- [ ] Captures d'écran (minimum 2)
- [ ] Icône 512x512
- [ ] Politique de confidentialité (URL)
- [ ] Classification de contenu

### Étape 5 : Uploader le Build

**Option A : Via EAS (Recommandé)**
```powershell
eas submit --platform android
```

**Option B : Manuellement**
1. Dans Google Play Console
2. Aller dans "Production" ou "Testing"
3. Cliquer sur "Créer une version"
4. Uploader le fichier `.aab`

### Étape 6 : Soumettre pour Révision

1. Compléter le formulaire de contenu
2. Vérifier toutes les informations
3. Cliquer sur "Soumettre pour révision"
4. Attendre l'approbation (1-7 jours)

## 📝 Checklist Complète

### Avant le Build
- [ ] Assets vérifiés (icônes, splash)
- [ ] Version correcte dans `app.json`
- [ ] Secrets EAS configurés
- [ ] Code testé localement

### Build de Production
- [ ] Build lancé : `eas build --platform android --profile production`
- [ ] Keystore généré (répondre `Y`)
- [ ] Build terminé avec succès
- [ ] Fichier `.aab` téléchargé

### Google Play Console
- [ ] Compte Google Play Developer créé
- [ ] App créée dans la console
- [ ] Métadonnées complétées
- [ ] Captures d'écran uploadées
- [ ] Politique de confidentialité accessible
- [ ] Build uploadé
- [ ] App soumise pour révision

## 🔧 Commandes Utiles

### Vérifier la configuration
```powershell
eas project:info
eas secret:list
```

### Voir les builds
```powershell
eas build:list
```

### Voir les détails d'un build
```powershell
eas build:view [BUILD_ID]
```

### Soumettre au store
```powershell
eas submit --platform android
```

## ⚠️ Points d'Attention

1. **Keystore** : Une fois généré, ne le perdez pas ! EAS le gère automatiquement
2. **Version** : Incrémentez `versionCode` pour chaque nouvelle version
3. **Métadonnées** : Préparez-les à l'avance pour gagner du temps
4. **Politique de confidentialité** : Doit être accessible via URL publique
5. **Révision** : Peut prendre 1-7 jours, soyez patient

## 🎯 Timeline

| Étape | Durée |
|-------|-------|
| Build de production | 30-60 min |
| Création app Google Play | 15-30 min |
| Compléter métadonnées | 30-60 min |
| Upload et soumission | 15-30 min |
| Révision Google Play | 1-7 jours |

**Total travail** : ~2-3 heures
**Total avec attente** : 1-2 semaines

## 💡 Conseils

1. **Testez d'abord** : Si possible, faites un build preview avant la production
2. **Préparez tout** : Métadonnées, captures d'écran, politique de confidentialité
3. **Vérifiez deux fois** : Relisez toutes les métadonnées avant soumission
4. **Soyez patient** : La révision peut prendre du temps

---

**✅ Prêt à déployer ? Commençons par vérifier la configuration finale !**

