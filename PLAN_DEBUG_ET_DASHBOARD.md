# 🔧 Plan : Debug + Dashboard Next.js

## 🎯 Objectifs

1. **Debug de l'application mobile**
2. **Créer un dashboard Next.js 15.5**
3. **Vérifier les fonctionnalités qui ne marchent pas**

---

## 📋 PHASE 1 : DEBUG DE L'APP (Priorité 1)

### 1. Identifier les Problèmes

#### A. Vérifier les Fonctionnalités Principales
- [ ] Connexion/Déconnexion
- [ ] Recherche de propriétés
- [ ] Affichage des détails
- [ ] Ajout aux favoris
- [ ] Envoi de demandes
- [ ] Prise de rendez-vous
- [ ] Ajout d'avis
- [ ] Notifications
- [ ] Chat/Messages
- [ ] Dashboard Admin

#### B. Vérifier les Erreurs Console
- [ ] Erreurs JavaScript
- [ ] Erreurs Supabase
- [ ] Erreurs de navigation
- [ ] Erreurs de permissions

#### C. Vérifier les "Slacks" (Notifications/Alertes)
- [ ] Notifications push
- [ ] Alertes de recherche
- [ ] Notifications de messages
- [ ] Notifications de rendez-vous

### 2. Tests à Faire

```bash
# Lancer l'app en mode debug
npx expo start --dev-client

# Vérifier les logs
# Tester chaque fonctionnalité
# Noter les erreurs
```

### 3. Corrections

- [ ] Corriger les bugs identifiés
- [ ] Tester après corrections
- [ ] Documenter les corrections

---

## 📋 PHASE 2 : DASHBOARD NEXT.JS (Priorité 2)

### 1. Setup Next.js 15.5

```bash
# Créer le projet
npx create-next-app@latest niumba-dashboard --typescript --tailwind --app

# Structure proposée
niumba-dashboard/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── properties/
│   │   ├── users/
│   │   ├── agents/
│   │   └── analytics/
│   └── api/
├── components/
├── lib/
│   └── supabase.ts  # Même config que mobile
├── types/
│   └── database.ts  # Types partagés
└── package.json
```

### 2. Configuration Supabase

- [ ] Installer `@supabase/supabase-js`
- [ ] Configurer le client Supabase
- [ ] Utiliser les mêmes variables d'environnement
- [ ] Créer les mêmes services (optionnel)

### 3. Pages Principales

#### Dashboard Admin
- [ ] Vue d'ensemble (statistiques)
- [ ] Graphiques et analytics
- [ ] Activité récente

#### Gestion Propriétés
- [ ] Liste des propriétés
- [ ] Ajout/Modification
- [ ] Filtres et recherche
- [ ] Export

#### Gestion Utilisateurs
- [ ] Liste des utilisateurs
- [ ] Détails utilisateur
- [ ] Modification de rôle
- [ ] Statistiques par utilisateur

#### Gestion Agents
- [ ] Liste des agents
- [ ] Création d'agent
- [ ] Vérification d'agent
- [ ] Statistiques par agent

#### Analytics
- [ ] Graphiques de ventes
- [ ] Statistiques régionales
- [ ] Rapports détaillés
- [ ] Export de données

### 4. Authentification

- [ ] Login avec Supabase Auth
- [ ] Gestion des sessions
- [ ] Protection des routes
- [ ] Rôles (admin, agent, user)

### 5. Design

- [ ] UI moderne (Tailwind CSS)
- [ ] Responsive
- [ ] Dark mode (optionnel)
- [ ] Composants réutilisables

---

## 📋 PHASE 3 : PARTAGE DE CODE

### 1. Types TypeScript

Créer un package partagé ou copier les types :
- `types/database.ts` (même structure)
- Interfaces communes

### 2. Services Supabase

- [ ] Services identiques (optionnel)
- [ ] Ou utiliser directement le client Supabase

### 3. Configuration

- [ ] Variables d'environnement partagées
- [ ] Même configuration Supabase

---

## 🚀 ORDRE D'EXÉCUTION RECOMMANDÉ

### Semaine 1 : Debug
1. ✅ Identifier tous les bugs
2. ✅ Corriger les fonctionnalités
3. ✅ Tester l'app complètement

### Semaine 2-3 : Dashboard
1. ✅ Setup Next.js
2. ✅ Configuration Supabase
3. ✅ Pages principales
4. ✅ Authentification
5. ✅ Design et UI

### Semaine 4 : Finalisation
1. ✅ Tests du dashboard
2. ✅ Intégration complète
3. ✅ Déploiement

---

## 💡 AVANTAGES DE CETTE APPROCHE

✅ **Debug d'abord** : App mobile stable
✅ **Dashboard ensuite** : Utilise un backend déjà testé
✅ **Architecture cohérente** : Même stack, même backend
✅ **Maintenance facile** : Code partagé possible

---

## 📊 ESTIMATION

- **Debug** : 3-5 jours
- **Dashboard Next.js** : 2-3 semaines
- **Total** : 3-4 semaines

---

**➡️ Commençons par le debug, puis créons le dashboard !**


