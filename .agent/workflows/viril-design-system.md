---
description: Design System et Style Guide pour Viril - Quiz et composants
---

# 🎨 Viril Design System

Ce document définit le style visuel de Viril. À utiliser comme référence pour tous les développements sur le quiz et les composants.

---

## 📐 Principes Fondamentaux

- **Sharp & Bold** : Design épuré, angles droits (pas de border-radius sauf exception)
- **Dark Mode** : Fond noir, texte blanc
- **Accent Orange/Jaune** : Couleur primaire pour les CTAs et éléments interactifs
- **Typographie forte** : Police Inter en gras (800) pour un look punchy

---

## 🎨 Couleurs

| Token | Valeur | Usage |
|-------|--------|-------|
| `--color-primary` | `#FDB913` | Boutons, accents, checkmarks |
| `--color-bg` | `#000000` | Fond principal |
| `--color-bg-card` | `#111111` | Cartes, options |
| `--color-text` | `#FFFFFF` | Texte principal |
| `--color-text-dim` | `#9CA3AF` | Texte secondaire |
| `--border-subtle` | `rgba(255, 255, 255, 0.1)` | Bordures légères |

---

## 🔤 Typographie

### Police
- **Font Family** : `Inter`, Arial, Helvetica, sans-serif
- **Poids disponibles** : 400, 500, 600, 700, 800

### Hiérarchie

| Élément | Taille | Poids | Notes |
|---------|--------|-------|-------|
| **H1 (Question)** | 24px → 30px (responsive) | 800 | ExtraBold |
| **H2 (Sous-titre)** | 20px → 24px | 700 | Bold |
| **Options/Labels** | 16px | 800 | ExtraBold |
| **Bouton CTA** | 18px | 700 | Bold, UPPERCASE |
| **Compteur (6/17)** | 14px | 700 | Bold, couleur blanche |
| **Texte body** | 16px | 400 | Regular |

---

## 📦 Composants

### Options de réponse (`.option`)
```css
background: #111111;
padding: 16px;
padding-right: 48px; /* Espace pour checkmark */
border: 2px solid rgba(255, 255, 255, 0.1);
border-radius: 0;
font-weight: 800;
font-size: 16px;
```

**État sélectionné** :
- Border : `2px solid #FDB913`
- Background : `rgba(253, 185, 19, 0.1)`
- Checkmark jaune (20x20px) en position absolue à droite

### Back Button (`.back-btn`)
```css
width: 28px;
height: 28px;
background: rgba(255, 255, 255, 0.05);
border: 1px solid rgba(255, 255, 255, 0.3);
border-radius: 0;
color: #FFFFFF;
font-size: 18px;
```
- Icône : `‹` (chevron)

### Bouton CTA (`.btn`)
```css
padding: 16px;
font-size: 18px;
font-weight: 700;
text-transform: uppercase;
letter-spacing: 0.02em;
background: #FDB913;
color: #000000;
border-radius: 0;
```
- Avec chevron : `CONTINUER ›`

### Sticky Footer (`.sticky-footer`)
- Position fixed en bas de l'écran
- Padding : 16px
- Background : `#000000`
- Contient le bouton CTA pleine largeur

### Cards (`.card`)
```css
background: #111111;
padding: 24px;
border-radius: 0;
```

### Progress Bar
- Height : 6px
- Track : `rgba(255, 255, 255, 0.1)`
- Fill : `#FDB913`
- Compteur : `font-weight: 700`, couleur blanche

---

## 📱 Responsive

| Breakpoint | Taille H1 |
|------------|-----------|
| Mobile (< 640px) | 24px |
| Desktop (≥ 640px) | 30px |

---

## 🚫 À éviter

- ❌ Border-radius (garder à 0, sauf cas exceptionnels)
- ❌ Gradients (design flat/solide)
- ❌ Ombres portées (shadows)
- ❌ Police Manrope (utiliser Inter)
- ❌ Font-weight léger (< 600) pour les éléments interactifs

---

## ✅ Checklist Design

Avant de livrer un composant, vérifier :

- [ ] Police Inter chargée et appliquée
- [ ] Font-weight 800 pour titres et options
- [ ] Border-radius à 0
- [ ] Couleur primaire #FDB913
- [ ] Boutons avec chevron `›`
- [ ] Sticky footer pour les écrans avec CTA
- [ ] Checkmark 20x20px, ne déborde pas sur le texte

---

## 📁 Fichiers clés

| Fichier | Description |
|---------|-------------|
| `/styles/globals.css` | Styles globaux et design system |
| `/pages/_document.tsx` | Chargement des fonts (Inter) |
| `/public/app.js` | Logique du quiz |
| `/public/components/StickyFooterButton.js` | Composant bouton sticky centralisé |
| `/public/data/theme.json` | Variables de thème |
