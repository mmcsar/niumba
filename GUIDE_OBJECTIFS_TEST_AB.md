# 🎯 Guide : Configuration des objectifs d'un test A/B

## 📊 Paramètres du test A/B

### 1. Métrique cible

Vous avez choisi : **"Personnes fidélisées parmi celles ayant installé l'appli pour la première fois"**

**Explication :**
- Mesure le nombre d'utilisateurs qui installent l'app ET la gardent au moins 1 jour
- C'est une bonne métrique pour mesurer l'engagement initial
- Recommandé pour les nouvelles applications

**Alternative disponible :**
- "Personnes ayant installé l'application pour la première fois" : Plus simple, mesure juste les installations

---

### 2. Audience des tests (50%)

**Ce que cela signifie :**
- 50% des utilisateurs verront la variante de test
- 50% verront la fiche Play Store actuelle (groupe de contrôle)
- C'est un bon équilibre pour avoir des résultats significatifs

**Recommandations :**
- **10-20%** : Pour tester avec un petit groupe
- **50%** : Pour un test équilibré (recommandé)
- **50%** : Maximum autorisé

**Pour Niumba :** 50% est parfait pour un premier test.

---

### 3. Estimation requise

**Problème actuel :**
```
Estimation requise : 53 121 utilisateurs
Nombre de jours estimé : -
```

**Pourquoi ?**
- Google n'a pas de données historiques pour votre application
- Il a besoin d'une estimation du nombre d'installations par jour

---

## ✅ Solution : Fournir une estimation

### Estimation recommandée pour Niumba (nouvelle application)

**Scénario réaliste pour une nouvelle app :**

#### Option A : Estimation conservatrice (recommandée)
```
Personnes fidélisées par jour : 10-50
```
- Pour une nouvelle application
- Croissance progressive
- Test prendra plus de temps mais plus réaliste

#### Option B : Estimation optimiste
```
Personnes fidélisées par jour : 100-500
```
- Si vous avez déjà une base d'utilisateurs
- Si vous faites de la promotion active
- Test sera plus rapide

#### Option C : Estimation très optimiste
```
Personnes fidélisées par jour : 1000+
```
- Si vous avez une grande audience
- Si vous faites un lancement important
- Test sera très rapide

---

## 🎯 Recommandation pour Niumba

### Configuration suggérée :

1. **Métrique cible :**
   ✅ "Personnes fidélisées parmi celles ayant installé l'appli pour la première fois"
   (Déjà sélectionné - parfait !)

2. **Audience des tests :**
   ✅ **50%** (Déjà configuré - parfait !)

3. **Estimation :**
   📝 **Saisissez : 25-50 personnes fidélisées par jour**
   
   **Pourquoi cette estimation :**
   - Nouvelle application = croissance progressive
   - Commencez avec une estimation réaliste
   - Vous pouvez ajuster plus tard si nécessaire

---

## 📝 Comment remplir l'estimation

1. **Cliquez sur le champ d'estimation**
2. **Saisissez un nombre réaliste** : `25` ou `50` (personnes fidélisées par jour)
3. **Google calculera automatiquement** la durée estimée du test

**Exemple :**
- Si vous estimez **25 personnes/jour**
- Avec 50% d'audience = ~12-13 personnes/jour dans le test
- Pour atteindre 53 121 personnes = ~4 000 jours (environ 11 ans) 😅

**C'est normal !** Google ajustera automatiquement les objectifs en fonction de vos données réelles.

---

## 💡 Conseils

### 1. Commencez avec une estimation réaliste
- Mieux vaut sous-estimer que surestimer
- Vous pouvez ajuster plus tard

### 2. Le test s'ajustera automatiquement
- Google utilisera vos données réelles
- La durée sera recalculée automatiquement

### 3. Vous pouvez arrêter le test à tout moment
- Pas besoin d'attendre la fin
- Vous pouvez analyser les résultats partiels

### 4. Pour accélérer le test
- Augmentez l'audience (jusqu'à 50%)
- Faites de la promotion pour plus d'installations
- Réduisez l'effet minimal détectable (si possible)

---

## 🔧 Paramètres avancés (optionnels)

### Effet minimal détectable : 2,5%
- C'est la différence minimale que le test peut détecter
- 2,5% est un bon équilibre
- Vous pouvez le réduire pour détecter de plus petites différences

### Niveau de confiance : 90%
- 90% de confiance = 1 test sur 10 peut être un faux positif
- C'est un bon niveau pour la plupart des tests
- Vous pouvez l'augmenter à 95% pour plus de précision

---

## ✅ Action immédiate

**Remplissez l'estimation :**

1. Cliquez sur le champ "Personnes fidélisées par jour"
2. Saisissez : **`25`** ou **`50`** (selon vos attentes)
3. Cliquez sur "Suivant" ou "Enregistrer"

**Note :** Cette estimation est juste indicative. Google utilisera vos données réelles pour calculer la durée réelle du test.

---

## 🚀 Prochaine étape

Une fois l'estimation remplie, vous passerez à l'**Étape 3 : Configuration des variantes** où vous pourrez :
- Choisir la version à tester
- Configurer les groupes de testeurs
- Lancer le test



