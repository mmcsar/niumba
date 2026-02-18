# 🔧 Checklist Debug - Application Niumba

## 🎯 Objectif
Identifier et corriger tous les bugs et fonctionnalités qui ne marchent pas.

---

## 📋 FONCTIONNALITÉS À VÉRIFIER

### 1. Authentification
- [ ] Connexion (email/password)
- [ ] Inscription
- [ ] Déconnexion
- [ ] Mot de passe oublié
- [ ] Session persistante
- [ ] Rôles (admin, agent, user)

### 2. Recherche & Navigation
- [ ] Recherche de propriétés
- [ ] Filtres avancés
- [ ] Affichage des résultats
- [ ] Navigation entre écrans
- [ ] Retour en arrière

### 3. Propriétés
- [ ] Liste des propriétés
- [ ] Détails d'une propriété
- [ ] Images des propriétés
- [ ] Ajout aux favoris
- [ ] Suppression des favoris
- [ ] Partage de propriété

### 4. Demandes & Contact
- [ ] Envoi de demande de contact
- [ ] Affichage des demandes (admin)
- [ ] Réponse aux demandes
- [ ] Statut des demandes

### 5. Rendez-vous
- [ ] Prise de rendez-vous
- [ ] Liste des rendez-vous
- [ ] Modification de rendez-vous
- [ ] Annulation de rendez-vous
- [ ] Notifications de rendez-vous

### 6. Avis & Commentaires
- [ ] Ajout d'avis
- [ ] Affichage des avis
- [ ] Modification d'avis
- [ ] Suppression d'avis
- [ ] Notes et étoiles

### 7. Notifications ("Slacks")
- [ ] Réception de notifications
- [ ] Affichage des notifications
- [ ] Marquage comme lu
- [ ] Suppression de notifications
- [ ] Notifications push (si configuré)

### 8. Chat & Messages
- [ ] Liste des conversations
- [ ] Envoi de messages
- [ ] Réception de messages
- [ ] Notifications de nouveaux messages

### 9. Dashboard Admin
- [ ] Accès admin
- [ ] Statistiques
- [ ] Gestion des propriétés
- [ ] Gestion des utilisateurs
- [ ] Gestion des agents
- [ ] Gestion des rendez-vous
- [ ] Gestion des demandes

### 10. Profil Utilisateur
- [ ] Affichage du profil
- [ ] Modification du profil
- [ ] Changement de photo
- [ ] Paramètres

### 11. Calculatrice & Outils
- [ ] Calculatrice hypothécaire
- [ ] Comparaison de propriétés
- [ ] Historique des prix
- [ ] Alertes de recherche

### 12. Carte & Localisation
- [ ] Affichage de la carte
- [ ] Localisation
- [ ] Recherche par proximité
- [ ] Marqueurs sur la carte

---

## 🐛 ERREURS COMMUNES À VÉRIFIER

### Erreurs Supabase
- [ ] Tables manquantes
- [ ] RLS bloquant les requêtes
- [ ] Erreurs de connexion
- [ ] Timeout des requêtes

### Erreurs Navigation
- [ ] Écrans non trouvés
- [ ] Paramètres manquants
- [ ] Navigation bloquée

### Erreurs UI
- [ ] Images non chargées
- [ ] Textes manquants
- [ ] Boutons non cliquables
- [ ] Layout cassé

### Erreurs Performance
- [ ] Lenteur de chargement
- [ ] Freeze de l'app
- [ ] Mémoire excessive

---

## 📝 PROCÉDURE DE DEBUG

### 1. Tester Chaque Fonctionnalité
- Ouvrir l'app
- Tester chaque écran
- Noter les erreurs

### 2. Vérifier les Logs
```bash
# Lancer en mode debug
npx expo start --dev-client

# Vérifier la console
# Noter toutes les erreurs
```

### 3. Tester sur Appareil Réel
- Tester sur Android
- Tester sur iOS
- Noter les différences

### 4. Documenter les Bugs
- Description du bug
- Étapes pour reproduire
- Erreur exacte
- Solution proposée

---

## 🚀 PROCHAINES ÉTAPES

1. ✅ Commencer les tests
2. ✅ Noter tous les bugs
3. ✅ Corriger les bugs
4. ✅ Re-tester après corrections
5. ✅ Documenter les corrections

---

**➡️ Commençons par tester l'authentification et la navigation de base !**


