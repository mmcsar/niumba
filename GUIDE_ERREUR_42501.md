# 🔧 Guide - Erreur 42501 Persistante

## 📋 Étapes de Diagnostic

### Étape 1 : Diagnostic

**Exécutez d'abord** ce script dans Supabase SQL Editor :

**Fichier** : `supabase/DIAGNOSTIC.sql`

Ce script vous montrera :
- ✅ Quelles tables existent
- ✅ Quelles tables ont déjà RLS activé
- ✅ Quelles policies existent déjà
- ✅ Vos permissions actuelles

**Partagez-moi les résultats** et je vous aiderai à corriger.

---

### Étape 2 : Script Minimal

Si le diagnostic montre que certaines tables existent, essayez le script minimal :

**Fichier** : `supabase/RLS_MINIMAL.sql`

Ce script :
- ✅ Active RLS seulement sur `profiles` et `properties`
- ✅ Crée 4 policies minimales
- ✅ Plus simple, moins de risques d'erreur

---

### Étape 3 : Si Ça Ne Fonctionne Toujours Pas

**Solution alternative : Interface Supabase**

1. **Allez dans** Supabase Dashboard → **Database** → **Tables**

2. **Pour chaque table** (profiles, properties, etc.) :
   - Cliquez sur la table
   - Onglet **Policies**
   - Cliquez sur **Enable RLS** (si pas activé)
   - Cliquez sur **New Policy**
   - Créez les policies une par une

---

## 🔍 Questions pour Mieux Comprendre

1. **Quelle est l'erreur exacte ?**
   - Copiez le message d'erreur complet

2. **À quelle ligne l'erreur se produit ?**
   - Le message d'erreur indique généralement la ligne

3. **Quelles tables existent dans votre base ?**
   - Exécutez `DIAGNOSTIC.sql` pour voir

---

## 💡 Solution Rapide

**Si vous voulez juste activer RLS rapidement** :

1. **Database** → **Tables** → Cliquez sur une table
2. **Onglet Policies** → **Enable RLS**
3. **New Policy** → Créez les policies

C'est plus long mais **ça fonctionne toujours**.

---

**➡️ Commencez par exécuter `DIAGNOSTIC.sql` et partagez-moi les résultats !**


