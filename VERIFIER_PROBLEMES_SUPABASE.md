# 🔍 Vérifier les 43 Problèmes Supabase

## 🎯 Problèmes Probables

Les problèmes dans Supabase Dashboard sont généralement :

1. **RLS non activé** sur certaines tables
2. **Policies manquantes** 
3. **Index manquants**
4. **Foreign keys manquantes**
5. **Extensions non activées**

## ✅ Solution : Script de Vérification

Exécute ce script dans Supabase SQL Editor pour voir les problèmes :

```sql
-- Vérifier les tables sans RLS
SELECT 
  'Tables sans RLS' as probleme,
  tablename,
  CASE WHEN rowsecurity THEN '✅' ELSE '❌' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'properties', 'saved_properties', 'inquiries',
    'appointments', 'reviews', 'conversations', 'messages',
    'notifications', 'search_alerts', 'agents', 'cities',
    'price_history', 'property_views'
  )
ORDER BY rowsecurity, tablename;

-- Vérifier les tables sans policies
SELECT 
  'Tables sans policies' as probleme,
  t.tablename,
  COUNT(p.policyname) as nb_policies
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND p.schemaname = 'public'
WHERE t.schemaname = 'public'
  AND t.tablename IN (
    'profiles', 'properties', 'saved_properties', 'inquiries',
    'appointments', 'reviews', 'conversations', 'messages',
    'notifications', 'search_alerts', 'agents', 'cities',
    'price_history', 'property_views'
  )
GROUP BY t.tablename
HAVING COUNT(p.policyname) = 0
ORDER BY t.tablename;
```

## 🔧 Solution Rapide

Si tu veux corriger tous les problèmes d'un coup, exécute le script `INTEGRATION_COMPLETE.sql` qui :
- ✅ Active RLS sur toutes les tables
- ✅ Crée toutes les policies nécessaires
- ✅ Crée tous les index
- ✅ Configure tout correctement

Mais attention : ce script peut créer des policies qui existent déjà.

## 📋 Alternative : Corriger Seulement ce qui Manque

Je peux créer un script qui vérifie et crée seulement ce qui manque, sans erreur "already exists".


