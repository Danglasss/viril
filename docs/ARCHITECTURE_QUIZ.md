# Quiz Architecture - Guide de Modularité

## 🚨 Problèmes Actuels

### 1. Valeurs Hardcodées dans les Composants

| Fichier | Problème |
|---------|----------|
| `ResultsSale.js` | 35+ `borderRadius` en dur, couleurs, textes |
| `ResultsSale_violent.js` | ~40 `borderRadius` en dur |
| `ResultsSale_45-55.js` | ~50 `borderRadius` en dur |
| `Email.js` | Radius, couleurs hardcodées |
| `EightOfTen.js` | Idem |
| `PerineeDiag.js` | Logique + styles hardcodés |

### 2. Ce qui EST configurable via `theme.json`

```json
{
  "colors": { "primary", "secondary", "background", "text", ... },
  "radius": 12,       // ⚠️ Non utilisé par les composants!
  "border": 0,
  "logoUrl": "/viril-logo.svg"
}
```

**Note:** `radius` et `border` sont injectés en CSS mais les composants n'utilisent pas `var(--radius)`.

---

## 📁 Fichiers à Modifier pour Modularité Complète

### Niveau 1 : Configuration (JSON)

| Fichier | Ce qu'il contrôle |
|---------|-------------------|
| `/public/data/quizzes/v1.json` | Questions, options, flow |
| `/public/data/theme.json` | Couleurs, radius, logo |
| `/public/data/lang.json` | Traductions globales |

### Niveau 2 : Composants à Refactorer

| Composant | À faire |
|-----------|---------|
| `ResultsSale*.js` | Remplacer `borderRadius: X` par `var(--radius)` |
| `Email.js` | Idem |
| `EightOfTen.js` | Idem |
| `InfoSlide.js` | Idem |
| `Benefits.js` | Idem |
| `PerineeDiag.js` | Rendre configurable via JSON |

### Niveau 3 : Core

| Fichier | Ce qu'il contrôle |
|---------|-------------------|
| `/public/app.js` | Flow du quiz, injection thème |
| `/pages/test.tsx` | SSR, version loading |

---

## 🎯 Pour Créer une Version 100% Différente

Tu dois modifier/créer :

```
1. /public/data/quizzes/v_coach.json     ← Questions
2. /public/data/themes/v_coach.json      ← Couleurs/radius (À CRÉER)
3. /public/data/lang_coach.json          ← Traductions (optionnel)
4. /public/components/ResultsSale_coach.js  ← Page vente custom
```

Et modifier `app.js` pour charger le thème selon `?version=`.

---

## ✅ Quick Fixes Recommandés

### 1. Utiliser les CSS vars partout

Dans chaque composant, remplacer :
```js
// ❌ Avant
borderRadius: 12

// ✅ Après  
borderRadius: 'var(--radius)'
```

### 2. Créer un dossier themes/

```
/public/data/
├── themes/
│   ├── default.json
│   ├── v_coach.json
│   └── v_dr_kegel.json
├── quizzes/
│   ├── v1.json
│   ├── v_coach.json
│   └── v_dr_kegel.json
```

### 3. Modifier app.js pour charger thème dynamique

```js
const version = getParam('version', 'v1');
const themePath = version === 'v1' ? '/data/theme.json' : `/data/themes/${version}.json`;
const { data: theme } = useFetch(themePath);
```
