# 📸 Guide Visuel - SQL Editor Supabase

## 🎯 Où Trouver SQL Editor

### Option 1 : Menu Latéral
1. Dans votre projet Supabase
2. Menu de gauche → **"SQL Editor"** (icône de code `</>`)
3. Cliquez dessus

### Option 2 : Navigation Directe
1. URL : `https://supabase.com/dashboard/project/[VOTRE_PROJECT_ID]/sql/new`
2. Remplacez `[VOTRE_PROJECT_ID]` par l'ID de votre projet

---

## 📋 Étapes dans SQL Editor

### 1. Ouvrir le Fichier
- Fichier : `C:\Users\mmcsa\Niumba\supabase\INTEGRATION_COMPLETE.sql`
- Ouvrez avec Notepad ou VS Code

### 2. Copier le Contenu
- **Ctrl+A** (Sélectionner tout)
- **Ctrl+C** (Copier)

### 3. Dans SQL Editor
- Cliquez dans la zone de texte
- **Ctrl+V** (Coller)

### 4. Exécuter
- Cliquez sur **"Run"** (bouton en bas à droite)
- Ou appuyez sur **Ctrl+Enter**

---

## ✅ Résultat Attendu

Vous devriez voir dans la console :

```
✅ Intégration complète terminée !
✅ Toutes les tables ont été créées/vérifiées !
✅ RLS activé sur toutes les tables !
✅ Toutes les policies ont été créées !
✅ Tous les index ont été créés !
✅ Villes de Lualaba & Haut-Katanga ajoutées !
🚀 Votre backend Supabase est maintenant complet !
```

Plus 3 tableaux :
1. **Tables créées** avec statut RLS
2. **Policies créées** par table
3. **Index créés** par table

---

## 🔍 Vérification Après Exécution

### Dans Supabase Dashboard :

1. **Table Editor** (menu gauche)
   - Vérifiez que vous voyez les tables :
     - profiles
     - properties
     - inquiries
     - appointments
     - reviews
     - agents
     - cities
     - etc.

2. **Authentication** (menu gauche)
   - Vérifiez que l'authentification est active

3. **Database** → **Tables**
   - Vérifiez que RLS est activé (icône de cadenas)

---

## ⚠️ Si Vous Voyez des Erreurs

### Erreur : "Table already exists"
- ✅ **Normal** : Le script vérifie avant de créer
- ✅ **Pas de problème** : La table existe déjà

### Erreur : "Policy already exists"
- ✅ **Normal** : Le script vérifie avant de créer
- ✅ **Pas de problème** : La policy existe déjà

### Erreur : "42501 - permission denied"
- ❌ **Problème** : Permissions insuffisantes
- 🔧 **Solution** : Vérifiez que vous êtes connecté avec le bon compte

### Erreur : "Could not find the table"
- ❌ **Problème** : Table n'existe pas encore
- ✅ **Solution** : Le script va la créer

---

## 🎯 Prochaines Étapes

Après exécution réussie :

1. ✅ Votre backend est complet
2. ✅ Toutes les tables sont créées
3. ✅ RLS est configuré
4. ✅ Votre application peut se connecter

**Testez votre application React Native !**

---

**➡️ Exécutez maintenant le script dans SQL Editor !**


