# ✅ Corrections Dashboard Admin - Problèmes de Fetching

## Corrections Appliquées

### 1. **AdminInquiriesScreen** - Hook `useOwnerInquiries`
**Problème** : Le hook vérifiait seulement `isOwner` mais pas `isAdmin`, donc les admins ne pouvaient pas voir toutes les demandes.

**Solution** :
- ✅ Ajout de `getAllInquiries()` dans `inquiryService.ts` pour récupérer toutes les demandes (sans filtre propriétaire)
- ✅ Modification de `useOwnerInquiries` pour utiliser `getAllInquiries()` si l'utilisateur est admin
- ✅ Ajout du paramètre `isAdmin` à `updateInquiryStatus()` pour permettre aux admins de modifier toutes les demandes

### 2. **AdminPropertiesScreen** - Utilisation directe de Supabase
**Problème** : L'écran utilisait directement `supabase.from()` au lieu du hook `useProperties`.

**Solution** :
- ✅ Remplacement de l'appel direct par `useProperties` hook
- ✅ Ajout de la gestion des erreurs et du loading state

### 3. **Permissions Admin dans les Services**
**Problème** : Les services ne vérifiaient pas si l'utilisateur était admin avant de bloquer l'accès.

**Solution** :
- ✅ Ajout du paramètre `isAdmin` aux fonctions de mise à jour
- ✅ Vérification des permissions admin avant de bloquer

## Fichiers Modifiés

1. `src/services/inquiryService.ts`
   - Ajout de `getAllInquiries()` pour les admins
   - Modification de `updateInquiryStatus()` pour accepter `isAdmin`

2. `src/hooks/useInquiries.ts`
   - Modification de `useOwnerInquiries()` pour utiliser `getAllInquiries()` si admin
   - Ajout de `isAdmin` dans les dépendances

3. `src/screens/admin/AdminPropertiesScreen.tsx`
   - Remplacement de l'appel direct Supabase par `useProperties` hook

## Prochaines Étapes

### Vérifier les Policies RLS
Les policies RLS doivent permettre aux admins d'accéder à toutes les données. Exécutez ce script dans Supabase :

```sql
-- Vérifier que les admins peuvent accéder aux données
SELECT 
  tablename,
  policyname,
  qual as using_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('properties', 'inquiries', 'profiles', 'agents')
  AND qual::text LIKE '%admin%'
ORDER BY tablename;
```

### Tester les Fonctionnalités
1. ✅ Ouvrir AdminInquiries - devrait afficher toutes les demandes
2. ✅ Ouvrir AdminProperties - devrait afficher toutes les propriétés
3. ✅ Modifier le statut d'une demande - devrait fonctionner pour les admins
4. ✅ Filtrer les propriétés - devrait fonctionner

## Notes Importantes

⚠️ **RLS Policies** : Si les policies RLS ne permettent pas aux admins d'accéder aux données, vous devrez les mettre à jour. Les admins doivent pouvoir :
- Voir toutes les propriétés (même celles en draft)
- Voir toutes les demandes
- Modifier toutes les propriétés
- Modifier toutes les demandes

Pour cela, les policies doivent inclure :
```sql
OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
```

Ou utiliser la fonction `is_admin()` si elle est créée.


