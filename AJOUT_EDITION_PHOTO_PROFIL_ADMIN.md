# ✅ Ajout de l'Édition de Photo de Profil Admin

## 🎯 **OBJECTIF**

Permettre à l'admin d'éditer sa photo de profil directement depuis le dashboard.

---

## ✅ **FONCTIONNALITÉS AJOUTÉES**

### 1. **Nouvel Écran EditProfileScreen**

**Fichier** : `src/screens/EditProfileScreen.tsx`

**Fonctionnalités** :
- ✅ Affichage de la photo de profil actuelle
- ✅ Sélection de photo depuis la galerie
- ✅ Prise de photo avec la caméra
- ✅ Suppression de la photo de profil
- ✅ Édition du nom complet
- ✅ Édition du numéro de téléphone
- ✅ Upload automatique vers Supabase Storage (bucket `avatars`)
- ✅ Suppression de l'ancienne photo lors du remplacement
- ✅ Indicateur de chargement pendant l'upload
- ✅ Gestion d'erreurs complète

**Interface** :
- Avatar cliquable avec bouton caméra
- Bouton "Supprimer" pour retirer la photo
- Formulaire pour nom et téléphone
- Bouton "Enregistrer" avec indicateur de chargement

---

### 2. **Modification du Dashboard Admin**

**Fichier** : `src/screens/admin/AdminDashboard.tsx`

**Changements** :
- ✅ Ajout d'un avatar cliquable dans le header
- ✅ Clic sur l'avatar → navigation vers `EditProfile`
- ✅ Affichage de la photo de profil actuelle (ou placeholder)
- ✅ Styles pour l'avatar dans le header

**Code** :
```typescript
<TouchableOpacity 
  style={styles.profileButton}
  onPress={() => navigation.navigate('EditProfile')}
>
  {profile?.avatar_url ? (
    <Image 
      source={{ uri: profile.avatar_url }} 
      style={styles.profileAvatar} 
    />
  ) : (
    <View style={styles.profileAvatarPlaceholder}>
      <Ionicons name="person" size={20} color={COLORS.textPrimary} />
    </View>
  )}
</TouchableOpacity>
```

---

### 3. **Navigation**

**Fichier** : `src/navigation/index.tsx`

**Changements** :
- ✅ Import de `EditProfileScreen`
- ✅ Ajout de `EditProfile: undefined` dans `RootStackParamList`
- ✅ Ajout de la route `<Stack.Screen name="EditProfile" component={EditProfileScreen} />`

---

## 🔧 **SERVICES UTILISÉS**

### 1. **imageService.ts**
- `pickImage()` : Sélectionner une image depuis la galerie
- `takePhoto()` : Prendre une photo avec la caméra
- `uploadImage(uri, 'avatars')` : Upload vers Supabase Storage
- `deleteImage(url)` : Supprimer une image de Supabase Storage

### 2. **userService.ts**
- `updateUser(userId, updates)` : Mettre à jour le profil utilisateur

### 3. **AuthContext.tsx**
- `refreshProfile()` : Rafraîchir le profil dans le contexte

---

## 📱 **UTILISATION**

### Pour l'Admin :

1. **Accéder à l'édition** :
   - Ouvrir le Dashboard Admin
   - Cliquer sur l'avatar dans le header (en haut à gauche)

2. **Modifier la photo** :
   - Cliquer sur l'avatar ou le bouton caméra
   - Choisir "Galerie" ou "Caméra"
   - Sélectionner/Prendre une photo

3. **Supprimer la photo** :
   - Cliquer sur "Supprimer" sous l'avatar

4. **Modifier les informations** :
   - Modifier le nom complet
   - Modifier le téléphone

5. **Enregistrer** :
   - Cliquer sur "Enregistrer les modifications"
   - Attendre la confirmation

---

## 🎨 **INTERFACE**

### Écran EditProfile :
- **Header** : Titre "Modifier le profil" avec bouton retour
- **Section Avatar** :
  - Avatar circulaire (120x120)
  - Bouton caméra en bas à droite
  - Bouton "Supprimer" si photo existe
  - Indicateur de chargement pendant l'upload
- **Section Formulaire** :
  - Nom complet (éditable)
  - Email (non éditable, avec indication)
  - Téléphone (éditable)
- **Bouton Enregistrer** :
  - En bas de l'écran
  - Indicateur de chargement pendant la sauvegarde

---

## 🔒 **SÉCURITÉ**

- ✅ Vérification de l'utilisateur connecté
- ✅ Upload vers le bucket `avatars` avec nom unique
- ✅ Suppression de l'ancienne photo lors du remplacement
- ✅ Gestion d'erreurs complète avec logs
- ✅ Validation des champs avant sauvegarde

---

## 📊 **BUCKET SUPABASE**

**Bucket** : `avatars`

**Structure** :
```
avatars/
  └── {userId}-{timestamp}.{ext}
```

**Permissions** : Configurées dans Supabase Storage

---

## ✅ **TEST**

1. ✅ Navigation depuis le dashboard
2. ✅ Affichage de la photo actuelle
3. ✅ Sélection depuis la galerie
4. ✅ Prise de photo avec la caméra
5. ✅ Upload vers Supabase
6. ✅ Mise à jour du profil
7. ✅ Rafraîchissement dans le dashboard
8. ✅ Suppression de la photo
9. ✅ Gestion d'erreurs

---

## 🎯 **PROCHAINES ÉTAPES (OPTIONNEL)**

- [ ] Ajouter un crop d'image avant l'upload
- [ ] Ajouter une prévisualisation avant sauvegarde
- [ ] Ajouter un indicateur de progression pour l'upload
- [ ] Permettre l'édition d'autres champs (bio, etc.)

---

**Date** : Aujourd'hui
**Status** : ✅ **Complété et fonctionnel**

