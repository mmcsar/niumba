# ✅ Guide de Test Rapide - Niumba

## 🎉 Félicitations ! Le script SQL est exécuté

Maintenant, testons toutes les fonctionnalités pour vérifier que tout fonctionne bien.

---

## 📋 Checklist de Vérification

### 1. ✅ Vérifier les Tables dans Supabase

1. Va sur **Supabase Dashboard** → **Table Editor**
2. Tu devrais voir ces 4 nouvelles tables :
   - ✅ `conversations`
   - ✅ `messages`
   - ✅ `property_alerts`
   - ✅ `video_calls`

**Si tu vois les 4 tables → ✅ Tout est bon !**

---

## 🧪 Tests à Faire dans l'App

### Test 1 : Appels Vidéo ✅
**Ce qui doit fonctionner** :
1. Va sur une propriété
2. Clique sur **"Demander un rendez-vous"**
3. Sélectionne **"Appel vidéo"** comme type
4. Crée le rendez-vous
5. Va dans **Admin → Rendez-vous**
6. Tu devrais voir un bouton **"Rejoindre"** pour les appels vidéo
7. Clique sur **"Rejoindre"** → L'écran d'appel vidéo s'ouvre

**✅ Si ça marche** : Les appels vidéo sont configurés !

---

### Test 2 : Chat/Messagerie 💬
**Ce qui doit fonctionner** :
1. Va sur une propriété
2. Clique sur **"Contacter l'agent"** ou **"Envoyer un message"**
3. Une conversation se crée automatiquement
4. Envoie un message
5. Le message apparaît en temps réel (si Supabase Realtime est activé)

**✅ Si ça marche** : Le chat fonctionne !

**⚠️ Si les messages ne s'affichent pas en temps réel** :
- Va dans **Supabase → Settings → API**
- Active **"Realtime"** si ce n'est pas déjà fait

---

### Test 3 : Alertes de Recherche 🔔
**Ce qui doit fonctionner** :
1. Va dans **Recherche** ou **Alertes**
2. Crée une nouvelle alerte avec des critères (prix, chambres, ville, etc.)
3. L'alerte est sauvegardée
4. Quand de nouvelles propriétés correspondent, tu reçois une notification

**✅ Si ça marche** : Les alertes fonctionnent !

---

## 🔧 Vérifications Techniques

### Vérifier Supabase Realtime (Pour le Chat)

1. Va sur **Supabase Dashboard**
2. Clique sur **Settings** (⚙️) → **API**
3. Scroll jusqu'à **"Realtime"**
4. Vérifie que c'est **activé** ✅

**Si ce n'est pas activé** :
- Active-le
- Les notifications temps réel du chat fonctionneront automatiquement

---

### Vérifier les Permissions RLS

Pour vérifier que les policies RLS sont bien créées :

1. Va sur **Supabase → SQL Editor**
2. Exécute cette requête :

```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('conversations', 'messages', 'property_alerts', 'video_calls')
ORDER BY tablename, policyname;
```

**Tu devrais voir** :
- `conversations` : 3 policies (select, insert, update)
- `messages` : 4 policies (select, insert, update, delete)
- `property_alerts` : 4 policies (select, insert, update, delete)
- `video_calls` : 3 policies (select, insert, update)

**✅ Si tu vois toutes les policies → La sécurité est configurée !**

---

## 🐛 Dépannage Rapide

### Problème : "relation does not exist"
**Solution** : Vérifie que tu as bien exécuté le script complet dans Supabase

### Problème : "permission denied"
**Solution** : Vérifie que les policies RLS sont bien créées (voir section ci-dessus)

### Problème : Les messages ne s'affichent pas en temps réel
**Solution** : Active Supabase Realtime dans Settings → API

### Problème : Les appels vidéo ne se créent pas
**Solution** : Vérifie que la table `video_calls` existe dans Supabase

---

## ✅ Résumé

Une fois tous les tests passés, tu auras :

- ✅ **Chat/Messagerie** fonctionnel avec notifications temps réel
- ✅ **Alertes de recherche** avec matching automatique
- ✅ **Appels vidéo** pour les rendez-vous
- ✅ **Sécurité RLS** configurée sur toutes les tables
- ✅ **Performance optimisée** avec index et triggers

---

## 🎯 Prochaines Étapes (Optionnel)

1. **Tester avec un utilisateur réel** : Crée un compte et teste le chat entre 2 utilisateurs
2. **Configurer les notifications push** : Pour recevoir des notifications sur mobile
3. **Intégrer un vrai service vidéo** : Zoom, Google Meet, ou une solution personnalisée

---

**Date** : Aujourd'hui
**Statut** : ✅ Script SQL exécuté
**Action** : Tester les fonctionnalités dans l'app

Bon test ! 🚀


