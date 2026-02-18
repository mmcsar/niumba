# 🎯 Guide - Créer des Propriétés d'Exemple depuis le Dashboard

## ✅ Fonctionnalité Ajoutée

Une nouvelle fonctionnalité a été ajoutée au **Dashboard Admin** pour créer des propriétés d'exemple directement depuis l'interface, sans avoir besoin d'exécuter des scripts SQL manuellement.

## 📍 Où trouver cette fonctionnalité ?

1. **Connectez-vous** avec un compte administrateur
2. **Accédez au Dashboard Admin**
3. **Faites défiler** jusqu'à la section **"Outils de développement"** (Development Tools)
4. **Cliquez sur** "Créer des propriétés d'exemple" (Create Sample Properties)

## 🚀 Comment utiliser

### Étape 1 : Accéder au Dashboard Admin
- Connectez-vous avec un compte admin (`christian@maintenancemc.com` ou `kzadichris@gmail.com`)
- Naviguez vers le Dashboard Admin

### Étape 2 : Créer les propriétés d'exemple
1. Trouvez la section **"Outils de développement"**
2. Cliquez sur **"Créer des propriétés d'exemple"**
3. Une confirmation apparaîtra : **"Cela créera 5 propriétés d'exemple. Continuer ?"**
4. Cliquez sur **"Créer"**

### Étape 3 : Vérifier les résultats
- Un message de succès s'affichera avec le nombre de propriétés créées
- Les statistiques du dashboard seront automatiquement mises à jour
- Les propriétés apparaîtront maintenant dans l'application principale

## 📋 Propriétés d'exemple créées

Le système créera **5 propriétés d'exemple** :

1. ✅ **Villa Moderne Golf** (Lubumbashi) - Featured
   - Type: Maison
   - Prix: $350,000 USD (Vente)
   - 5 chambres, 4 salles de bain

2. ✅ **Appartement Centre-Ville** (Lubumbashi) - Featured
   - Type: Appartement
   - Prix: $1,500 USD/mois (Location)
   - 3 chambres, 2 salles de bain

3. ✅ **Maison Familiale Kolwezi** (Kolwezi)
   - Type: Maison
   - Prix: $180,000 USD (Vente)
   - 4 chambres, 3 salles de bain

4. ✅ **Terrain Commercial Likasi** (Likasi) - Featured
   - Type: Terrain
   - Prix: $75,000 USD (Vente)
   - 2000 m²

5. ✅ **Duplex Moderne Lubumbashi** (Lubumbashi) - Featured
   - Type: Duplex
   - Prix: $2,800 USD/mois (Location)
   - 4 chambres, 3 salles de bain

## 🔍 Vérification

### Dans le Dashboard
- Les statistiques **"Total Propriétés"** et **"Actifs"** devraient augmenter
- Un badge **"Existe"** apparaîtra à côté du bouton si les données existent déjà

### Dans l'Application
- Ouvrez l'écran d'accueil (HomeScreen)
- Les propriétés featured devraient maintenant s'afficher
- Vous pouvez également les voir dans l'écran de recherche (SearchScreen)

## ⚠️ Notes importantes

1. **Propriétaire** : Toutes les propriétés seront créées avec votre compte admin comme propriétaire
2. **Statut** : Toutes les propriétés sont créées avec le statut **"active"**
3. **Duplication** : Si vous cliquez plusieurs fois, certaines propriétés peuvent être dupliquées (c'est normal)
4. **Images** : Les images utilisent des URLs Unsplash (images de démonstration)

## 🐛 Dépannage

### Les propriétés ne s'affichent pas ?
1. Vérifiez que Supabase est bien configuré
2. Vérifiez les logs dans la console pour voir les erreurs
3. Vérifiez que votre compte admin a les bonnes permissions

### Erreur "Supabase n'est pas configuré" ?
- Vérifiez que les clés Supabase sont correctement configurées dans `src/lib/supabase.ts`

### Les propriétés sont créées mais ne s'affichent pas dans l'app ?
- Vérifiez que les propriétés ont bien `is_featured = true` pour les propriétés featured
- Vérifiez que le statut est bien `'active'`
- Rechargez l'application

## 🎉 Avantages

✅ **Pas besoin de SQL** : Créez les propriétés directement depuis l'interface
✅ **Rapide** : 5 propriétés créées en quelques secondes
✅ **Sécurisé** : Seuls les admins peuvent créer des propriétés d'exemple
✅ **Feedback visuel** : Messages de succès/erreur clairs
✅ **Automatique** : Les statistiques sont mises à jour automatiquement

## 📝 Code ajouté

- **Service** : `src/services/sampleDataService.ts`
  - Fonction `createSampleProperties()` : Crée les propriétés
  - Fonction `checkSamplePropertiesExist()` : Vérifie si les données existent
  - Fonction `getSamplePropertiesCount()` : Retourne le nombre de propriétés

- **Dashboard** : `src/screens/admin/AdminDashboard.tsx`
  - Section "Development Tools" ajoutée
  - Bouton pour créer les propriétés d'exemple
  - Indicateur visuel si les données existent déjà

## 🔄 Prochaines améliorations possibles

- [ ] Ajouter la possibilité de supprimer les propriétés d'exemple
- [ ] Créer d'autres types de données d'exemple (agents, utilisateurs, etc.)
- [ ] Personnaliser les propriétés d'exemple avant de les créer
- [ ] Ajouter un historique des créations


