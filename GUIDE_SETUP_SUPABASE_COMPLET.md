# 📋 Guide Setup Complet Supabase - Niumba

## 🎯 Ce qui doit être configuré dans Supabase

Ce guide te montre comment configurer **TOUTES** les tables nécessaires pour :
1. ✅ **Chat/Messagerie** (conversations, messages)
2. ✅ **Alertes de recherche** (property_alerts)
3. ✅ **Appels vidéo** (video_calls)

## 📝 Script SQL Complet

### Option 1 : Fichier SQL (Recommandé)
**Fichier** : `supabase/SETUP_COMPLET_CHAT_ALERTES_VIDEO.sql`

### Option 2 : Fichier Texte (Plus facile à copier)
**Fichier** : `supabase/SETUP_COMPLET_CHAT_ALERTES_VIDEO.txt`

## 🚀 Instructions d'Exécution

### Étape 1 : Ouvrir Supabase
1. Va sur https://supabase.com/dashboard
2. Sélectionne ton projet **Niumba**
3. Clique sur **"SQL Editor"** dans le menu de gauche
4. Clique sur **"New query"**

### Étape 2 : Copier le Script
1. Ouvre le fichier : `supabase/SETUP_COMPLET_CHAT_ALERTES_VIDEO.txt`
2. **Copie TOUT le contenu** (Ctrl+A puis Ctrl+C)

### Étape 3 : Exécuter le Script
1. **Colle le script** dans l'éditeur SQL (Ctrl+V)
2. Clique sur **"Run"** ou appuie sur **Ctrl+Enter**
3. Attends le message **"Success"**

### Étape 4 : Vérifier les Tables
1. Va dans **"Table Editor"**
2. Tu devrais voir ces tables :
   - ✅ `conversations`
   - ✅ `messages`
   - ✅ `property_alerts`
   - ✅ `video_calls`

## 📊 Tables Créées

### 1. conversations
- `id` (UUID)
- `participant_1` (UUID) - Premier participant
- `participant_2` (UUID) - Deuxième participant
- `property_id` (UUID, nullable) - Propriété associée
- `last_message_at` (TIMESTAMPTZ)
- `last_message_preview` (TEXT)
- `created_at`, `updated_at`

### 2. messages
- `id` (UUID)
- `conversation_id` (UUID) - Conversation parente
- `sender_id` (UUID) - Expéditeur
- `content` (TEXT) - Contenu du message
- `attachment_type` (TEXT) - Type de pièce jointe
- `attachment_url` (TEXT) - URL de la pièce jointe
- `status` (TEXT) - sent, delivered, read
- `created_at`, `read_at`

### 3. property_alerts
- `id` (UUID)
- `user_id` (UUID) - Utilisateur propriétaire
- `name` (TEXT) - Nom de l'alerte
- `enabled` (BOOLEAN) - Activée ou non
- Critères de recherche (property_type, transaction_type, prix, chambres, etc.)
- `match_count` (INTEGER) - Nombre de correspondances
- `last_notified`, `last_checked`
- `created_at`, `updated_at`

### 4. video_calls
- `id` (UUID)
- `appointment_id` (UUID) - Rendez-vous associé
- `meeting_url` (TEXT) - URL de la réunion
- `meeting_id` (TEXT) - ID unique de la réunion
- `meeting_password` (TEXT) - Mot de passe optionnel
- `provider` (TEXT) - zoom, google_meet, custom
- `status` (TEXT) - scheduled, active, completed, cancelled
- `created_at`, `started_at`, `ended_at`, `updated_at`

## 🔒 Sécurité (RLS)

Toutes les tables ont **Row Level Security (RLS)** activé avec des policies qui garantissent que :
- ✅ Les utilisateurs ne voient que leurs propres données
- ✅ Les utilisateurs ne peuvent modifier que leurs propres données
- ✅ Les conversations sont privées entre les participants
- ✅ Les alertes sont privées par utilisateur
- ✅ Les appels vidéo sont accessibles uniquement aux participants du rendez-vous

## ⚡ Fonctionnalités Activées

### Chat/Messagerie
- ✅ Création de conversations
- ✅ Envoi de messages
- ✅ Notifications temps réel (Supabase Realtime)
- ✅ Marquer les messages comme lus
- ✅ Pièces jointes (images, fichiers)

### Alertes de Recherche
- ✅ Création d'alertes personnalisées
- ✅ Matching automatique avec les propriétés
- ✅ Notifications push pour nouvelles correspondances
- ✅ Vérification périodique des alertes

### Appels Vidéo
- ✅ Création automatique lors d'un rendez-vous vidéo
- ✅ Gestion des statuts (scheduled, active, completed)
- ✅ Support Zoom, Google Meet, ou solution personnalisée

## 🔧 Vérification Post-Setup

### Test 1 : Vérifier les Tables
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('conversations', 'messages', 'property_alerts', 'video_calls');
```

### Test 2 : Vérifier les Policies RLS
```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('conversations', 'messages', 'property_alerts', 'video_calls');
```

### Test 3 : Vérifier les Index
```sql
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('conversations', 'messages', 'property_alerts', 'video_calls');
```

## 🐛 Dépannage

### Erreur : "relation does not exist"
- Vérifie que tu as bien exécuté le script complet
- Vérifie que tu es dans le bon projet Supabase

### Erreur : "permission denied"
- Vérifie que les policies RLS sont bien créées
- Vérifie que l'utilisateur est bien authentifié

### Les notifications temps réel ne fonctionnent pas
- Vérifie que Supabase Realtime est activé dans les paramètres du projet
- Va dans Settings → API → Realtime et active-le

## ✅ Checklist Finale

- [ ] Script SQL exécuté avec succès
- [ ] Toutes les tables créées (conversations, messages, property_alerts, video_calls)
- [ ] RLS activé sur toutes les tables
- [ ] Policies créées et fonctionnelles
- [ ] Index créés pour les performances
- [ ] Triggers créés pour la mise à jour automatique
- [ ] Supabase Realtime activé (pour le chat temps réel)

## 🎉 Résultat

Une fois le script exécuté, tu auras :
- ✅ Chat/Messagerie fonctionnel avec notifications temps réel
- ✅ Alertes de recherche avec matching automatique
- ✅ Appels vidéo pour les rendez-vous
- ✅ Toutes les tables sécurisées avec RLS

---

**Date** : Aujourd'hui
**Statut** : ✅ Script prêt à exécuter
**Prochaine étape** : Exécuter le script dans Supabase


