# 🔧 Corriger les Problèmes du Dashboard Admin

## Problèmes Courants et Solutions

### 1. Les statistiques ne se chargent pas
**Symptôme** : Les cartes de statistiques affichent 0 ou ne se chargent pas

**Cause** : Permissions RLS ou tables manquantes

**Solution** :
- Vérifier que les policies RLS permettent aux admins de voir toutes les données
- Exécuter le script de diagnostic SQL pour vérifier les tables

### 2. Les écrans ne s'ouvrent pas au clic
**Symptôme** : Rien ne se passe quand on clique sur un menu

**Cause** : Navigation incorrecte ou écran non trouvé

**Solution** :
- Vérifier les logs Expo pour voir l'erreur exacte
- Vérifier que l'écran est bien dans `RootStackParamList`

### 3. Les données ne s'affichent pas dans les écrans admin
**Symptôme** : Écran vide ou erreur de chargement

**Cause** : Hooks qui retournent des erreurs ou permissions RLS

**Solution** :
- Vérifier les logs pour voir les erreurs exactes
- Vérifier que les policies RLS permettent aux admins d'accéder aux données

### 4. Les actions ne fonctionnent pas (ajouter, modifier, supprimer)
**Symptôme** : Boutons ne font rien ou erreur

**Cause** : Permissions RLS ou services qui échouent

**Solution** :
- Vérifier les logs pour voir les erreurs exactes
- Vérifier que les policies RLS permettent aux admins de modifier les données

## Script de Diagnostic

Exécutez ce script dans Supabase SQL Editor pour vérifier les permissions admin :

```sql
-- Vérifier que les policies permettent aux admins d'accéder aux données
SELECT 
  tablename,
  policyname,
  cmd as operation,
  qual as using_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('properties', 'profiles', 'agents', 'inquiries', 'appointments')
  AND (qual::text LIKE '%admin%' OR qual::text LIKE '%role%')
ORDER BY tablename, policyname;
```

## Checklist de Vérification

### Navigation
- [ ] AdminDashboard s'ouvre correctement
- [ ] AdminProperties s'ouvre au clic
- [ ] AdminUsers s'ouvre au clic
- [ ] AdminAgents s'ouvre au clic
- [ ] AdminInquiries s'ouvre au clic
- [ ] AdminAppointments s'ouvre au clic

### Données
- [ ] Les statistiques se chargent
- [ ] La liste des propriétés s'affiche
- [ ] La liste des utilisateurs s'affiche
- [ ] La liste des agents s'affiche
- [ ] La liste des demandes s'affiche
- [ ] La liste des rendez-vous s'affiche

### Actions
- [ ] Ajouter une propriété fonctionne
- [ ] Modifier une propriété fonctionne
- [ ] Supprimer une propriété fonctionne
- [ ] Ajouter un agent fonctionne
- [ ] Créer des propriétés d'exemple fonctionne

## Prochaines Étapes

1. **Testez chaque fonctionnalité** et notez ce qui ne fonctionne pas
2. **Vérifiez les logs Expo** pour voir les erreurs exactes
3. **Envoyez-moi** :
   - Les fonctionnalités qui ne fonctionnent pas
   - Les erreurs de la console Expo
   - Ce qui se passe quand vous cliquez

Je pourrai alors créer des corrections spécifiques pour chaque problème.


