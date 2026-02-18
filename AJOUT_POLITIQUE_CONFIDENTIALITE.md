# Ajout de la Politique de Confidentialité

## Résumé
Une politique de confidentialité complète a été ajoutée à l'application Niumba, accessible depuis le dashboard admin et le profil utilisateur.

## Fichiers créés/modifiés

### 1. Nouvel écran : `src/screens/PrivacyPolicyScreen.tsx`
- Écran complet avec 9 sections détaillées :
  1. Introduction
  2. Données collectées
  3. Utilisation des données
  4. Stockage et sécurité
  5. Partage des données
  6. Droits des utilisateurs
  7. Cookies et suivi
  8. Confidentialité des enfants
  9. Contact
- Support bilingue (Français/Anglais)
- Design cohérent avec le reste de l'application

### 2. Navigation : `src/navigation/index.tsx`
- Ajout de l'import `PrivacyPolicyScreen`
- Ajout de la route `PrivacyPolicy` dans `RootStackParamList`
- Ajout du `Stack.Screen` pour `PrivacyPolicy`

### 3. Dashboard Admin : `src/screens/admin/AdminDashboard.tsx`
- Ajout d'un nouveau `MenuItem` dans la section "Settings" :
  - Icône : `shield-checkmark`
  - Label : "Privacy Policy" / "Politique de confidentialité"
  - Navigation vers l'écran `PrivacyPolicy`

### 4. Profil Utilisateur : `src/screens/ProfileScreen.tsx`
- Mise à jour du bouton "Privacy Policy" pour naviguer vers l'écran dédié
- Remplacement de `onPress={() => {}}` par `onPress={() => navigation.navigate('PrivacyPolicy')}`

## Contenu de la politique

La politique couvre :
- ✅ Collecte de données (informations personnelles, propriétés, usage, appareil, localisation)
- ✅ Utilisation des données (services, notifications, personnalisation, analyse, sécurité)
- ✅ Stockage sécurisé (Supabase, RLS, HTTPS/TLS, audits)
- ✅ Partage limité (propriétaires/agents, fournisseurs, obligations légales)
- ✅ Droits des utilisateurs (accès, correction, suppression, opt-out, export)
- ✅ Cookies et tracking (stockage local, pas de cookies tiers, analytics anonymisés)
- ✅ Protection des mineurs (18+)
- ✅ Modifications de la politique
- ✅ Informations de contact

## Accès

La politique de confidentialité est accessible depuis :
1. **Dashboard Admin** → Section "Settings" → "Privacy Policy"
2. **Profil Utilisateur** → Section "Legal" → "Privacy Policy"

## Statut
✅ **Complété** - La politique de confidentialité est maintenant disponible dans l'application.

