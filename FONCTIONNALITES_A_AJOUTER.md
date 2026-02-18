# 🚀 Fonctionnalités à Ajouter - Niumba

## ✅ Déjà Fait

1. ✅ **NotificationsScreen** - MOCK_NOTIFICATIONS supprimé (utilise déjà useNotifications)
2. ✅ **agentService.ts** - Service créé pour gérer les agents
3. ✅ **userService.ts** - Service créé pour gérer les utilisateurs

---

## 📋 À Faire - Écrans avec Données Mockées

### 1. AdminAppointmentsScreen
**Fichier**: `src/screens/admin/AdminAppointmentsScreen.tsx`
**Action**: Remplacer `MOCK_APPOINTMENTS` par des appels à `appointmentService`

**Modifications nécessaires**:
- Importer `getUserAppointments` depuis `appointmentService`
- Utiliser `useAppointments` hook avec `role: 'owner'` ou créer un hook admin
- Transformer les données Supabase pour correspondre à l'interface `Appointment`
- Ajouter gestion d'erreurs et états de chargement

**Code à ajouter**:
```typescript
import { useAppointments } from '../../hooks/useAppointments';
import { useAuth } from '../../context/AuthContext';

// Dans le composant
const { user } = useAuth();
const { appointments: appointmentsData, loading, refresh } = useAppointments({
  role: 'owner', // ou 'agent' selon le contexte
});
```

---

### 2. AdminAgentsScreen
**Fichier**: `src/screens/admin/AdminAgentsScreen.tsx`
**Action**: Remplacer `MOCK_AGENTS` par des appels à `agentService`

**Modifications nécessaires**:
- Créer un hook `useAgents` dans `src/hooks/useAgents.ts`
- Importer et utiliser `getAgents` depuis `agentService`
- Remplacer toutes les références à `MOCK_AGENTS`
- Ajouter pagination et recherche

**Hook à créer** (`src/hooks/useAgents.ts`):
```typescript
import { useState, useEffect, useCallback } from 'react';
import { getAgents, getAgentStats, updateAgentStatus, type Agent } from '../services/agentService';

export const useAgents = (options: {
  isActive?: boolean;
  isVerified?: boolean;
  search?: string;
} = {}) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // ... implémentation
};
```

---

### 3. AdminInquiriesScreen
**Fichier**: `src/screens/admin/AdminInquiriesScreen.tsx`
**Action**: Remplacer `mockInquiries` par des appels à `inquiryService`

**Modifications nécessaires**:
- Utiliser `useOwnerInquiries` depuis `useInquiries` hook
- Ou créer un hook admin pour toutes les inquiries
- Transformer les données pour correspondre à l'interface

---

### 4. AdminUsersScreen
**Fichier**: `src/screens/admin/AdminUsersScreen.tsx`
**Action**: Remplacer `mockUsers` par des appels à `userService`

**Modifications nécessaires**:
- Créer un hook `useUsers` dans `src/hooks/useUsers.ts`
- Importer et utiliser `getUsers` depuis `userService`
- Ajouter pagination, recherche et filtres

---

### 5. VirtualTourScreen
**Fichier**: `src/screens/VirtualTourScreen.tsx`
**Action**: Remplacer `MOCK_TOUR_ROOMS` par des données depuis Supabase

**Modifications nécessaires**:
- Créer une table `virtual_tours` dans Supabase (ou utiliser un champ JSON dans properties)
- Créer un service `virtualTourService.ts`
- Charger les données depuis Supabase

**Structure de table suggérée**:
```sql
CREATE TABLE virtual_tours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id),
  room_name TEXT,
  room_type TEXT,
  panorama_url TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 6. AdminDashboard
**Fichier**: `src/screens/admin/AdminDashboard.tsx`
**Action**: Remplacer le mode démo par des vraies données Supabase

**Modifications nécessaires**:
- Créer un service `adminService.ts` pour les statistiques admin
- Remplacer les données mockées par des requêtes réelles
- Ajouter gestion d'erreurs

---

## 🔧 Fonctionnalités Backend Avancées

### 7. Supabase Edge Functions

**Créer les fonctions suivantes**:

1. **`send-notification`** - Envoyer des notifications push
   - Fichier: `supabase/functions/send-notification/index.ts`
   - Utilisation: Webhook pour envoyer des notifications

2. **`process-payment`** - Traitement des paiements (si nécessaire)
   - Fichier: `supabase/functions/process-payment/index.ts`

3. **`sync-hubspot`** - Synchronisation avec HubSpot
   - Fichier: `supabase/functions/sync-hubspot/index.ts`

**Structure**:
```
supabase/
  functions/
    send-notification/
      index.ts
    process-payment/
      index.ts
    sync-hubspot/
      index.ts
```

**Exemple de fonction** (`send-notification/index.ts`):
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { userId, title, body } = await req.json()
  
  // Logique d'envoi de notification
  // ...
  
  return new Response(
    JSON.stringify({ success: true }),
    { headers: { "Content-Type": "application/json" } },
  )
})
```

---

### 8. Webhooks

**Créer des webhooks Supabase pour**:

1. **Nouvelle propriété** - Notifier les utilisateurs avec alertes
2. **Nouveau rendez-vous** - Envoyer notifications
3. **Nouvelle demande** - Notifier le propriétaire
4. **Changement de prix** - Notifier les utilisateurs intéressés

**Configuration dans Supabase Dashboard**:
- Database → Webhooks
- Créer un webhook pour chaque événement
- URL: Pointer vers vos Edge Functions

---

### 9. Rate Limiting

**Implémenter dans**:
- `src/services/rateLimitService.ts`

**Fonctionnalités**:
- Limiter les requêtes par utilisateur
- Limiter les créations (propriétés, avis, etc.)
- Utiliser Supabase RLS ou Edge Functions

**Exemple**:
```typescript
export const checkRateLimit = async (
  userId: string,
  action: string
): Promise<boolean> => {
  // Vérifier dans une table rate_limits
  // Retourner true si OK, false si limité
};
```

---

### 10. CDN pour Assets

**Configuration**:
1. Utiliser Supabase Storage avec CDN
2. Ou configurer Cloudflare/CDN externe
3. Optimiser les images avec `imageOptimizationService.ts` (déjà créé)

**Modifications**:
- Mettre à jour les URLs d'images pour utiliser le CDN
- Configurer dans `src/config/storage.ts`

---

## 📚 Documentation

### 11. JSDoc sur Tous les Services

**Ajouter JSDoc à**:
- `chatService.ts`
- `reviewService.ts`
- `inquiryService.ts`
- `appointmentService.ts`
- `notificationService.ts`
- `agentService.ts` ✅ (nouveau)
- `userService.ts` ✅ (nouveau)
- `hubspotService.ts`

**Format**:
```typescript
/**
 * Get all agents with optional filters
 * @param options - Filter and pagination options
 * @param options.page - Page number (default: 0)
 * @param options.pageSize - Items per page (default: 20)
 * @param options.isActive - Filter by active status
 * @returns Promise with agents data and count
 * @example
 * const { data, count } = await getAgents({ page: 0, pageSize: 20 });
 */
```

---

### 12. Optimiser Pagination Partout

**Fichiers à vérifier**:
- Tous les services qui retournent des listes
- S'assurer que la pagination est cohérente
- Ajouter `hasMore` et `loadMore` partout

---

### 13. Améliorer le Cache

**Fichier**: `src/services/cacheService.ts` (déjà créé)

**Améliorations**:
- Ajouter TTL (Time To Live) pour les caches
- Implémenter invalidation de cache
- Ajouter cache pour les requêtes fréquentes

---

### 14. Performance Monitoring

**Implémenter**:
- Utiliser `loggerService.ts` (déjà créé)
- Ajouter métriques de performance
- Intégrer avec Sentry (quand configuré)

**Métriques à tracker**:
- Temps de réponse des API
- Taux d'erreur
- Utilisation mémoire
- Temps de chargement des écrans

---

## 🎯 Priorités

### Priorité 1 (Critique)
1. ✅ NotificationsScreen - FAIT
2. AdminAppointmentsScreen
3. AdminAgentsScreen
4. AdminInquiriesScreen
5. AdminUsersScreen

### Priorité 2 (Important)
6. AdminDashboard
7. VirtualTourScreen
8. JSDoc sur services

### Priorité 3 (Amélioration)
9. Supabase Edge Functions
10. Webhooks
11. Rate Limiting
12. CDN Configuration
13. Optimisation Pagination
14. Amélioration Cache
15. Performance Monitoring

---

## 📝 Notes

- Tous les services doivent gérer le cas où Supabase n'est pas configuré
- Utiliser `isSupabaseConfigured()` avant chaque appel
- Ajouter gestion d'erreurs partout
- Tester chaque intégration après modification

---

## 🚀 Prochaines Étapes

1. Intégrer AdminAppointmentsScreen avec appointmentService
2. Créer useAgents hook et intégrer AdminAgentsScreen
3. Intégrer AdminInquiriesScreen et AdminUsersScreen
4. Créer les Edge Functions de base
5. Ajouter JSDoc progressivement


