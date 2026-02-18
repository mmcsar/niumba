# 🔒 RLS : Interface vs SQL Editor

## ⚠️ Vous êtes dans l'interface Policies

Si Supabase vous demande un "Policy name", c'est que vous êtes dans :
**Database → Tables → [Nom de la table] → Policies → New Policy**

Cette méthode nécessite de créer **chaque policy une par une** (long et fastidieux).

---

## ✅ Solution Recommandée : Utiliser le SQL Editor

### Pourquoi ?
- ✅ Crée **toutes les policies en une fois**
- ✅ Plus rapide (1 clic au lieu de 50+)
- ✅ Moins d'erreurs
- ✅ Script complet et testé

### Comment faire :

1. **Quittez l'interface Policies** (retour en arrière)

2. **Allez dans SQL Editor** (menu de gauche, icône `</>`)

3. **Cliquez sur "New Query"**

4. **Copiez-collez le contenu de `supabase/rls_with_auth.sql`**

5. **Cliquez sur "Run"**

✅ **C'est tout !** Toutes les policies seront créées automatiquement.

---

## 📋 Si vous voulez créer manuellement (non recommandé)

Si vous préférez utiliser l'interface, voici les noms des policies à créer :

### Table: `profiles`
- Policy name: `profiles_select_public` (SELECT, Public)
- Policy name: `profiles_update_own` (UPDATE, Own records)
- Policy name: `profiles_insert_own` (INSERT, Own records)

### Table: `properties`
- Policy name: `properties_select_public` (SELECT, Active properties)
- Policy name: `properties_insert_authenticated` (INSERT, Authenticated)
- Policy name: `properties_update_own` (UPDATE, Own properties)
- Policy name: `properties_delete_own` (DELETE, Own properties)
- Policy name: `properties_admin_full` (ALL, Admin only)

### Table: `saved_properties`
- Policy name: `saved_select_authenticated` (SELECT, Own records)
- Policy name: `saved_insert_authenticated` (INSERT, Own records)
- Policy name: `saved_delete_authenticated` (DELETE, Own records)

### Table: `inquiries`
- Policy name: `inquiries_select_authenticated` (SELECT, Involved users)
- Policy name: `inquiries_insert_authenticated` (INSERT, Authenticated)
- Policy name: `inquiries_update_owner` (UPDATE, Owner only)
- Policy name: `inquiries_admin_select` (SELECT, Admin only)

### Table: `appointments`
- Policy name: `appointments_select_authenticated` (SELECT, Involved users)
- Policy name: `appointments_insert_authenticated` (INSERT, Authenticated)
- Policy name: `appointments_update_authenticated` (UPDATE, Involved users)
- Policy name: `appointments_delete_authenticated` (DELETE, Client only)
- Policy name: `appointments_admin_full` (ALL, Admin only)

### Table: `reviews`
- Policy name: `reviews_select_public` (SELECT, Public)
- Policy name: `reviews_insert_authenticated` (INSERT, Authenticated)
- Policy name: `reviews_update_own` (UPDATE, Own reviews)
- Policy name: `reviews_delete_own` (DELETE, Own reviews)

### Table: `conversations`
- Policy name: `conversations_select_authenticated` (SELECT, Participants)
- Policy name: `conversations_insert_authenticated` (INSERT, Participants)

### Table: `messages`
- Policy name: `messages_select_authenticated` (SELECT, Conversation participants)
- Policy name: `messages_insert_authenticated` (INSERT, Authenticated)

### Table: `notifications`
- Policy name: `notifications_select_authenticated` (SELECT, Own notifications)
- Policy name: `notifications_update_authenticated` (UPDATE, Own notifications)
- Policy name: `notifications_insert_system` (INSERT, System/Admin)

### Table: `search_alerts`
- Policy name: `alerts_select_authenticated` (SELECT, Own alerts)
- Policy name: `alerts_insert_authenticated` (INSERT, Own alerts)
- Policy name: `alerts_update_authenticated` (UPDATE, Own alerts)
- Policy name: `alerts_delete_authenticated` (DELETE, Own alerts)

### Table: `agents`
- Policy name: `agents_select_public` (SELECT, Active agents)
- Policy name: `agents_insert_authenticated` (INSERT, Authenticated)
- Policy name: `agents_update_authenticated` (UPDATE, Own profile)
- Policy name: `agents_admin_full` (ALL, Admin only)

### Table: `cities`
- Policy name: `cities_select_public` (SELECT, Public)
- Policy name: `cities_admin_full` (ALL, Admin only)

### Table: `price_history`
- Policy name: `price_history_select_public` (SELECT, Public)

### Table: `property_views`
- Policy name: `views_insert_public` (INSERT, Public)
- Policy name: `views_select_authorized` (SELECT, Owner/Admin)

---

## 🎯 Recommandation

**Utilisez le SQL Editor** avec le script `rls_with_auth.sql` - c'est beaucoup plus simple et rapide !

Si vous avez besoin d'aide pour utiliser le SQL Editor, dites-moi à quelle étape vous êtes bloqué.



