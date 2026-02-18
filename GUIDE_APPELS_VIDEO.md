# Guide Configuration Appels Vidéo - Niumba

## ✅ Ce qui a été configuré

1. **Service `videoCallService.ts`** : Gère la création et la gestion des appels vidéo
2. **Écran `VideoCallScreen.tsx`** : Interface pour lancer et gérer les appels vidéo
3. **Table `video_calls`** : Script SQL pour créer la table dans Supabase
4. **Intégration automatique** : Création automatique d'un appel vidéo quand un rendez-vous vidéo est créé
5. **Navigation** : Bouton pour accéder aux appels vidéo depuis les rendez-vous

## 📋 Étapes de configuration

### 1. Créer la table dans Supabase

Exécute le script SQL dans Supabase :

1. Va sur ton dashboard Supabase
2. Ouvre l'éditeur SQL
3. Copie-colle le contenu de `supabase/CREATE_VIDEO_CALLS_TABLE.sql`
4. Exécute le script

### 2. Vérifier la configuration

Le service est déjà intégré et fonctionne automatiquement :
- Quand un rendez-vous de type `video_call` est créé, un appel vidéo est automatiquement généré
- Le lien de réunion est stocké dans la table `video_calls` et dans `appointments.video_url`

## 🚀 Utilisation

### Pour les utilisateurs

1. **Créer un rendez-vous vidéo** :
   - Va sur une propriété
   - Clique sur "Prendre rendez-vous"
   - Sélectionne "Appel vidéo" comme type de visite
   - Complète le formulaire et soumets

2. **Accéder à l'appel vidéo** :
   - Va dans "Rendez-vous" (Admin ou Profil)
   - Pour les rendez-vous vidéo, un bouton "Rejoindre" apparaît
   - Clique sur "Rejoindre" pour ouvrir l'écran d'appel vidéo

3. **Lancer l'appel** :
   - Dans l'écran d'appel vidéo, clique sur "Démarrer l'appel vidéo"
   - Le lien de réunion s'ouvrira (Zoom, Google Meet, ou solution personnalisée)

### Pour les développeurs

#### Créer un appel vidéo manuellement

```typescript
import { createVideoCall } from '../services/videoCallService';

const videoCall = await createVideoCall(appointmentId, {
  provider: 'custom', // ou 'zoom', 'google_meet'
  duration: 60, // en minutes
});
```

#### Obtenir un appel vidéo

```typescript
import { getVideoCallByAppointment } from '../services/videoCallService';

const videoCall = await getVideoCallByAppointment(appointmentId);
```

#### Démarrer/Arrêter un appel

```typescript
import { startVideoCall, endVideoCall } from '../services/videoCallService';

// Démarrer
await startVideoCall(videoCallId);

// Arrêter
await endVideoCall(videoCallId);
```

## 🔧 Configuration des fournisseurs

### Option 1 : Custom (par défaut)
- Génère un ID de réunion unique
- Format : `niumba://video-call/{meeting_id}`
- **À implémenter** : Intégrer avec votre propre solution WebRTC

### Option 2 : Zoom
- Format : `https://zoom.us/j/{meeting_id}?pwd={password}`
- **À configurer** : Intégrer avec l'API Zoom pour créer de vraies réunions

### Option 3 : Google Meet
- Format : `https://meet.google.com/{meeting_id}`
- **À configurer** : Intégrer avec l'API Google Meet

## 📱 Intégration WebRTC (Option avancée)

Pour implémenter une vraie solution d'appel vidéo dans l'app :

1. **Installer les dépendances** :
```bash
npm install react-native-webrtc
# ou
npm install @react-native-community/webrtc
```

2. **Créer un serveur de signalisation** :
   - Utiliser Socket.io ou WebSockets
   - Gérer l'échange de SDP (Session Description Protocol)
   - Gérer les candidats ICE

3. **Modifier `VideoCallScreen.tsx`** :
   - Ajouter les composants WebRTC
   - Gérer les streams vidéo/audio
   - Implémenter la connexion peer-to-peer

## 🎯 Prochaines étapes recommandées

1. **Intégrer Zoom API** (si tu veux utiliser Zoom) :
   - Créer un compte Zoom Developer
   - Obtenir les clés API
   - Modifier `createVideoCall` pour créer de vraies réunions Zoom

2. **Intégrer Google Meet API** (si tu veux utiliser Google Meet) :
   - Créer un projet Google Cloud
   - Activer Google Meet API
   - Modifier `createVideoCall` pour créer de vraies réunions

3. **Implémenter WebRTC** (solution personnalisée) :
   - Installer les dépendances WebRTC
   - Créer un serveur de signalisation
   - Modifier `VideoCallScreen` pour utiliser WebRTC

## 📝 Notes importantes

- Les appels vidéo sont automatiquement créés quand un rendez-vous vidéo est créé
- Le lien de réunion est stocké dans `appointments.video_url` et `video_calls.meeting_url`
- Les utilisateurs peuvent accéder aux appels vidéo depuis l'écran des rendez-vous
- Pour l'instant, les liens sont générés mais nécessitent une intégration avec un service externe pour fonctionner

## 🐛 Dépannage

### La table n'existe pas
- Exécute le script SQL `CREATE_VIDEO_CALLS_TABLE.sql` dans Supabase

### L'appel vidéo n'est pas créé
- Vérifie que le type de rendez-vous est bien `video_call`
- Vérifie les logs dans la console pour voir les erreurs

### Le bouton "Rejoindre" n'apparaît pas
- Vérifie que `appointment.visitType === 'video_call'`
- Vérifie que la navigation vers `VideoCall` est bien configurée


