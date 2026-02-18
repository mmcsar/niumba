# 🧪 Guide : Configuration d'un test dans Google Play Console

## 📋 Étape 1 : Nom du test

### Recommandation pour Niumba

**Nom suggéré :**
```
Test Niumba v1.0.1
```

ou

```
Test initial Niumba
```

**Règles :**
- Maximum 50 caractères
- Nom descriptif et clair
- Peut inclure la version

---

## 🎨 Étape 2 : Type de test

### Option A : Test des éléments graphiques par défaut (Recommandé pour commencer)

**Description :**
- Teste les éléments graphiques dans la langue par défaut
- Plus simple et rapide
- Idéal pour un premier test

**Éléments testés :**
- Icône de l'application
- Captures d'écran
- Image de présentation
- Description courte et complète
- Dans la langue par défaut uniquement

**Quand choisir cette option :**
- ✅ Première publication
- ✅ Application en une seule langue
- ✅ Test rapide des visuels

---

### Option B : Test de localisation (Pour applications multilingues)

**Description :**
- Teste les éléments graphiques ET le texte
- Jusqu'à 5 langues maximum
- Plus complet mais plus long

**Éléments testés :**
- Tous les éléments graphiques
- Descriptions traduites
- Captures d'écran par langue
- Dans plusieurs langues

**Quand choisir cette option :**
- ✅ Application multilingue (FR/EN)
- ✅ Vous avez traduit tous les textes
- ✅ Vous voulez tester plusieurs langues

---

## 🎯 Recommandation pour Niumba

### Si votre application est bilingue (FR/EN) :

**Choisissez : Test de localisation**

**Langues à tester :**
1. Français (par défaut)
2. Anglais

**Avantages :**
- Teste les deux langues
- Vérifie que les traductions sont correctes
- Plus complet

---

### Si vous voulez commencer simple :

**Choisissez : Test des éléments graphiques par défaut**

**Avantages :**
- Plus rapide
- Plus simple
- Vous pourrez tester les autres langues plus tard

---

## ✅ Checklist avant de créer le test

### Éléments requis :

- [ ] **Icône** : 512x512 px (vous avez `./assets/icon.png`)
- [ ] **Image de présentation** : 1024x500 px (à créer)
- [ ] **Captures d'écran** : Minimum 2, recommandé 4-8
- [ ] **Description courte** : 80 caractères max
- [ ] **Description complète** : 4000 caractères max
- [ ] **AAB téléversé** : Version 1.0.1 (versionCode 2)

### Pour Test de localisation :

- [ ] **Traductions** : Tous les textes traduits
- [ ] **Captures d'écran** : Par langue (si différentes)
- [ ] **Descriptions** : Traduites dans chaque langue

---

## 📝 Exemple de configuration

### Configuration recommandée pour Niumba :

**Nom du test :**
```
Test Niumba v1.0.1 - Bilingue
```

**Type de test :**
```
Test de localisation
```

**Langues :**
1. Français (par défaut)
2. Anglais

**Fiche Play Store :**
- Utiliser la fiche par défaut (celle que vous avez configurée)

---

## 🚀 Prochaines étapes après la création du test

1. **Configurer les objectifs du test** (Étape 2)
   - Définir ce que vous voulez tester
   - Exemples : Fonctionnalités principales, Performance, Interface

2. **Configuration des variantes** (Étape 3)
   - Choisir la version à tester
   - Configurer les groupes de testeurs

3. **Lancer le test**
   - Activer le test
   - Inviter les testeurs
   - Collecter les retours

---

## 💡 Conseils

1. **Commencez simple** : Si c'est votre premier test, utilisez "Test des éléments graphiques par défaut"
2. **Testez progressivement** : Vous pouvez créer plusieurs tests pour différentes versions
3. **Collectez les retours** : Demandez aux testeurs de donner leur avis
4. **Corrigez les problèmes** : Utilisez les retours pour améliorer l'application

---

## 📞 Besoin d'aide ?

Si vous avez des questions sur la configuration du test, consultez :
- **Documentation Google** : https://support.google.com/googleplay/android-developer/answer/9845334
- **Centre d'aide** : https://support.google.com/googleplay/android-developer



