# 🔐 Résumé Sécurité Supabase - Niumba

## ✅ Points Forts Actuels

1. **RLS Activé** : ✅ Toutes les tables principales ont RLS activé
2. **Policies Définies** : ✅ Des policies existent pour toutes les tables
3. **Index de Performance** : ✅ Index créés pour les requêtes fréquentes
4. **Contraintes** : ✅ CHECK constraints sur les rôles et statuts
5. **Limites de Taille** : ✅ 10 MB pour property-images, 5 MB pour avatars
6. **Types MIME Restreints** : ✅ Seulement images JPEG/PNG/WebP

## ⚠️ Problème Critique Identifié

### 🔴 Storage Policies Trop Permissives

**Problème actuel** :
- ❌ N'importe quel utilisateur authentifié peut **supprimer n'importe quelle image**
- ❌ N'importe quel utilisateur authentifié peut **modifier n'importe quel fichier**
- ❌ Pas de vérification du propriétaire dans les policies

**Risque** : Un utilisateur malveillant pourrait supprimer toutes les images de propriétés.

**Fichier concerné** : `supabase/STORAGE_SETUP.sql`

## 🔧 Solution Proposée

### Script d'Amélioration Créé

**Fichier** : `supabase/IMPROVE_STORAGE_SECURITY.sql` (et `.txt`)

**Améliorations** :
1. ✅ Vérification du propriétaire via `(storage.foldername(name))[2] = auth.uid()::text`
2. ✅ Seul le propriétaire peut modifier/supprimer ses fichiers
3. ✅ Les admins peuvent supprimer n'importe quel fichier
4. ✅ Format de path requis : `{bucket}/{user_id}/{filename}`

### Modification du Code Nécessaire

**Fichier** : `src/services/imageService.ts`

**Ligne 123** : Actuellement utilise `folder/filename`
```typescript
// ❌ Actuel
const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
```

**À modifier pour** : `{user_id}/{filename}`
```typescript
// ✅ À changer
const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
```

**Nécessite** :
- Passer `userId` à la fonction `uploadImage`
- Récupérer `userId` depuis `useAuth()` dans les composants

## 📋 Actions à Effectuer

### Priorité 1 (CRITIQUE) - Immédiat

1. **Exécuter le script SQL** :
   - Ouvrir Supabase Dashboard → SQL Editor
   - Copier-coller le contenu de `IMPROVE_STORAGE_SECURITY.txt`
   - Exécuter le script

2. **Modifier `imageService.ts`** :
   - Ajouter `userId` comme paramètre à `uploadImage`
   - Modifier le format du path pour inclure `userId`
   - Mettre à jour tous les appels à `uploadImage` dans l'application

### Priorité 2 (IMPORTANT) - Cette semaine

1. **Tester les nouvelles policies** :
   - Vérifier qu'un utilisateur ne peut pas supprimer les images d'un autre
   - Vérifier qu'un admin peut supprimer n'importe quelle image
   - Vérifier que les uploads fonctionnent correctement

2. **Ajouter des logs** :
   - Logger les suppressions d'images
   - Logger les uploads pour audit

### Priorité 3 (RECOMMANDÉ) - Ce mois

1. **Rate Limiting** :
   - Limiter à 10 uploads/minute par utilisateur
   - Limiter à 100 uploads/jour par utilisateur

2. **Monitoring** :
   - Activer les logs d'audit Supabase
   - Alertes pour actions suspectes

## 🎯 Statut Global

| Aspect | Statut | Action |
|--------|--------|--------|
| RLS Tables | ✅ Bon | Aucune |
| RLS Storage | ⚠️ À améliorer | Exécuter script |
| Code Upload | ⚠️ À modifier | Ajouter userId |
| Limites Taille | ✅ Bon | Aucune |
| Types MIME | ✅ Bon | Aucune |
| Rate Limiting | ❌ Manquant | À ajouter |

## 📝 Instructions Détaillées

### Étape 1 : Exécuter le Script SQL

1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet Niumba
3. Aller dans **SQL Editor**
4. Ouvrir le fichier `IMPROVE_STORAGE_SECURITY.txt`
5. Copier tout le contenu
6. Coller dans l'éditeur SQL
7. Cliquer sur **Run**

### Étape 2 : Modifier le Code

**Fichier** : `src/services/imageService.ts`

**Changements nécessaires** :
1. Ajouter `userId: string` comme paramètre à `uploadImage`
2. Modifier le format du path : `${userId}/${filename}`
3. Mettre à jour tous les appels dans l'application

**Exemple** :
```typescript
// Avant
export const uploadImage = async (
  uri: string,
  folder: string = 'properties',
  bucketName?: string
): Promise<ImageUploadResult> => {
  const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
  // ...
}

// Après
export const uploadImage = async (
  uri: string,
  userId: string,  // ← Ajouter
  folder: string = 'properties',
  bucketName?: string
): Promise<ImageUploadResult> => {
  const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
  // ...
}
```

### Étape 3 : Mettre à Jour les Appels

Chercher tous les appels à `uploadImage` et ajouter `userId` :

```typescript
// Avant
const result = await uploadImage(uri, 'properties');

// Après
const { user } = useAuth();
const result = await uploadImage(uri, user?.id || '', 'properties');
```

## ✅ Après les Modifications

1. **Tester** :
   - Upload d'une image (doit fonctionner)
   - Tentative de suppression d'une image d'un autre utilisateur (doit échouer)
   - Suppression de sa propre image (doit fonctionner)
   - Admin supprime une image (doit fonctionner)

2. **Vérifier** :
   - Les images sont bien organisées par `user_id` dans le storage
   - Les policies fonctionnent correctement
   - Pas d'erreurs dans les logs

---

## 🎯 Conclusion

**Sécurité globale** : ✅ **Bonne** (RLS activé, policies définies)

**Amélioration critique** : ⚠️ **Storage policies** (à corriger immédiatement)

**Action requise** : Exécuter le script SQL et modifier le code pour inclure `userId` dans les paths.

Une fois ces modifications faites, la sécurité sera **excellente** ! 🔒

