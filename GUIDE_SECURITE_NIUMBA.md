# 🔒 Guide de sécurité pour Niumba

## 🎯 Vue d'ensemble

Ce guide couvre tous les aspects de sécurité pour protéger votre application Niumba, vos données et vos utilisateurs.

---

## 1. 🔐 Sécurité des credentials et secrets

### ⚠️ CRITIQUE : Ne jamais commiter les secrets

#### A. Variables d'environnement

**Créez un fichier `.env` (NE PAS COMMITER) :**
```env
EXPO_PUBLIC_SUPABASE_URL=votre_url_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role
API_SECRET_KEY=votre_secret
```

**Ajoutez à `.gitignore` :**
```
.env
.env.local
.env.production
*.key
*.pem
credentials.json
```

#### B. Secrets dans le code

**❌ MAUVAIS :**
```typescript
const API_KEY = "sk_live_1234567890"; // DANGEREUX !
```

**✅ BON :**
```typescript
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;
```

#### C. Fichiers à protéger

- [ ] `.env` et toutes les variantes
- [ ] Clés API
- [ ] Secrets Supabase
- [ ] Certificats de signature
- [ ] Credentials Firebase
- [ ] Tokens d'authentification

---

## 2. 🛡️ Sécurité de l'APK

### A. Obfuscation du code (R8/ProGuard)

**Activer dans `app.json` :**
```json
{
  "expo": {
    "android": {
      "enableProguardInReleaseBuilds": true
    }
  }
}
```

**Avantages :**
- Réduit la taille de l'app
- Rend le code plus difficile à reverse-engineer
- Protège votre code source

### B. Signature de l'APK

**Important :**
- ✅ Gardez votre keystore en sécurité
- ✅ Ne partagez jamais votre keystore
- ✅ Sauvegardez votre keystore
- ✅ Utilisez un mot de passe fort

**Sauvegarde du keystore :**
```bash
# Sauvegardez dans un endroit sécurisé
# Exemple : coffre-fort, cloud sécurisé, etc.
```

### C. Distribution sécurisée de l'APK

**Recommandations :**
- ✅ Utilisez HTTPS pour les téléchargements
- ✅ Vérifiez l'intégrité (hash MD5/SHA256)
- ✅ Signez l'APK avec votre certificat
- ✅ Partagez via des canaux sécurisés

---

## 3. 🔑 Sécurité Supabase

### A. Clés API

**Règles importantes :**
- ✅ Utilisez la clé `anon` côté client (publique mais limitée)
- ❌ Ne jamais exposer la clé `service_role` côté client
- ✅ Utilisez RLS (Row Level Security) pour protéger les données
- ✅ Limitez les permissions dans Supabase

### B. Row Level Security (RLS)

**Vérifiez que RLS est activé :**
```sql
-- Vérifier RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

**Exemple de politique RLS :**
```sql
-- Les utilisateurs ne peuvent voir que leurs propres données
CREATE POLICY "Users can view own data"
ON profiles FOR SELECT
USING (auth.uid() = id);
```

### C. Authentification

**Bonnes pratiques :**
- ✅ Utilisez l'authentification Supabase
- ✅ Validez les tokens côté serveur
- ✅ Implémentez la déconnexion automatique
- ✅ Gérez les sessions expirées

---

## 4. 🔒 Sécurité des données utilisateur

### A. Données sensibles

**Ne stockez jamais en clair :**
- ❌ Mots de passe
- ❌ Numéros de carte bancaire
- ❌ Informations médicales sensibles
- ❌ Données personnelles identifiables

**✅ Utilisez le chiffrement :**
```typescript
import * as SecureStore from 'expo-secure-store';

// Stocker de manière sécurisée
await SecureStore.setItemAsync('token', userToken);

// Récupérer
const token = await SecureStore.getItemAsync('token');
```

### B. Conformité RGPD

**Obligations :**
- [ ] Politique de confidentialité claire
- [ ] Consentement utilisateur
- [ ] Droit à l'effacement
- [ ] Droit d'accès aux données
- [ ] Notification en cas de fuite

### C. Protection des données

**Recommandations :**
- ✅ Chiffrez les données sensibles
- ✅ Limitez la collecte de données
- ✅ Supprimez les données inutiles
- ✅ Anonymisez les données analytiques

---

## 5. 🌐 Sécurité réseau

### A. HTTPS uniquement

**Toujours utiliser HTTPS :**
```typescript
// ✅ BON
const API_URL = 'https://api.exemple.com';

// ❌ MAUVAIS
const API_URL = 'http://api.exemple.com';
```

### B. Validation des certificats

**Vérifiez les certificats SSL :**
- ✅ Utilisez des certificats valides
- ✅ Vérifiez l'expiration
- ✅ Utilisez des certificats signés

### C. Protection contre les attaques

**Implémentez :**
- ✅ Rate limiting
- ✅ Validation des entrées
- ✅ Protection CSRF
- ✅ Headers de sécurité

---

## 6. 👤 Sécurité utilisateur

### A. Authentification

**Bonnes pratiques :**
- ✅ Mots de passe forts (minimum 8 caractères)
- ✅ Authentification à deux facteurs (2FA) si possible
- ✅ Limitation des tentatives de connexion
- ✅ Détection des activités suspectes

### B. Permissions

**Gérez les permissions :**
- ✅ Demandez uniquement les permissions nécessaires
- ✅ Expliquez pourquoi vous avez besoin de chaque permission
- ✅ Permettez aux utilisateurs de révoquer les permissions
- ✅ Respectez les refus de permissions

### C. Protection de la vie privée

**Respectez la vie privée :**
- ✅ Ne collectez que les données nécessaires
- ✅ Informez les utilisateurs de l'utilisation des données
- ✅ Permettez la suppression des données
- ✅ Respectez les préférences de confidentialité

---

## 7. 🔍 Sécurité du code

### A. Dépendances

**Vérifiez régulièrement :**
```bash
# Vérifier les vulnérabilités
npm audit

# Mettre à jour les dépendances
npm update
```

**Outils :**
- `npm audit` - Détecte les vulnérabilités
- `snyk` - Analyse de sécurité
- `dependabot` - Mises à jour automatiques

### B. Validation des entrées

**Toujours valider :**
```typescript
// ✅ BON
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ❌ MAUVAIS
function processInput(input: any) {
  // Pas de validation
  return input;
}
```

### C. Gestion des erreurs

**Ne pas exposer d'informations sensibles :**
```typescript
// ✅ BON
catch (error) {
  console.error('Erreur:', error);
  // Message générique pour l'utilisateur
  showError('Une erreur est survenue');
}

// ❌ MAUVAIS
catch (error) {
  // Expose des détails techniques
  showError(`Erreur SQL: ${error.sql}`);
}
```

---

## 8. 📱 Sécurité mobile

### A. Stockage local

**Utilisez SecureStore :**
```typescript
import * as SecureStore from 'expo-secure-store';

// Stockage sécurisé
await SecureStore.setItemAsync('key', 'value');
```

**Évitez :**
- ❌ AsyncStorage pour les données sensibles
- ❌ Stockage en clair dans les fichiers

### B. Protection de l'appareil

**Recommandations :**
- ✅ Détection du root/jailbreak
- ✅ Protection contre le débogage
- ✅ Vérification de l'intégrité de l'app

### C. Permissions Android

**Vérifiez dans `app.json` :**
```json
{
  "android": {
    "permissions": [
      "ACCESS_FINE_LOCATION", // Seulement si nécessaire
      "CAMERA" // Seulement si nécessaire
    ]
  }
}
```

---

## 9. 🔐 Sécurité des builds

### A. Secrets de build

**Ne jamais inclure dans le code :**
- ❌ Clés API de production
- ❌ Secrets de base de données
- ❌ Certificats de signature

**Utilisez :**
- ✅ Variables d'environnement
- ✅ Secrets EAS (pour Expo)
- ✅ Services de gestion de secrets

### B. Configuration EAS

**Sécurisez les secrets :**
```bash
# Ajouter un secret
eas secret:create --scope project --name API_KEY --value your_key

# Utiliser dans le build
# Les secrets sont automatiquement disponibles
```

### C. Keystore Android

**Protection :**
- ✅ Mot de passe fort (minimum 20 caractères)
- ✅ Sauvegarde sécurisée (coffre-fort)
- ✅ Ne jamais partager
- ✅ Rotation régulière

---

## 10. 🛡️ Checklist de sécurité

### Avant la publication

- [ ] Tous les secrets dans `.env` (non commité)
- [ ] `.gitignore` configuré correctement
- [ ] RLS activé dans Supabase
- [ ] Permissions Android minimales
- [ ] HTTPS pour toutes les API
- [ ] Validation des entrées utilisateur
- [ ] Gestion sécurisée des erreurs
- [ ] Politique de confidentialité créée
- [ ] Keystore sauvegardé et sécurisé
- [ ] Dépendances à jour (`npm audit`)

### Après la publication

- [ ] Surveiller les logs d'erreurs
- [ ] Surveiller les tentatives d'accès suspectes
- [ ] Mettre à jour les dépendances régulièrement
- [ ] Réviser les permissions utilisateur
- [ ] Vérifier les certificats SSL
- [ ] Sauvegarder les données régulièrement

---

## 11. 🚨 Réponse aux incidents

### En cas de fuite de données

1. **Identifier** la source de la fuite
2. **Contenir** l'incident immédiatement
3. **Notifier** les utilisateurs affectés
4. **Révoquer** les credentials compromis
5. **Corriger** la vulnérabilité
6. **Documenter** l'incident

### En cas de compromission

1. **Changer** tous les mots de passe
2. **Révoquer** tous les tokens
3. **Analyser** l'étendue de la compromission
4. **Corriger** les vulnérabilités
5. **Notifier** les parties concernées

---

## 12. 📚 Ressources

### Outils de sécurité

- **npm audit** : Détection de vulnérabilités
- **Snyk** : Analyse de sécurité
- **OWASP Mobile** : Guide de sécurité mobile
- **Expo SecureStore** : Stockage sécurisé

### Documentation

- **Expo Security** : https://docs.expo.dev/guides/security/
- **Supabase Security** : https://supabase.com/docs/guides/auth/security
- **OWASP Mobile** : https://owasp.org/www-project-mobile-security/

---

## ✅ Actions immédiates

### 1. Vérifier les secrets

```bash
# Vérifier qu'aucun secret n'est dans le code
grep -r "API_KEY\|SECRET\|PASSWORD" --exclude-dir=node_modules .
```

### 2. Configurer .gitignore

Assurez-vous que `.gitignore` contient :
```
.env
.env.local
.env.production
*.key
*.pem
credentials.json
```

### 3. Activer RLS dans Supabase

Vérifiez que RLS est activé sur toutes les tables sensibles.

### 4. Audit des dépendances

```bash
npm audit
npm audit fix
```

---

## 🎯 Priorités de sécurité

### Critique (À faire immédiatement)
1. ✅ Protéger les secrets (variables d'environnement)
2. ✅ Activer RLS dans Supabase
3. ✅ Utiliser HTTPS partout
4. ✅ Valider toutes les entrées

### Important (À faire rapidement)
1. ✅ Obfuscation du code (R8/ProGuard)
2. ✅ Sécuriser le keystore
3. ✅ Politique de confidentialité
4. ✅ Audit des dépendances

### Recommandé (À faire progressivement)
1. ✅ Authentification 2FA
2. ✅ Détection d'anomalies
3. ✅ Chiffrement avancé
4. ✅ Monitoring de sécurité

---

## 🔒 Conclusion

La sécurité est un processus continu. Réviser et améliorer régulièrement la sécurité de votre application.

**Rappelez-vous :**
- La sécurité commence par le code
- Protégez les données utilisateur
- Surveillez et réagissez rapidement
- Restez à jour avec les meilleures pratiques



