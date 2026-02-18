# 🚀 Plan de Production - Niumba

## ✅ État Actuel

### Configuration Complétée
- ✅ EAS Project ID configuré : `5ea6774f-b903-4959-bc2a-9766697cca55`
- ✅ Secrets EAS configurés (Supabase URL et ANON_KEY)
- ✅ Code sécurisé (storage policies améliorées)
- ✅ Politique de confidentialité créée
- ✅ `eas.json` configuré

## 📋 Prochaines Étapes pour la Production

### Phase 1 : Vérification et Préparation (30 min)

#### 1.1 Vérifier les Assets
- [ ] `assets/icon.png` (1024x1024) existe
- [ ] `assets/splash-icon.png` existe
- [ ] `assets/adaptive-icon.png` existe
- [ ] `assets/notification-icon.png` existe

#### 1.2 Vérifier la Configuration
- [x] `app.json` : Version `1.0.0` ✅
- [x] `app.json` : Version code Android `1` ✅
- [x] `app.json` : Bundle ID `com.niumba.app` ✅
- [x] `eas.json` : Profils configurés ✅

### Phase 2 : Build de Test (1-2 heures)

#### 2.1 Build Preview Android
```bash
eas build --platform android --profile preview
```

**Objectifs** :
- Tester que les secrets EAS fonctionnent
- Vérifier que l'app se connecte à Supabase
- Tester les fonctionnalités principales
- Valider les performances

**Temps estimé** : 20-40 minutes (build) + 30-60 minutes (tests)

#### 2.2 Tests à Effectuer
- [ ] Installation sur appareil Android
- [ ] Authentification (login/register)
- [ ] Navigation entre écrans
- [ ] Recherche de propriétés
- [ ] Upload d'images
- [ ] Dashboard admin
- [ ] Toutes les fonctionnalités principales

### Phase 3 : Préparation Google Play Store (2-3 heures)

#### 3.1 Compte Google Play Developer
- [ ] Créer le compte ($25 - paiement unique)
- [ ] Compléter le profil développeur
- [ ] Configurer les informations de paiement

#### 3.2 Métadonnées de l'App
- [ ] **Titre** : "Niumba"
- [ ] **Description courte** (80 caractères max)
- [ ] **Description complète** (4000 caractères max)
- [ ] **Catégorie** : Immobilier / Real Estate
- [ ] **Mots-clés** : immobilier, propriété, Lubumbashi, Haut-Katanga, Lualaba
- [ ] **Contact email** : mmc@maintenancemc.com
- [ ] **URL Politique de confidentialité** : (à créer ou héberger)
- [ ] **Captures d'écran** (minimum 2, maximum 8)
- [ ] **Icône** : 512x512 px

#### 3.3 Captures d'Écran Requises
- [ ] Écran d'accueil
- [ ] Liste de propriétés
- [ ] Détails d'une propriété
- [ ] Recherche avancée
- [ ] Dashboard admin (optionnel)

### Phase 4 : Build de Production (1-2 heures)

#### 4.1 Build Production Android
```bash
eas build --platform android --profile production
```

**Résultat** : Fichier `.aab` (Android App Bundle) pour Google Play

**Temps estimé** : 30-60 minutes

#### 4.2 Vérification Finale
- [ ] Le build s'est terminé sans erreur
- [ ] Le fichier `.aab` est téléchargeable
- [ ] Taille du fichier raisonnable (< 100 MB)

### Phase 5 : Soumission Google Play Store (1-2 heures)

#### 5.1 Créer l'App dans Google Play Console
- [ ] Créer une nouvelle app
- [ ] Remplir toutes les métadonnées
- [ ] Uploader les captures d'écran
- [ ] Uploader l'icône
- [ ] Ajouter la politique de confidentialité

#### 5.2 Uploader le Build
```bash
eas submit --platform android
```

Ou manuellement :
- [ ] Uploader le fichier `.aab` dans Google Play Console
- [ ] Remplir le formulaire de contenu
- [ ] Classification de contenu (PEGI/ESRB)
- [ ] Soumettre pour révision

#### 5.3 Révision Google Play
- **Temps d'attente** : 1-7 jours
- **Suivi** : Dans Google Play Console

## 📊 Timeline Global

| Phase | Durée | Statut |
|-------|-------|--------|
| Vérification | 30 min | ⏳ À faire |
| Build de test | 1-2h | ⏳ À faire |
| Préparation Store | 2-3h | ⏳ À faire |
| Build production | 1-2h | ⏳ À faire |
| Soumission | 1-2h | ⏳ À faire |
| Révision Google Play | 1-7 jours | ⏳ Attente |

**Total travail** : ~6-10 heures
**Total avec attente** : 1-2 semaines

## 🎯 Actions Immédiates

### Aujourd'hui
1. Vérifier les assets (icônes, splash screen)
2. Lancer le build de test : `eas build --platform android --profile preview`
3. Tester l'APK sur un appareil Android

### Cette Semaine
1. Créer le compte Google Play Developer ($25)
2. Préparer les métadonnées (descriptions, captures d'écran)
3. Build de production : `eas build --platform android --profile production`

### Avant Publication
1. Soumettre l'app : `eas submit --platform android`
2. Attendre la révision Google Play

## 💡 Conseils

1. **Build de test d'abord** : Ne pas sauter cette étape, elle permet de détecter les problèmes
2. **Métadonnées** : Préparer les descriptions et captures d'écran à l'avance
3. **Politique de confidentialité** : Héberger le contenu sur une URL accessible
4. **Version** : Commencer par 1.0.0, puis incrémenter pour les mises à jour

## ✅ Checklist Finale Avant Soumission

- [ ] Build de test réussi
- [ ] Tous les tests passés
- [ ] Compte Google Play créé
- [ ] Métadonnées complètes
- [ ] Captures d'écran préparées
- [ ] Politique de confidentialité accessible
- [ ] Build de production créé
- [ ] App soumise pour révision

---

**🚀 Prêt à commencer ? Commençons par vérifier les assets et lancer le build de test !**

