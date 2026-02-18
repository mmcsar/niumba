# ✅ Ajout de la Photo de Profil pour les Agents

## 🎯 Fonctionnalités Ajoutées

### 1. **Sélection de Photo dans le Formulaire d'Ajout** ✅
**Emplacement** : `AdminAgentsScreen.tsx` - Modal "Ajouter un agent"

**Fonctionnalités** :
- ✅ Interface de sélection de photo de profil
- ✅ Options : Galerie ou Caméra
- ✅ Aperçu de la photo sélectionnée
- ✅ Bouton pour supprimer la photo sélectionnée
- ✅ Upload automatique lors de la création

### 2. **Sélection de Photo dans le Formulaire d'Édition** ✅
**Emplacement** : `AdminAgentsScreen.tsx` - Modal "Modifier l'agent"

**Fonctionnalités** :
- ✅ Affichage de la photo actuelle de l'agent
- ✅ Possibilité de changer la photo (Galerie ou Caméra)
- ✅ Aperçu de la nouvelle photo sélectionnée
- ✅ Bouton pour supprimer la photo
- ✅ Upload automatique lors de la mise à jour

### 3. **Upload et Stockage** ✅
**Fonctionnalités** :
- ✅ Upload vers Supabase Storage (bucket `property-images`, dossier `avatars`)
- ✅ Génération d'URL publique pour la photo
- ✅ Mise à jour du champ `avatar_url` dans la table `profiles`
- ✅ Gestion des erreurs d'upload

## 📝 Fichiers Modifiés

### `src/screens/admin/AdminAgentsScreen.tsx`
- ✅ Import de `pickImage`, `takePhoto`, `uploadImage` depuis `imageService`
- ✅ Ajout de `avatarUri` au state `newAgent`
- ✅ Ajout de `avatarUri` au state `editAgent`
- ✅ Fonction `handlePickAvatar()` pour gérer la sélection de photo
- ✅ Mise à jour de `addNewAgent()` pour uploader la photo
- ✅ Mise à jour de `updateAgentProfile()` pour uploader la photo
- ✅ Interface de sélection de photo dans le formulaire d'ajout
- ✅ Interface de sélection de photo dans le formulaire d'édition
- ✅ Styles pour l'interface de sélection (`avatarSelector`, `avatarPreview`, `avatarPlaceholder`, `removeAvatarButton`)

## 🎨 Interface Utilisateur

### Formulaire d'Ajout
- **Position** : Après le champ "Téléphone"
- **Apparence** : Cercle avec bordure en pointillés
- **États** :
  - Vide : Icône caméra + texte "Ajouter une photo"
  - Photo sélectionnée : Aperçu de la photo + bouton de suppression

### Formulaire d'Édition
- **Position** : Après le champ "Téléphone"
- **Apparence** : Cercle avec bordure en pointillés
- **États** :
  - Photo existante : Affichage de la photo actuelle
  - Nouvelle photo sélectionnée : Aperçu de la nouvelle photo
  - Pas de photo : Icône caméra + texte "Ajouter une photo"

### Options de Sélection
Lors du clic sur la zone de photo, un menu apparaît avec :
- **Galerie** : Ouvrir la galerie de photos
- **Caméra** : Prendre une photo avec la caméra
- **Annuler** : Fermer le menu

## 🔄 Flux de Fonctionnement

### Création d'Agent avec Photo
1. **Sélectionner la photo** : Cliquer sur la zone de photo
2. **Choisir la source** : Galerie ou Caméra
3. **Aperçu** : La photo sélectionnée s'affiche
4. **Créer l'agent** : Cliquer sur "Ajouter l'agent"
5. **Upload** : La photo est uploadée vers Supabase Storage
6. **Sauvegarde** : L'URL de la photo est enregistrée dans le profil

### Modification de Photo d'Agent
1. **Ouvrir l'édition** : Cliquer sur "Modifier l'agent"
2. **Voir la photo actuelle** : La photo existante s'affiche
3. **Changer la photo** : Cliquer sur la zone de photo
4. **Sélectionner une nouvelle photo** : Galerie ou Caméra
5. **Aperçu** : La nouvelle photo s'affiche
6. **Mettre à jour** : Cliquer sur "Mettre à jour l'agent"
7. **Upload** : La nouvelle photo est uploadée
8. **Sauvegarde** : L'URL de la nouvelle photo remplace l'ancienne

## 📋 Détails Techniques

### State Management
```typescript
// Formulaire d'ajout
const [newAgent, setNewAgent] = useState({
  // ... autres champs
  avatarUri: null as string | null,
});

// Formulaire d'édition
const [editAgent, setEditAgent] = useState({
  // ... autres champs
  avatarUri: null as string | null,
});
```

### Fonction de Sélection
```typescript
const handlePickAvatar = async (isEdit: boolean = false) => {
  Alert.alert(
    'Select Photo',
    '',
    [
      {
        text: 'Gallery',
        onPress: async () => {
          const uri = await pickImage();
          if (uri) {
            // Mettre à jour le state approprié
          }
        },
      },
      {
        text: 'Camera',
        onPress: async () => {
          const uri = await takePhoto();
          if (uri) {
            // Mettre à jour le state approprié
          }
        },
      },
    ]
  );
};
```

### Upload de Photo
```typescript
// Upload lors de la création
if (newAgent.avatarUri) {
  const uploadResult = await uploadImage(newAgent.avatarUri, 'avatars');
  if (uploadResult.success && uploadResult.url) {
    avatarUrl = uploadResult.url;
  }
}

// Upload lors de la mise à jour
if (editAgent.avatarUri) {
  const uploadResult = await uploadImage(editAgent.avatarUri, 'avatars');
  if (uploadResult.success && uploadResult.url) {
    avatarUrl = uploadResult.url;
  }
}
```

### Mise à Jour du Profil
```typescript
// Dans la table profiles
await supabase
  .from('profiles')
  .update({
    // ... autres champs
    avatar_url: avatarUrl,
  })
  .eq('id', userId);
```

## 🎨 Styles Ajoutés

- ✅ `avatarSelector` - Conteneur de sélection de photo (cercle)
- ✅ `avatarPreview` - Aperçu de la photo sélectionnée
- ✅ `avatarPlaceholder` - Placeholder avec icône caméra
- ✅ `avatarPlaceholderText` - Texte du placeholder
- ✅ `removeAvatarButton` - Bouton pour supprimer la photo

## ✅ Résultat

**✅ Photo de profil ajoutée avec succès !**

- ✅ **Sélection de photo** dans les formulaires d'ajout et d'édition
- ✅ **Options Galerie et Caméra** disponibles
- ✅ **Aperçu de la photo** avant sauvegarde
- ✅ **Upload automatique** vers Supabase Storage
- ✅ **Mise à jour du profil** avec l'URL de la photo
- ✅ **Interface intuitive** et facile à utiliser
- ✅ **0 erreur** de linting

## 🎯 Utilisation

1. **Ajouter une photo lors de la création** :
   - Ouvrir le modal "Ajouter un agent"
   - Cliquer sur la zone de photo
   - Choisir "Galerie" ou "Caméra"
   - Sélectionner/Prendre une photo
   - La photo s'affiche dans l'aperçu
   - Cliquer sur "Ajouter l'agent"

2. **Modifier la photo d'un agent** :
   - Ouvrir le profil de l'agent
   - Cliquer sur "Modifier l'agent"
   - Cliquer sur la zone de photo
   - Choisir "Galerie" ou "Caméra"
   - Sélectionner/Prendre une nouvelle photo
   - Cliquer sur "Mettre à jour l'agent"

3. **Supprimer la photo** :
   - Cliquer sur le bouton "X" dans l'aperçu de la photo
   - La photo sera supprimée lors de la sauvegarde

---

**Date** : Aujourd'hui
**Statut** : ✅ **Photo de profil ajoutée avec succès !**

