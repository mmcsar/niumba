# Guide de Test Android - Niumba

## 🚀 Lancer l'application sur Android

### Option 1: Expo Go (Développement rapide)
```bash
# Démarrer le serveur de développement
npx expo start

# Appuyer sur 'a' pour ouvrir sur Android
# OU scanner le QR code avec Expo Go
```

### Option 2: Development Build (Recommandé pour les fonctionnalités complètes)
```bash
# Si vous avez déjà un build de développement installé
npx expo start --dev-client

# Sinon, créer un build de développement
eas build --profile development --platform android
```

## 📱 Tester l'édition de propriété avec changement de photos

### Étapes de test :

1. **Se connecter en tant qu'admin**
   - Aller dans le profil
   - Se connecter avec un compte admin
   - Accéder au Dashboard Admin

2. **Accéder à la gestion des propriétés**
   - Cliquer sur "Gérer les propriétés" ou "Admin Properties"
   - Sélectionner une propriété

3. **Éditer une propriété**
   - Cliquer sur le bouton "Éditer" (icône crayon) sur une propriété
   - L'écran d'édition s'ouvre

4. **Tester le changement de photos**
   
   **a) Voir les photos existantes**
   - Les photos actuelles de la propriété s'affichent
   - La première photo a un badge "Principale"
   
   **b) Supprimer une photo**
   - Cliquer sur le bouton "X" (cercle rouge) en haut à droite d'une photo
   - La photo est retirée de la liste
   - Si c'est une photo existante, elle sera supprimée du storage Supabase
   
   **c) Ajouter des photos depuis la galerie**
   - Cliquer sur le bouton "Ajouter de la galerie"
   - Sélectionner une ou plusieurs photos (max 10 au total)
   - Les nouvelles photos apparaissent dans la liste
   
   **d) Prendre une photo avec la caméra**
   - Si aucune photo n'existe, le bouton "Prendre une photo" est visible
   - Cliquer dessus et prendre une photo
   - La photo est ajoutée à la liste

5. **Modifier les autres informations**
   - Changer le titre, prix, description, etc.
   - Modifier le statut (Actif, En attente, Vendu)

6. **Sauvegarder**
   - Cliquer sur "Sauver" en haut à droite
   - Un indicateur de progression apparaît pendant l'upload des nouvelles photos
   - Un message de succès confirme la mise à jour
   - Retour automatique à la liste des propriétés

## ✅ Points à vérifier

### Fonctionnalités photos :
- [ ] Les photos existantes s'affichent correctement
- [ ] Le badge "Principale" apparaît sur la première photo
- [ ] La suppression d'une photo fonctionne
- [ ] L'ajout depuis la galerie fonctionne
- [ ] L'ajout depuis la caméra fonctionne (si disponible)
- [ ] L'upload des nouvelles photos fonctionne
- [ ] La limite de 10 photos est respectée
- [ ] Les permissions de galerie/caméra sont demandées

### Autres fonctionnalités :
- [ ] La modification des champs texte fonctionne
- [ ] La sauvegarde met à jour la propriété dans Supabase
- [ ] Le log d'activité est créé
- [ ] Les erreurs sont affichées correctement

## 🐛 Problèmes courants et solutions

### Les photos ne s'affichent pas
- Vérifier la connexion internet
- Vérifier que Supabase Storage est configuré
- Vérifier les permissions RLS sur le bucket `property-images`

### L'upload échoue
- Vérifier que l'utilisateur est connecté
- Vérifier que le bucket Supabase existe
- Vérifier les permissions du bucket

### Les permissions ne sont pas demandées
- Vérifier dans les paramètres Android que les permissions sont accordées
- Réinstaller l'app si nécessaire

### L'app crash lors de l'édition
- Vérifier les logs dans le terminal
- Vérifier que toutes les dépendances sont installées
- Vérifier que Supabase est correctement configuré

## 📊 Commandes utiles

```bash
# Voir les logs en temps réel
npx expo start

# Nettoyer le cache
npx expo start --clear

# Vérifier les erreurs TypeScript
npx tsc --noEmit

# Vérifier les erreurs ESLint
npx eslint src/
```

## 🔍 Vérification dans Supabase

Après avoir modifié une propriété, vérifier dans Supabase :

1. **Table `properties`**
   - La propriété doit être mise à jour avec les nouvelles valeurs
   - Le champ `images` doit contenir le nouveau tableau d'URLs
   - Le champ `updated_at` doit être mis à jour

2. **Table `activity_logs`**
   - Un nouvel enregistrement doit être créé avec l'action "update"
   - Les détails des changements doivent être enregistrés

3. **Storage `property-images`**
   - Les nouvelles images doivent être uploadées dans le dossier `{userId}/`
   - Les anciennes images supprimées ne doivent plus être présentes

## 📝 Notes importantes

- Les photos sont uploadées dans Supabase Storage avec le format : `{userId}/{timestamp}_{random}.jpg`
- La première photo de la liste est considérée comme photo principale
- Maximum 10 photos par propriété
- Les permissions de galerie et caméra sont requises

## 🎯 Scénarios de test recommandés

1. **Test complet** : Modifier toutes les informations + changer toutes les photos
2. **Test minimal** : Modifier seulement le titre
3. **Test photos uniquement** : Ajouter/supprimer des photos sans modifier le reste
4. **Test limite** : Ajouter 10 photos (maximum)
5. **Test erreur** : Essayer de sauvegarder sans titre (doit afficher une erreur)

---

**Bon test ! 🚀**


