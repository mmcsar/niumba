# 🔄 Restaurer les Propriétés en Vedette

## 📊 **SITUATION**

Les propriétés d'exemple en vedette ont disparu. Voici comment les restaurer :

---

## ✅ **PROPRIÉTÉS D'EXEMPLE DISPONIBLES**

Il y a **5 propriétés d'exemple** dans le code, dont **4 sont en vedette** :

1. ✅ **Villa Moderne Golf** - `isFeatured: true` - Lubumbashi
2. ✅ **Appartement Centre-Ville** - `isFeatured: true` - Lubumbashi  
3. ❌ **Maison Familiale Kolwezi** - `isFeatured: false` - Kolwezi
4. ✅ **Terrain Commercial Likasi** - `isFeatured: true` - Likasi
5. ✅ **Duplex Moderne Lubumbashi** - `isFeatured: true` - Lubumbashi

**Total** : 4 propriétés en vedette

---

## 🔧 **SOLUTION : Recréer les Propriétés d'Exemple**

### Option 1 : Via le Dashboard Admin (Recommandé)

1. **Ouvrir le Dashboard Admin**
   - Aller dans l'app
   - Se connecter avec un compte admin
   - Accéder au Dashboard

2. **Créer les Propriétés d'Exemple**
   - Chercher le bouton "Créer des propriétés d'exemple"
   - Cliquer dessus
   - Confirmer la création
   - Attendre la confirmation

3. **Vérifier**
   - Les 5 propriétés seront créées
   - 4 seront automatiquement en vedette (`is_featured: true`)

---

### Option 2 : Vérifier dans Supabase

Si les propriétés existent mais ne sont pas en vedette :

```sql
-- Vérifier les propriétés en vedette
SELECT id, title, is_featured, status 
FROM properties 
WHERE is_featured = true 
AND status = 'active';

-- Si aucune, mettre en vedette manuellement
UPDATE properties 
SET is_featured = true 
WHERE title IN (
  'Villa Moderne Golf',
  'Appartement Centre-Ville',
  'Terrain Commercial Likasi',
  'Duplex Moderne Lubumbashi'
);
```

---

## 🎯 **CAUSES POSSIBLES DE LA DISPARITION**

1. **Propriétés supprimées** de la base de données
2. **Flag `is_featured` changé** à `false`
3. **Erreur dans `getFeaturedProperties`** (maintenant corrigée)
4. **Propriétés avec `status` différent de `'active'`**

---

## ✅ **APRÈS RESTAURATION**

Une fois les propriétés recréées :
- ✅ Elles apparaîtront dans "Propriétés en vedette" sur HomeScreen
- ✅ Elles auront le badge "En vedette"
- ✅ Elles seront visibles dans la section "Featured homes"

---

## 📝 **NOTE**

Les propriétés d'exemple incluent :
- ✅ Images (URLs Unsplash)
- ✅ Descriptions complètes
- ✅ Caractéristiques
- ✅ Coordonnées GPS
- ✅ Flag `is_featured: true` pour 4 d'entre elles

---

**Date** : Aujourd'hui
**Action** : Recréer les propriétés via le Dashboard Admin

