# 🚀 Guide de Configuration Supabase - Niumba

## Étape 1 : Connexion à Supabase

1. Ouvrez [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Connectez-vous avec vos identifiants
3. Sélectionnez le projet **mbenioxoabiusjdqzhtk**

---

## Étape 2 : Activer les extensions PostgreSQL

Allez dans **Database** → **Extensions** et activez :
- ✅ `uuid-ossp` (pour générer des UUIDs)
- ✅ `postgis` (pour les requêtes géospatiales)

---

## Étape 3 : Exécuter le schéma SQL

1. Allez dans **SQL Editor** (menu de gauche)
2. Cliquez sur **New Query**
3. Copiez et collez le contenu du fichier `supabase/schema.sql`
4. Cliquez sur **Run** (ou Ctrl+Enter)

⚠️ **Important** : Exécutez le schéma en plusieurs parties si vous avez des erreurs :                                                                      
- Partie 1 : Extensions et Types ENUM
- Partie 2 : Tables
- Partie 3 : Indexes
- Partie 4 : RLS Policies
- Partie 5 : Functions et Triggers

## Étape 3.5 : Activer le RLS (Row Level Security) ⚠️ IMPORTANT

**Le RLS doit être activé pour sécuriser votre base de données !**

1. Allez dans **SQL Editor**
2. Exécutez d'abord `supabase/activate_rls.sql` pour activer RLS sur toutes les tables
3. Ensuite, exécutez `supabase/rls_with_auth.sql` pour créer toutes les policies de sécurité

**OU** utilisez le script tout-en-un :
```sql
-- Exécutez rls_with_auth.sql qui active RLS et crée toutes les policies
```

📋 **Vérification** : Consultez `VERIFY_RLS.md` pour vérifier que le RLS est bien configuré

---

## Étape 4 : Créer les buckets Storage

1. Allez dans **Storage** (menu de gauche)
2. Cliquez sur **New Bucket**

### Bucket 1 : property-images (Public)
```
Name: property-images
Public: ✅ Oui
```

### Bucket 2 : avatars (Public)
```
Name: avatars
Public: ✅ Oui
```

### Bucket 3 : documents (Privé)
```
Name: documents
Public: ❌ Non
```

### Bucket 4 : chat-attachments (Privé)
```
Name: chat-attachments
Public: ❌ Non
```

---

## Étape 5 : Configurer les policies Storage

### Pour property-images :

Allez dans **Storage** → **property-images** → **Policies** → **New Policy**

**Policy 1 - Lecture publique :**
```sql
-- Name: Public Read
-- Allowed operation: SELECT
CREATE POLICY "Public Read" ON storage.objects
FOR SELECT USING (bucket_id = 'property-images');
```

**Policy 2 - Upload authentifié :**
```sql
-- Name: Authenticated Upload
-- Allowed operation: INSERT
CREATE POLICY "Authenticated Upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'property-images' 
  AND auth.role() = 'authenticated'
);
```

**Policy 3 - Propriétaire peut modifier :**
```sql
-- Name: Owner Update
-- Allowed operation: UPDATE
CREATE POLICY "Owner Update" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'property-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Policy 4 - Propriétaire peut supprimer :**
```sql
-- Name: Owner Delete
-- Allowed operation: DELETE
CREATE POLICY "Owner Delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'property-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### Pour avatars :

**Policy 1 - Lecture publique :**
```sql
CREATE POLICY "Public Read Avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');
```

**Policy 2 - Upload son propre avatar :**
```sql
CREATE POLICY "Upload Own Avatar" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Policy 3 - Modifier son avatar :**
```sql
CREATE POLICY "Update Own Avatar" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Policy 4 - Supprimer son avatar :**
```sql
CREATE POLICY "Delete Own Avatar" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## Étape 6 : Activer Realtime

1. Allez dans **Database** → **Replication**
2. Activez Realtime pour ces tables :
   - ✅ `messages`
   - ✅ `notifications`
   - ✅ `inquiries`
   - ✅ `appointments`

Ou exécutez ce SQL :
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE inquiries;
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
```

---

## Étape 7 : Vérifier la configuration

### Test de connexion (dans SQL Editor) :
```sql
-- Vérifier les tables créées
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;

-- Vérifier les villes
SELECT * FROM cities;

-- Tester la fonction de proximité
SELECT * FROM get_nearby_properties(-11.6876, 27.4847, 10, 5);
```

---

## Étape 8 : Créer un utilisateur admin (optionnel)

1. Allez dans **Authentication** → **Users**
2. Créez un utilisateur avec votre email
3. Exécutez ce SQL pour lui donner le rôle admin :

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'votre-email@example.com';
```

---

## ✅ Configuration terminée !

Votre base de données Supabase est maintenant prête pour Niumba.

### Tables créées :
- `profiles` - Utilisateurs
- `properties` - Propriétés immobilières
- `saved_properties` - Favoris
- `inquiries` - Demandes de contact
- `reviews` - Avis
- `conversations` & `messages` - Chat
- `notifications` - Notifications
- `appointments` - Rendez-vous
- `agents` - Agents immobiliers
- `search_alerts` - Alertes de recherche
- `cities` - Villes (Haut-Katanga & Lualaba)
- `price_history` - Historique des prix
- `property_views` - Analytics

### Fonctionnalités :
- ✅ Row Level Security (RLS)
- ✅ Triggers automatiques
- ✅ Recherche géospatiale (PostGIS)
- ✅ Notifications en temps réel
- ✅ Stockage d'images

---

## 🆘 Besoin d'aide ?

Si vous rencontrez des erreurs :
1. Vérifiez que les extensions sont activées
2. Exécutez le schéma par parties
3. Vérifiez les logs dans **Logs** → **Postgres Logs**

