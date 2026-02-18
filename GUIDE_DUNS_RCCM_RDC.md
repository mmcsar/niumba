# 📋 Guide DUNS / RCCM pour Google Play Developer - RDC

## ❓ Qu'est-ce que le DUNS ?

Le **DUNS** (Data Universal Numbering System) est un numéro d'identification d'entreprise utilisé principalement aux **États-Unis et dans certains pays occidentaux**.

## 🇨🇩 En RDC (République Démocratique du Congo)

### Le DUNS n'est PAS obligatoire en RDC

Google Play Console demande le DUNS uniquement pour certains pays. **La RDC n'en fait généralement pas partie**.

## ✅ Ce que vous devez utiliser à la place

### Option 1 : RCCM (Recommandé)

**RCCM** = Registre du Commerce et du Crédit Mobilier

- C'est l'équivalent du numéro d'entreprise en RDC
- Format : Généralement un numéro alphanumérique
- Où le trouver : Sur vos documents d'enregistrement d'entreprise

**Exemple de format RCCM** :
- `CD/LUB/RCCM/XX-XXXXX-A-XXXXX-K`
- Ou simplement le numéro d'enregistrement

### Option 2 : Numéro d'Identification Fiscale

Si vous avez un **numéro d'identification fiscale** (NIF), vous pouvez l'utiliser.

### Option 3 : Laisser vide (si pas d'entreprise enregistrée)

Si vous publiez en tant que **développeur individuel** (pas d'entreprise), vous pouvez :
- Sélectionner "Compte individuel" au lieu de "Organisation"
- Ne pas fournir de numéro DUNS/RCCM

## 📝 Comment remplir le formulaire Google Play

### Si vous avez un RCCM :

1. **Type de compte** : Sélectionner "Organisation"
2. **Nom légal** : MMC SARL
3. **Numéro d'identification** :
   - Si le champ demande "DUNS" : Entrer votre **RCCM**
   - Si le champ demande "Numéro d'entreprise" : Entrer votre **RCCM**
   - Si le champ demande "Tax ID" : Entrer votre **RCCM** ou numéro fiscal

### Si vous n'avez pas de RCCM :

1. **Type de compte** : Sélectionner "Compte individuel"
2. **Nom** : Votre nom personnel
3. **Numéro d'identification** : Laisser vide ou utiliser votre numéro d'identification personnelle

## 🔍 Où trouver votre RCCM ?

### Documents où il apparaît :
- ✅ Certificat d'enregistrement d'entreprise
- ✅ Statuts de la société
- ✅ Documents fiscaux
- ✅ Factures officielles

### Format typique en RDC :
```
RCCM: CD/LUB/RCCM/XX-XXXXX-A-XXXXX-K
```
Où :
- `CD` = Code pays (Congo Démocratique)
- `LUB` = Code ville (Lubumbashi)
- `RCCM` = Registre du Commerce
- Suivi du numéro d'enregistrement

## ⚠️ Important

### Si Google demande spécifiquement un DUNS :

1. **Vérifier le pays** : Assurez-vous que "République Démocratique du Congo" est sélectionné
2. **Contacter le support** : Si le formulaire force le DUNS, contactez le support Google Play
3. **Alternative** : Utiliser un compte individuel si l'organisation pose problème

### Si vous n'avez pas de RCCM :

Vous pouvez toujours publier avec un **compte individuel** :
- Pas besoin de numéro d'entreprise
- Utiliser votre nom personnel
- Plus simple pour commencer
- Vous pourrez changer en organisation plus tard si nécessaire

## 📋 Checklist

- [ ] Vérifier si vous avez un RCCM
- [ ] Si oui : Utiliser le compte "Organisation" avec RCCM
- [ ] Si non : Utiliser le compte "Individuel"
- [ ] S'assurer que "RDC" est sélectionné comme pays
- [ ] Si problème : Contacter le support Google Play

## 💡 Recommandation

### Pour MMC SARL :

1. **Si vous avez le RCCM** :
   - Utiliser "Organisation"
   - Entrer le RCCM dans le champ d'identification
   - Plus professionnel et crédible

2. **Si vous n'avez pas le RCCM** :
   - Utiliser "Compte individuel" pour commencer
   - Vous pourrez migrer vers organisation plus tard
   - Plus rapide pour publier

## 🔗 Support Google Play

Si vous avez des problèmes :
- **Support Google Play Console** : https://support.google.com/googleplay/android-developer
- **Forum communautaire** : https://support.google.com/googleplay/android-developer/community

---

**✅ En résumé** : En RDC, utilisez votre **RCCM** au lieu du DUNS, ou choisissez un **compte individuel** si vous n'avez pas de numéro d'entreprise.

