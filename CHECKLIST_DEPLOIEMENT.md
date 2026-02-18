# ✅ Checklist Complète de Déploiement - Niumba

## 📊 État Actuel de l'Application

### ✅ Points Forts
- ✅ Code sans erreurs TypeScript/linter
- ✅ Fonctionnalités principales complètes
- ✅ Politique de confidentialité ajoutée
- ✅ Configuration Supabase opérationnelle
- ✅ Navigation complète
- ✅ Support bilingue (FR/EN)
- ✅ Gestion des rôles (admin, editor, user)
- ✅ Système de logging et analytics

### ⚠️ Points à Vérifier/Corriger

---

## 🔧 1. Configuration EAS (Expo Application Services)

### ⚠️ Action Requise
- [ ] **CRITIQUE** : Remplacer `"YOUR_PROJECT_ID_HERE"` dans `app.json` ligne 71
  ```bash
  # Obtenir le project ID
  eas init
  # Ou créer un nouveau projet EAS
  eas build:configure
  ```

### Configuration
- [x] `eas.json` créé et configuré
- [ ] EAS CLI installé : `npm install -g eas-cli`
- [ ] Connecté à EAS : `eas login`
- [ ] Project ID EAS configuré dans `app.json`

---

## 🔐 2. Variables d'Environnement et Sécurité

### ⚠️ Action Requise
- [ ] **SÉCURITÉ** : Déplacer les clés Supabase vers des variables d'environnement
  - Actuellement hardcodées dans `src/lib/supabase.ts`
  - Créer un fichier `.env` (ne pas commiter)
  - Configurer EAS Secrets pour la production

### Fichiers à créer/modifier
- [ ] Créer `.env` :
  ```
  EXPO_PUBLIC_SUPABASE_URL=https://mbenioxoabiusjdqzhtk.supabase.co
  EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- [ ] Modifier `src/lib/supabase.ts` pour utiliser `process.env.EXPO_PUBLIC_SUPABASE_URL`
- [ ] Ajouter `.env` à `.gitignore`
- [ ] Configurer EAS Secrets :
  ```bash
  eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://..."
  eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "eyJ..."
  ```

---

## 📱 3. Assets et Icônes

### Vérification des fichiers
- [ ] `assets/icon.png` (1024x1024) existe et est de bonne qualité
- [ ] `assets/splash-icon.png` existe
- [ ] `assets/adaptive-icon.png` (Android) existe
- [ ] `assets/favicon.png` (Web) existe
- [ ] `assets/notification-icon.png` existe (pour notifications push)

### Qualité recommandée
- Icône : 1024x1024 px, PNG, sans transparence
- Splash : 1242x2436 px (iPhone) ou 1080x1920 px (Android)
- Adaptive Icon : 1024x1024 px avec zone sûre de 512x512 px

---

## 🗄️ 4. Base de Données Supabase

### Vérifications
- [x] Tables créées (properties, profiles, agents, etc.)
- [x] RLS (Row Level Security) configuré
- [x] Storage buckets créés (`property-images`, `avatars`, `chat-attachments`)
- [x] RLS policies pour storage
- [x] Fonctions SQL créées (`get_city_property_counts`, `get_analytics_stats`, etc.)
- [ ] **Vérifier** : Toutes les migrations SQL ont été exécutées
- [ ] **Vérifier** : Données de test supprimées (si nécessaire)
- [ ] **Vérifier** : Index créés pour les performances

### SQL Scripts à vérifier
- [x] `CREATE_ACTIVITY_LOGS_TABLE.sql`
- [x] `INSERT_CITIES.sql`
- [x] `FUNCTION_COUNT_CITIES.sql`
- [x] `STORAGE_SETUP.sql`
- [x] `FIX_CHAT_TABLES.sql`
- [x] `CREATE_PROPERTY_ALERTS.sql`
- [x] `CREATE_PRICE_HISTORY.sql`
- [x] `CREATE_SAVED_SEARCHES.sql`
- [x] `ADD_SUSPENSION_COLUMNS.sql`

---

## 🧪 5. Tests et Validation

### Tests Fonctionnels
- [ ] Authentification (login, register, logout)
- [ ] Navigation principale (tous les écrans)
- [ ] Recherche de propriétés
- [ ] Affichage des propriétés
- [ ] Création/modification de propriétés (admin)
- [ ] Gestion des agents (admin)
- [ ] Rendez-vous (appointments)
- [ ] Messages/Chat
- [ ] Notifications
- [ ] Upload d'images
- [ ] Dashboard admin (toutes les sections)
- [ ] Analytics
- [ ] Activity logs

### Tests de Performance
- [ ] Temps de chargement initial < 3 secondes
- [ ] Navigation fluide (pas de lag)
- [ ] Images chargent correctement
- [ ] Pas de fuites mémoire
- [ ] Cache fonctionne correctement

### Tests Multi-plateformes
- [ ] Android (téléphone)
- [ ] iOS (iPhone) - si disponible
- [ ] Différentes tailles d'écran

---

## 📋 6. Métadonnées pour les Stores

### Google Play Store
- [ ] **Titre** : "Niumba"
- [ ] **Description courte** (80 caractères max)
- [ ] **Description complète** (4000 caractères max)
- [ ] **Catégorie** : Immobilier / Real Estate
- [ ] **Mots-clés** : immobilier, propriété, Lubumbashi, Haut-Katanga, Lualaba
- [ ] **Contact email** : mmc@maintenancemc.com
- [ ] **URL Politique de confidentialité** : (à créer ou utiliser une URL)
- [ ] **URL Conditions d'utilisation** : (à créer ou utiliser une URL)
- [ ] **Captures d'écran** (minimum 2, maximum 8)
  - Écran d'accueil
  - Liste de propriétés
  - Détails d'une propriété
  - Recherche avancée
  - Dashboard admin (optionnel)
- [ ] **Icône** : 512x512 px
- [ ] **Bannière promotionnelle** (optionnel) : 1024x500 px

### Apple App Store
- [ ] **Nom** : "Niumba"
- [ ] **Sous-titre** : "Immobilier Lualaba & Haut-Katanga"
- [ ] **Description** (4000 caractères max)
- [ ] **Mots-clés** (100 caractères max, séparés par des virgules)
- [ ] **Catégorie primaire** : Immobilier
- [ ] **Catégorie secondaire** : (optionnel)
- [ ] **Contact support** : mmc@maintenancemc.com
- [ ] **URL Politique de confidentialité** : (à créer)
- [ ] **URL Conditions d'utilisation** : (à créer)
- [ ] **Captures d'écran iPhone** (6.7", 6.5", 5.5")
- [ ] **Captures d'écran iPad** (12.9", 11")
- [ ] **Icône** : 1024x1024 px
- [ ] **Aperçu vidéo** (optionnel)

---

## 💰 7. Comptes Développeur

### Google Play Developer
- [ ] Compte créé ($25 - paiement unique)
- [ ] Informations de paiement configurées
- [ ] Profil développeur complété
- [ ] Adresse et informations légales

### Apple Developer
- [ ] Compte créé ($99/an)
- [ ] Informations de paiement configurées
- [ ] Profil développeur complété
- [ ] Certificats et provisioning profiles (gérés par EAS)

---

## 🚀 8. Builds de Production

### Préparation
- [ ] Tous les tests passent
- [ ] Version incrémentée si nécessaire (`app.json` : `"version": "1.0.0"`)
- [ ] Version code Android incrémenté (`app.json` : `"versionCode": 1`)
- [ ] Variables d'environnement configurées dans EAS

### Builds
- [ ] **Android Preview** : `eas build --platform android --profile preview`
  - Tester sur appareil Android
  - Vérifier toutes les fonctionnalités
- [ ] **Android Production** : `eas build --platform android --profile production`
  - Génère un fichier `.aab` pour Google Play
- [ ] **iOS Preview** : `eas build --platform ios --profile preview` (si iPhone disponible)
- [ ] **iOS Production** : `eas build --platform ios --profile production` (si iPhone disponible)

---

## 📤 9. Soumission aux Stores

### Google Play Store
- [ ] App créée dans Google Play Console
- [ ] Toutes les métadonnées complétées
- [ ] Captures d'écran uploadées
- [ ] Politique de confidentialité URL fournie
- [ ] Version de production uploadée
- [ ] Formulaire de contenu complété
- [ ] Classification de contenu (PEGI/ESRB)
- [ ] Soumis pour révision

### Apple App Store
- [ ] App créée dans App Store Connect
- [ ] Toutes les métadonnées complétées
- [ ] Captures d'écran uploadées (toutes les tailles)
- [ ] Politique de confidentialité URL fournie
- [ ] Version de production uploadée
- [ ] Informations de conformité complétées
- [ ] Soumis pour révision

---

## 🔍 10. Vérifications Finales

### Code
- [x] Aucune erreur TypeScript
- [x] Aucune erreur de linter
- [ ] Tous les `console.log` remplacés par `logHelper` (vérifier)
- [ ] Pas de données de test hardcodées
- [ ] Pas de clés API exposées

### Configuration
- [ ] `app.json` complet et correct
- [ ] `eas.json` configuré
- [ ] `package.json` à jour
- [ ] Toutes les dépendances installées

### Documentation
- [x] Politique de confidentialité créée
- [ ] Conditions d'utilisation créées (optionnel mais recommandé)
- [ ] README.md à jour (optionnel)

---

## 📝 11. Actions Immédiates Requises

### 🔴 CRITIQUE (Avant déploiement)
1. **Configurer le Project ID EAS** dans `app.json`
2. **Déplacer les clés Supabase** vers des variables d'environnement
3. **Vérifier tous les assets** existent et sont de bonne qualité
4. **Tester l'application** sur un appareil réel

### 🟡 IMPORTANT (Avant publication)
1. **Créer les comptes développeur** (Google Play et/ou Apple)
2. **Préparer les métadonnées** (descriptions, captures d'écran)
3. **Créer une URL pour la politique de confidentialité** (ou héberger le contenu)
4. **Faire des builds de test** et valider

### 🟢 RECOMMANDÉ (Pour améliorer)
1. **Créer des conditions d'utilisation**
2. **Ajouter plus de captures d'écran**
3. **Créer une vidéo de démonstration** (optionnel)
4. **Préparer un plan marketing** pour le lancement

---

## ⏱️ Timeline Estimée

- **Configuration EAS et variables** : 1-2 heures
- **Préparation des assets** : 2-3 heures
- **Tests complets** : 4-6 heures
- **Builds de test** : 1-2 heures
- **Préparation métadonnées** : 2-3 heures
- **Builds de production** : 1-2 heures
- **Soumission aux stores** : 1-2 heures
- **Révision des stores** : 1-7 jours (selon les stores)

**Total estimé** : 12-20 heures de travail + temps d'attente des stores

---

## 🎯 Prochaines Étapes Recommandées

1. **Aujourd'hui** :
   - Configurer le Project ID EAS
   - Déplacer les clés Supabase vers `.env`
   - Vérifier les assets

2. **Cette semaine** :
   - Faire des tests complets
   - Créer les comptes développeur
   - Préparer les métadonnées

3. **Avant publication** :
   - Builds de test
   - Validation finale
   - Builds de production
   - Soumission aux stores

---

**✅ L'application est techniquement prête, mais nécessite ces configurations finales avant le déploiement !**
