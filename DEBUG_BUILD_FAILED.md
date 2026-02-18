# 🔍 Debug Build Failed - Niumba

## ❌ Erreur

```
Build failed
🤖 Android build failed:
Unknown error. See logs of the Prebuild build phase for more information.
```

**Build ID** : `76a2e48f-8112-4872-9e67-996df3650b04`
**Lien logs** : https://expo.dev/accounts/mmcsal/projects/niumba/builds/76a2e48f-8112-4872-9e67-996df3650b04

## 🔍 Causes Possibles

### 1. Assets Manquants
- Les fichiers référencés dans `app.json` n'existent pas
- Vérifier : `icon.png`, `splash-icon.png`, `adaptive-icon.png`, `notification-icon.png`

### 2. Configuration app.json
- Erreur de syntaxe dans `app.json`
- Champ manquant ou invalide

### 3. Dépendances
- Version incompatible
- Package manquant

### 4. Fichiers de Configuration
- `eas.json` mal formé
- Autres fichiers de config manquants

## 🔧 Actions de Diagnostic

### 1. Vérifier les Logs Détaillés

```powershell
eas build:view 76a2e48f-8112-4872-9e67-996df3650b04
```

Ou aller directement sur :
https://expo.dev/accounts/mmcsal/projects/niumba/builds/76a2e48f-8112-4872-9e67-996df3650b04

### 2. Vérifier les Assets

```powershell
Test-Path "assets\icon.png"
Test-Path "assets\splash-icon.png"
Test-Path "assets\adaptive-icon.png"
Test-Path "assets\notification-icon.png"
```

### 3. Vérifier app.json

```powershell
# Vérifier la syntaxe JSON
Get-Content app.json | ConvertFrom-Json
```

### 4. Vérifier les Dépendances

```powershell
npm install
```

## 🎯 Solutions Communes

### Solution 1 : Assets Manquants

Si `notification-icon.png` manque :
- Créer une icône 96x96 px
- Ou retirer la référence dans `app.json` (ligne 50)

### Solution 2 : Erreur de Configuration

Vérifier que `app.json` est valide :
- Pas d'erreur de syntaxe JSON
- Tous les champs requis présents

### Solution 3 : Rebuild

Parfois un simple rebuild résout le problème :
```powershell
eas build --platform android --profile production --clear-cache
```

## 📋 Checklist de Vérification

- [ ] Vérifier les logs détaillés sur expo.dev
- [ ] Vérifier que tous les assets existent
- [ ] Vérifier la syntaxe de app.json
- [ ] Vérifier que les dépendances sont installées
- [ ] Essayer un rebuild avec --clear-cache

---

**🔍 Commençons par vérifier les logs détaillés pour identifier la cause exacte.**

