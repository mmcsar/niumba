# 🔧 Configuration Automatique Supabase

## ⚠️ Important - Sécurité

**Votre clé service role a été partagée.** Pour des raisons de sécurité :

1. ✅ **Utilisez-la maintenant** pour la configuration
2. 🔴 **Révoquez-la après** la configuration
3. 🔴 **Créez une nouvelle clé** si nécessaire

---

## 🚀 Méthode 1 : Script Automatique (Recommandé)

### Installation
```bash
cd C:\Users\mmcsa\Niumba
npm install @supabase/supabase-js
```

### Exécution
```bash
node scripts/configure-supabase.js
```

**Note** : Cette méthode peut avoir des limitations. Si elle ne fonctionne pas, utilisez la Méthode 2.

---

## 🚀 Méthode 2 : SQL Editor (Plus Fiable)

### Étapes

1. **Allez dans Supabase Dashboard**
   - [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Projet : Niumba

2. **Ouvrez SQL Editor**
   - Menu gauche → **SQL Editor**
   - Cliquez sur **New Query**

3. **Exécutez les scripts dans l'ordre** :

   **a) Sécurité Complète**
   - Ouvrez : `supabase/SECURITE_SUPABASE_COMPLETE.sql`
   - Copiez-collez tout le contenu
   - Exécutez (Run ou Ctrl+Enter)

   **b) Index d'Optimisation**
   - Ouvrez : `supabase/INDEX_OPTIMISATION_LUALABA_KATANGA.sql`
   - Copiez-collez tout le contenu
   - Exécutez

4. **Vérifiez**
   - Vous devriez voir des messages de confirmation
   - Si erreurs, notez-les

---

## 🔒 Après Configuration : Révoquer la Clé

### Étapes pour Révoquer

1. **Allez dans Supabase Dashboard**
   - **Settings** → **API**
   - Section **Service Role Key**

2. **Révoquer l'ancienne clé**
   - Cliquez sur **Revoke** ou **Regenerate**
   - Confirmez

3. **Créer une nouvelle clé** (si nécessaire)
   - Cliquez sur **Generate New Key**
   - **Stockez-la de manière sécurisée** (jamais dans le code)

---

## ✅ Vérification

Exécutez ce script dans SQL Editor pour vérifier :

```sql
-- Vérifier RLS
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN '✅' ELSE '❌' END as rls,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = t.tablename) as policies
FROM pg_tables t
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'properties', 'saved_properties', 'inquiries', 'appointments', 'reviews')
ORDER BY tablename;
```

**Résultat attendu** : Toutes les tables doivent avoir `✅` et au moins 2-3 policies.

---

## 📝 Checklist

- [ ] Scripts SQL exécutés dans Supabase
- [ ] RLS activé sur toutes les tables
- [ ] Policies créées
- [ ] Index créés
- [ ] Vérification effectuée
- [ ] Clé service role révoquée (après configuration)

---

## 🆘 En Cas de Problème

Si vous rencontrez des erreurs :
1. Copiez le message d'erreur complet
2. Partagez-le avec moi
3. Je vous aiderai à corriger

---

**Méthode recommandée** : **SQL Editor** (Méthode 2) - Plus fiable et directe


