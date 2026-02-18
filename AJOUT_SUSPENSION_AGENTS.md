# Ajout de la Fonctionnalité de Suspension des Agents

## Résumé
Ajout d'une fonctionnalité de suspension des agents accessible uniquement aux administrateurs, avec logging des activités pour la sécurité.

## Modifications

### 1. Base de données
- **Fichier SQL** : `supabase/ADD_SUSPENSION_COLUMNS.sql` et `ADD_SUSPENSION_COLUMNS.txt`
- **Colonnes ajoutées** :
  - `is_suspended` (BOOLEAN, DEFAULT FALSE)
  - `suspended_at` (TIMESTAMPTZ)
  - `suspended_reason` (TEXT)
- **Index** : `idx_agents_is_suspended` pour améliorer les performances

### 2. Service (`src/services/agentService.ts`)
- **Interface `Agent`** : Ajout des propriétés `is_suspended`, `suspended_at`, `suspended_reason`
- **Fonction `updateAgentStatus`** : Gestion de la suspension (met à jour `suspended_at` et `suspended_reason`)
- **Fonction `suspendAgent`** : Suspend un agent et enregistre l'activité dans `activity_logs`
- **Fonction `unsuspendAgent`** : Réactive un agent et enregistre l'activité
- **Fonction `getAgents`** : Ajout du filtre `isSuspended`

### 3. Interface Admin (`src/screens/admin/AdminAgentsScreen.tsx`)
- **Affichage du statut suspendu** :
  - Badge "Suspendu" dans la liste des agents
  - Badge "Suspendu" dans le modal de détails
  - Affichage de la raison de suspension si disponible
- **Boutons de suspension** (uniquement pour les admins) :
  - Bouton "Suspendre l'agent" (rouge) si l'agent n'est pas suspendu
  - Bouton "Réactiver l'agent" (vert) si l'agent est suspendu
- **Modal de suspension** :
  - Champ texte pour saisir la raison (obligatoire)
  - Validation avant suspension
  - Logging automatique de l'action

### 4. Styles
- `statusBadgeSuspended` : Badge rouge avec bordure pour les agents suspendus
- `modalStatusBadgeSuspended` : Badge suspendu dans le modal
- `suspendedWarning` : Avertissement avec la raison de suspension
- `suspendButton` / `unsuspendButton` : Boutons de suspension/réactivation
- `modalScroll`, `modalSectionSubtitle`, `cancelButton`, `confirmButton` : Styles pour le modal

## Utilisation

### Pour suspendre un agent :
1. Aller dans "Gestion des Agents" (Admin uniquement)
2. Cliquer sur un agent
3. Cliquer sur "Suspendre l'agent"
4. Entrer la raison de suspension (obligatoire)
5. Confirmer

### Pour réactiver un agent :
1. Aller dans "Gestion des Agents" (Admin uniquement)
2. Cliquer sur un agent suspendu
3. Cliquer sur "Réactiver l'agent"
4. Confirmer

## Sécurité
- Seuls les administrateurs peuvent suspendre/réactiver des agents
- Toutes les actions sont enregistrées dans `activity_logs` avec :
  - L'ID et le nom de l'admin
  - L'ID et le nom de l'agent
  - La raison de suspension
  - L'heure de l'action
  - Les statuts avant/après

## Configuration Supabase
Exécuter le script SQL `ADD_SUSPENSION_COLUMNS.txt` dans l'éditeur SQL de Supabase pour ajouter les colonnes nécessaires.

