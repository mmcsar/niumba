# 🔗 Guide de Configuration HubSpot - Niumba

## 📋 Vue d'ensemble

HubSpot est intégré dans Niumba pour tracker automatiquement :
- ✅ Les inscriptions d'utilisateurs
- ✅ Les demandes de contact (inquiries)
- ✅ Les rendez-vous (appointments)
- ✅ Les transactions immobilières (deals)

---

## 🔑 Étape 1 : Créer une Private App dans HubSpot

1. Connectez-vous à [HubSpot](https://app.hubspot.com)
2. Allez dans **Settings** (⚙️) → **Integrations** → **Private Apps**
3. Cliquez sur **Create a private app**
4. Donnez un nom à votre app (ex: "Niumba CRM Integration")
5. Configurez les scopes nécessaires :
   - ✅ **crm.objects.contacts** (read, write)
   - ✅ **crm.objects.deals** (read, write)
   - ✅ **crm.objects.notes** (read, write)
   - ✅ **crm.schemas.contacts** (read)
   - ✅ **crm.schemas.deals** (read)
6. Cliquez sur **Create app**
7. **Copiez le Access Token** (vous ne pourrez plus le voir après)

---

## 🔑 Étape 2 : Obtenir votre Portal ID

1. Dans HubSpot, regardez l'URL de votre navigateur
2. L'URL ressemble à : `https://app.hubspot.com/contacts/[PORTAL_ID]/...`
3. Le **Portal ID** est le numéro dans l'URL (ex: `12345678`)

---

## ⚙️ Étape 3 : Configurer dans Niumba

1. Ouvrez le fichier `src/config/integrations.ts`
2. Mettez à jour la configuration HubSpot :

```typescript
hubspot: {
  enabled: true, // Activez HubSpot
  apiKey: 'votre-access-token-ici', // Collez l'Access Token
  portalId: 'votre-portal-id-ici', // Collez le Portal ID
},
```

3. Sauvegardez le fichier

---

## 🎯 Étape 4 : Créer les Custom Properties (Optionnel mais recommandé)

Pour mieux tracker les données immobilières, créez ces custom properties dans HubSpot :

### Pour les Contacts :

1. Allez dans **Settings** → **Properties** → **Contact properties**
2. Créez ces propriétés :
   - `property_interest` (Single-line text) - Intérêt : Achat/Location
   - `budget_min` (Number) - Budget minimum
   - `budget_max` (Number) - Budget maximum
   - `preferred_city` (Single-line text) - Ville préférée
   - `preferred_property_type` (Single-line text) - Type de propriété préféré

### Pour les Deals :

1. Allez dans **Settings** → **Properties** → **Deal properties**
2. Créez ces propriétés :
   - `property_id` (Single-line text) - ID de la propriété
   - `property_type` (Single-line text) - Type de propriété
   - `property_address` (Single-line text) - Adresse de la propriété

---

## 🧪 Étape 5 : Tester l'intégration

1. Redémarrez l'application Expo
2. Créez un nouveau compte utilisateur
3. Faites une demande de contact pour une propriété
4. Planifiez un rendez-vous
5. Vérifiez dans HubSpot que les données apparaissent :
   - **Contacts** → Vous devriez voir le nouvel utilisateur
   - **Deals** → Vous devriez voir les transactions créées
   - **Notes** → Vous devriez voir les notes associées

---

## 📊 Ce qui est tracké automatiquement

### 1. Inscriptions d'utilisateurs
- ✅ Contact créé/mis à jour dans HubSpot
- ✅ Note ajoutée avec le rôle de l'utilisateur

### 2. Demandes de contact (Inquiries)
- ✅ Contact créé/mis à jour
- ✅ Deal créé avec les détails de la propriété
- ✅ Note ajoutée avec le message de la demande

### 3. Rendez-vous (Appointments)
- ✅ Contact créé/mis à jour
- ✅ Note ajoutée avec les détails du rendez-vous

---

## 🔒 Sécurité

⚠️ **Important** : Ne commitez jamais vos clés API dans Git !

1. Ajoutez `src/config/integrations.ts` à `.gitignore` si vous stockez les clés directement
2. Ou utilisez des variables d'environnement (recommandé)

### Utiliser des variables d'environnement (Optionnel)

1. Installez `react-native-dotenv` :
```bash
npm install react-native-dotenv
```

2. Créez un fichier `.env` :
```
HUBSPOT_API_KEY=votre-clé
HUBSPOT_PORTAL_ID=votre-portal-id
```

3. Mettez à jour `integrations.ts` pour lire depuis les variables d'environnement

---

## 🐛 Dépannage

### Les données n'apparaissent pas dans HubSpot

1. ✅ Vérifiez que `enabled: true` dans `integrations.ts`
2. ✅ Vérifiez que l'Access Token est correct
3. ✅ Vérifiez que le Portal ID est correct
4. ✅ Vérifiez les logs dans la console Expo pour les erreurs
5. ✅ Vérifiez que les scopes sont correctement configurés dans HubSpot

### Erreur "401 Unauthorized"

- L'Access Token est invalide ou expiré
- Régénérez un nouveau token dans HubSpot

### Erreur "403 Forbidden"

- Les scopes ne sont pas suffisants
- Vérifiez que tous les scopes nécessaires sont activés

---

## 📚 Ressources

- [HubSpot API Documentation](https://developers.hubspot.com/docs/api/overview)
- [HubSpot Private Apps Guide](https://developers.hubspot.com/docs/api/working-with-oauth)
- [HubSpot Custom Properties](https://knowledge.hubspot.com/settings/create-and-edit-properties)

---

## ✅ Configuration terminée !

Une fois configuré, HubSpot trackera automatiquement toutes les interactions importantes dans Niumba.



