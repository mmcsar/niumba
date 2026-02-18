# 📱 Guide de Publication - Niumba sur Google Play

## 🎯 État Actuel
- ✅ Compte développeur créé
- ✅ Application créée dans Play Console
- ✅ Fichier `.aab` généré et prêt
- ⏳ Configuration à terminer
- ⏳ Test fermé à effectuer
- ⏳ Production à demander

## 📋 Étape 1 : Terminer la Configuration de l'Application

### 1.1 Décrire le Contenu de l'Application

#### Classification du Contenu
- **Type d'application** : Application standard
- **Classification** : Immobilier / Lifestyle
- **Public cible** : Tous publics (ou 13+ selon votre contenu)

#### Cible
- **Pays/territoires** : République Démocratique du Congo (RDC)
- **Langues** : Français (et éventuellement anglais)
- **Appareils** : Smartphones et tablettes

#### Sécurité des Données
- **Collecte de données** : Oui
- **Types de données collectées** :
  - ✅ Informations personnelles (nom, email, téléphone)
  - ✅ Photos et fichiers
  - ✅ Identifiants (ID utilisateur)
  - ✅ Informations de localisation (optionnel)
- **Partage de données** : Non (ou préciser si oui)
- **Sécurité des données** : Chiffrement en transit et au repos (Supabase)

#### Définir les Règles de Confidentialité
- **URL de la politique de confidentialité** : 
  - Option 1 : Créer une page web avec votre politique
  - Option 2 : Utiliser un service comme GitHub Pages
  - Option 3 : Référencer la politique dans l'app (`PrivacyPolicyScreen.tsx`)
  
**Exemple d'URL** : `https://votre-site.com/privacy-policy` ou `https://votre-nom.github.io/niumba-privacy`

### 1.2 Gérer l'Organisation et la Présentation

#### Sélectionner la Catégorie
- **Catégorie principale** : Immobilier / Lifestyle
- **Catégorie secondaire** : (optionnel)

#### Indiquer vos Coordonnées
- **Email de contact** : `mmc@maintenancemc.com`
- **Site web** : (si vous en avez un)
- **Numéro de téléphone** : (optionnel)

#### Configurer une Fiche Play Store

**Nom de l'application** : Niumba

**Description courte** (80 caractères max) :
```
Plateforme immobilière pour la RDC - Trouvez votre propriété idéale
```

**Description complète** (4000 caractères max) :
```
Niumba est la première plateforme immobilière dédiée à la République Démocratique du Congo, spécialement conçue pour les provinces du Haut-Katanga et du Lualaba.

🏠 FONCTIONNALITÉS PRINCIPALES :

• Recherche avancée de propriétés
  - Recherche par ville, type, prix, superficie
  - Filtres multiples (chambres, salles de bain, etc.)
  - Recherche par localisation GPS

• Gestion des rendez-vous
  - Planification de visites en personne ou en vidéo
  - Calendrier intégré
  - Notifications de rappel

• Profils d'agents immobiliers
  - Liste d'agents vérifiés
  - Avis et évaluations
  - Contact direct

• Alertes personnalisées
  - Notifications pour nouvelles propriétés correspondant à vos critères
  - Sauvegarde de recherches

• Interface bilingue
  - Français et Anglais
  - Interface intuitive et moderne

• Mode hors ligne
  - Consultation des propriétés sans connexion
  - Synchronisation automatique

📱 POUR QUI ?

• Acheteurs et locataires recherchant une propriété
• Propriétaires souhaitant mettre en vente ou location
• Agents immobiliers professionnels
• Investisseurs immobiliers

🔒 CONFIDENTIALITÉ ET SÉCURITÉ

Vos données sont protégées et sécurisées. Consultez notre politique de confidentialité dans l'application.

📧 CONTACT

Pour toute question : mmc@maintenancemc.com

Téléchargez Niumba dès maintenant et trouvez la propriété de vos rêves !
```

**Icône de l'application** :
- Format : PNG
- Taille : 512 x 512 pixels
- Fond : Transparent ou couleur de marque
- Pas de texte dans l'icône

**Captures d'écran** (minimum 2, recommandé 4-8) :
- Format : PNG ou JPEG
- Taille : Minimum 320px, maximum 3840px
- Ratio : 16:9 ou 9:16
- Recommandé : 1080 x 1920 pixels (portrait)

**Captures à inclure** :
1. Écran d'accueil avec propriétés en vedette
2. Page de recherche/détails d'une propriété
3. Écran de profil utilisateur
4. Écran de rendez-vous
5. Écran de liste des agents
6. Écran de recherche avancée

**Image de bannière** (optionnel mais recommandé) :
- Format : PNG ou JPEG
- Taille : 1024 x 500 pixels
- Ratio : 2:1

**Graphisme de la fiche** :
- Couleur principale : Bleu (selon votre thème)
- Couleur secondaire : (optionnel)

## 📋 Étape 2 : Tests Internes (Optionnel mais Recommandé)

### 2.1 Créer un Test Interne
1. Allez dans "Tests internes" → "Créer une nouvelle version"
2. Uploadez votre fichier `.aab`
3. Ajoutez des notes de version (ex: "Version initiale - Première publication")
4. Cliquez sur "Enregistrer"

### 2.2 Partager avec des Testeurs
- Ajoutez votre email et ceux de testeurs de confiance
- Les testeurs recevront un lien pour télécharger l'application
- Testez sur vos propres appareils

## 📋 Étape 3 : Test Fermé (OBLIGATOIRE)

### 3.1 Créer un Test Fermé
1. Allez dans "Tests fermés" → "Créer une nouvelle version"
2. Uploadez votre fichier `.aab`
3. Ajoutez des notes de version

### 3.2 Ajouter des Testeurs
**Vous devez avoir au moins 12 testeurs pendant au moins 14 jours**

**Options pour ajouter des testeurs** :
- **Liste d'emails** : Ajoutez les emails de 12+ personnes
- **Groupe Google** : Créez un groupe Google et ajoutez-le
- **Lien de test** : Partagez un lien (mais vous devez quand même avoir 12 testeurs inscrits)

**Stratégie recommandée** :
1. Créez un groupe Google "Niumba Beta Testers"
2. Invitez 15-20 personnes (certaines peuvent ne pas répondre)
3. Partagez le lien d'inscription
4. Vérifiez que vous avez au moins 12 testeurs actifs

### 3.3 Durée du Test Fermé
- **Minimum** : 14 jours
- **Recommandé** : 2-4 semaines pour collecter des retours

### 3.4 Questions à Préparer pour la Demande de Production
Google vous posera des questions sur votre test fermé :
- Nombre de testeurs
- Durée du test
- Problèmes identifiés et corrigés
- Retours des utilisateurs

## 📋 Étape 4 : Demander l'Accès en Production

### 4.1 Prérequis
- ✅ Configuration terminée
- ✅ Test fermé exécuté (12+ testeurs, 14+ jours)
- ✅ Fichier `.aab` prêt

### 4.2 Processus
1. Allez dans "Production" → "Créer une nouvelle version"
2. Uploadez votre fichier `.aab`
3. Remplissez les notes de version
4. Répondez aux questions sur le test fermé
5. Soumettez pour révision

### 4.3 Délai de Révision
- **Première soumission** : 1-3 jours
- **Mises à jour** : Généralement plus rapide

## 📝 Checklist Complète

### Configuration
- [ ] Classification du contenu remplie
- [ ] Cible géographique définie (RDC)
- [ ] Politique de confidentialité fournie
- [ ] Sécurité des données déclarée
- [ ] Catégorie sélectionnée
- [ ] Coordonnées de contact renseignées

### Fiche Play Store
- [ ] Nom de l'application : Niumba
- [ ] Description courte (80 caractères)
- [ ] Description complète (4000 caractères)
- [ ] Icône 512x512 px
- [ ] 2-8 captures d'écran
- [ ] Image de bannière (optionnel)

### Tests
- [ ] Test interne effectué (optionnel)
- [ ] Test fermé créé
- [ ] 12+ testeurs ajoutés
- [ ] Test fermé exécuté pendant 14+ jours
- [ ] Retours collectés et problèmes corrigés

### Production
- [ ] Fichier `.aab` final prêt
- [ ] Notes de version rédigées
- [ ] Questions sur le test fermé préparées
- [ ] Soumission pour révision

## 🎯 Prochaines Actions Immédiates

1. **Commencer par la configuration** :
   - Remplir "Décrire le contenu de l'application"
   - Configurer la fiche Play Store

2. **Préparer les visuels** :
   - Créer l'icône 512x512
   - Prendre 4-8 captures d'écran
   - Créer l'image de bannière (optionnel)

3. **Créer la politique de confidentialité en ligne** :
   - Utiliser GitHub Pages, Netlify, ou votre propre site
   - Mettre le contenu de `PrivacyPolicyScreen.tsx`

4. **Lancer le test fermé** :
   - Créer un groupe Google pour les testeurs
   - Inviter 15-20 personnes
   - Attendre 14 jours minimum

## 📧 Contact

Pour toute question pendant le processus :
- Email : mmc@maintenancemc.com
- Support Google Play : https://support.google.com/googleplay/android-developer

---

**Bonne chance avec la publication de Niumba ! 🚀**

