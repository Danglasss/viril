# Spécifications du Paywall Science (lp=science) pour Flutter

## 🎨 Palette de couleurs (Theme)
```dart
// Couleurs principales
primary: Color(0xFFFF4D00)        // Orange principal
secondary: Color(0xFFFF7A1A)      // Orange secondaire
background: Color(0xFF0E0E0F)     // Fond noir
text: Color(0xFFF2F2F3)           // Texte blanc cassé
card: Color(0xFF161618)           // Carte gris foncé
optionBg: Color(0xFF17181A)       // Option non sélectionnée
optionSelected: Color(0xFF222326) // Option sélectionnée
success: Color(0xFF00D67A)        // Vert succès
error: Color(0xFFFF6B6B)          // Rouge erreur
warning: Color(0xFFFFB020)        // Jaune warning
```

## 📊 Structure du Paywall (ordre des sections)

### 1. TITRE PRINCIPAL
```
Ton plan sur mesure pour te débarrasser à vie de ton éjaculation trop rapide
```
- **Style**: Font weight 900, taille 22-24px, margin 12px 0 20px

---

### 2. SECTION AVANT/APRÈS (Transformation visuelle)

**Layout**: Grid 2 colonnes

#### Colonne gauche - AVANT (Rouge)
- **Image**: `/triste.png` - homme stressé
- **Couleur de fond**: rgba(255,0,0,0.06)
- **Bordure**: rgba(255,255,255,0.12)
- **Titre**: "Ta frustration actuelle" (rouge #FF6B6B)

**Métriques affichées**:
- Performance: `{beforeMin} min 😔` (orange #FF7A3C)
- Satisfaction partenaire: Barre de progression (4 segments, remplis selon durée)
- Texte: "Elle fait semblant"
- État mental: "Anxieux, honteux" (rouge #FF5F5F)

#### Colonne droite - APRÈS (Vert)
- **Image**: `/confiant.png` - homme confiant
- **Couleur de fond**: rgba(0,255,100,0.06)
- **Titre**: "L'homme que tu vas devenir" (vert #00D67A)

**Métriques affichées**:
- Performance: `{targetMin}+ min 💪` (vert #00D67A)
- Satisfaction partenaire: Barre de progression (4 segments, remplis)
- Texte: "Elle te désire vraiment" (vert #00D67A)
- État mental: "Confiant, viril" (vert #00D67A)

**Calcul de `beforeMin` et `targetMin`**:
```javascript
function mapMinutes(val) {
  if (val === '<1') return 1;
  if (val === '1-2') return 1;
  if (val === '3-5') return 3;
  if (val === '5+' || val === '6-10') return 5;
  if (/^\d+$/.test(val)) return Number(val);
  return 2;
}
beforeMin = mapMinutes(answers['diag_duration']);
targetMin = mapMinutes(answers['proj_target_duration']);
```

---

### 3. RÉSUMÉ PERSONNEL (Style IMC)

**Titre**: "Résumé personnel basé sur tes réponses"

**Contenu**:
- Durée actuelle en gros: `{beforeMin} min` (taille 36px, font weight 900)
- Barre gradient horizontale: `linear-gradient(90deg, #EF4444, #F59E0B, #34D399)`
- Curseur pointant sur la position actuelle (triangle blanc)
- Labels: "Précoce" (gauche) → "Normal" (droite)
- Type de périnée: "Périnné Hypertonique" ou "Périnné Hypotonique" (rouge #FF6B6B)
- Description du profil

**Calcul du profil périnée**:
```javascript
function computeProfile(answers) {
  let hyper = 0, hypo = 0;
  
  if (answers['hx_sport_core'] === 'often') hyper++;
  else if (answers['hx_sport_core'] === 'never') hypo++;
  
  if (answers['hx_ejac_precoce_always'] === 'yes') hyper++;
  
  if (answers['hx_erection_difficulty'] === 'yes' || 
      answers['hx_erection_difficulty'] === 'sometimes') hypo++;
  
  if (answers['hx_urine_leak'] === 'yes') hypo++;
  
  if (answers['hx_post_act_feel'] === 'fatigue') hyper++;
  else if (answers['hx_post_act_feel'] === 'relaxed') hypo++;
  
  if (answers['hx_tension_pattern'] === 'tense') hyper++;
  else if (answers['hx_tension_pattern'] === 'relaxed') hypo++;
  
  if (answers['hx_penetration_sensation'] === 'yes') hypo++;
  
  return hyper >= hypo ? 'Hypertonique' : 'Hypotonique';
}

// Description
profileDesc = profile === 'Hypertonique'
  ? 'Trop de tension au repos — hypersensibilité, réflexe plus rapide.'
  : 'Manque de tonus — contrôle limité, réflexe difficile à freiner.';
```

---

### 4. TON PLAN SUR MESURE

**Titre**: "{firstName}, ton plan sur mesure est prêt !" (ou sans prénom)

**4 Cartes d'information** (Grid layout):

Chaque carte = Icône + Label + Valeur

1. ⏳ "Durée de l'entraînement" → **5 minutes/jour**
2. 💪 "Type de périnné" → **{profile}** (Hypertonique/Hypotonique)
3. 📍 "Endroit pour s'entraîner" → **Partout (discret)**
4. 📅 "Fréquence d'entraînement" → **5 fois par semaine**

**Style des cartes**:
- Grid 2 colonnes: [Icône 44px] [Contenu]
- Background: rgba(255,255,255,0.06)
- Border: 1px solid rgba(255,255,255,0.12)
- Padding: 10px 12px
- Icône: 36x36px, background rgba(255,255,255,0.06)
- Valeur: font weight 900, taille 22px

---

### 5. PROJECTION D'AMÉLIORATION (Graphique)

**Titre centré**: 
```
D'après ton profil, tu atteindras ton objectif de tenir {targetMin} min 🎉 d'ici
```

**Date cible** (ETA):
```javascript
const eta = new Date();
eta.setDate(eta.getDate() + 28);
// Format: "03 nov. 2025"
```
- Style: Souligné avec barre orange épaisse (#FF4D00, 4px)

**Graphique SVG**:
- Dimensions: 360 x 160 (viewBox, s'adapte à 100% width)
- Grille en pointillés: 4 lignes horizontales
- Ligne de progression: Courbe Bézier du point 1 au point 2
  - Couleur: #FF4D00, épaisseur 6px
- Point 1 (gauche): Cercle blanc avec bordure orange
- Point 2 (droite): Cercle orange plein
- Badges flottants:
  - "Aujourd'hui: {beforeMin} min"
  - "{targetMin} min 🎉"

---

### 6. CONTENU DU PROTOCOLE

**Titre**: "🔬 Ce que contient ton protocole de rééducation"

**Liste avec checkmarks verts** (✅):
1. Accès privé à ton espace d'entraînement (mobile & desktop)
2. Vidéos techniques : posture, respiration, contraction/relâchement
3. Programme progressif sur 12 semaines (du niveau débutant à avancé)
4. Suivi automatique de tes performances (tracking des durées)
5. Exercices de désensibilisation et techniques de contrôle mental
6. Protocole validé sur 8500+ utilisateurs

**Encart spécial** (en bas):
- Icône: 💡
- Texte: "Tout est guidé. Tu suis les vidéos, tu progresses automatiquement."
- Background: rgba(255,255,255,0.08)
- Border: 1px solid rgba(255,255,255,0.16)

---

### 7. RÉSULTATS MESURÉS

**Titre**: "📈 Les résultats réels de 8500 hommes comme toi"

**Texte intro**: "Après 12 semaines de protocole :"

**Grid 2x2 de statistiques**:

| +320% | 89% |
| de durée moyenne<br>(2 min → 8,4 min) | des utilisateurs<br>atteignent 10+ min |
| **94%** | **76%** |
| rapportent une amélioration<br>du contrôle volontaire | maintiennent les résultats<br>après 6 mois |

**Style des cartes**:
- Valeur: taille 32px, font weight 900, couleur #00D67A
- Label: taille 14px, opacity 0.85
- Background: rgba(255,255,255,0.06)
- Border: 1px solid rgba(255,255,255,0.12)

---

### 8. BÉNÉFICES CONCRETS

**Titre**: "Ce que ça change dans ta vie :"

**Liste avec checkmarks verts** (✅):
1. Fin des éjaculations involontaires en moins de 2 min
2. Capacité à ralentir ou accélérer à volonté
3. Disparition de l'anxiété pré-rapport
4. Relations sexuelles complètes et satisfaisantes
5. Confiance retrouvée dans ta performance

---

### 9. AVIS CLIENTS (Carousel/Slider)

**Texte d'intro centré**:
```
Nous avons aidé plus de
8500+ personnes
à retrouver une sexualité épanouie
```

**6 avis à faire défiler** (horizontal scroll, snap):

```javascript
const reviews = [
  {
    name: 'Thomas D.',
    text: "Après des années de frustration et de honte, j'ai enfin retrouvé confiance en moi. Ma femme et moi n'avons jamais été aussi heureux. Ce programme a sauvé mon couple.",
    stars: 5,
    verified: true
  },
  {
    name: 'Alexandre M.',
    text: "J'avais perdu espoir... En 3 semaines, je suis passé de 2 à 8 minutes. Je revis enfin et ma partenaire aussi. C'est comme si j'avais retrouvé ma virilité.",
    stars: 5,
    verified: true
  },
  {
    name: 'Sophie L.',
    text: "J'ai convaincu mon mari d'essayer après des mois de tension dans notre couple. Aujourd'hui je le vois épanoui, confiant... Notre intimité est revenue. Merci du fond du cœur.",
    stars: 5,
    verified: true
  },
  {
    name: 'Marc B.',
    text: "J'évitais les relations par peur de décevoir. Maintenant je peux tenir 15 minutes sans problème. Ma vie a changé, je me sens enfin un homme complet.",
    stars: 5,
    verified: true
  },
  {
    name: 'Lucas R.',
    text: "Les exercices sont simples mais efficaces. En 1 mois, mes érections sont plus dures et je contrôle parfaitement. Ma copine n'en revient pas du changement.",
    stars: 5,
    verified: true
  },
  {
    name: 'David P.',
    text: "À 45 ans, je pensais que c'était fini pour moi. Ce programme m'a prouvé le contraire. Je me sens comme à 25 ans, ma femme est aux anges.",
    stars: 5,
    verified: true
  }
];
```

**Design de chaque carte d'avis**:
- Background: rgba(255,255,255,0.06)
- Border: 1px solid rgba(255,255,255,0.16)
- Shadow inset: 0 10px 30px rgba(0,0,0,0.25)
- Header: Avatar circulaire (initiale du nom) + Nom
- Corps: Texte de l'avis (background rgba(255,255,255,0.08))
- Footer: 5 étoiles (#FFB020) + Badge "VÉRIFIÉ" (vert avec checkmark)

**Navigation**:
- Dots en bas (8px, blancs si actif, transparents sinon)
- Cliquables pour navigation directe
- Scroll snap horizontal

---

### 10. URGENCE - POURQUOI AGIR MAINTENANT

**Titre**: "⏰ Pourquoi agir maintenant :"

**2 Cartes d'avertissement avec animation pulse**:

#### Carte 1:
- 📈 **Sans traitement :** le problème s'aggrave dans 73% des cas
- Description: "Plus tu attends, plus les mauvais réflexes s'ancrent profondément"

#### Carte 2:
- ⏳ **Chaque semaine perdue** = réflexes plus ancrés
- Description: "Le cerveau renforce les circuits neurologiques de l'éjaculation rapide"

**Animation**:
- Pulse sur l'icône toutes les 2 secondes (opacity 1 ↔ 0.7)
- Hover: translateY(-2px) + box-shadow orange

**Style**:
- Background: rgba(255,255,255,0.04)
- Border: 1px solid rgba(255,255,255,0.12)
- Border radius: 8px
- Texte highlight en orange #FF4D00

---

### 11. SÉLECTION DE PLAN (Radio buttons)

**Titre**: "Choisit le meilleur plan pour toi"

**3 options de plans**:

#### Plan 1 - Essai
- ID: `trial`
- Titre: "1 semaine d'essai"
- Prix total: **6.99 EUR**
- Prix par jour: **0.99 EUR/jour**

#### Plan 2 - 4 semaines (POPULAIRE)
- ID: `4w`
- Titre: "Plan de 4 semaines"
- Prix total: **15.19 EUR**
- Prix par jour: **0.49 EUR/jour**
- Badge: "LE PLUS POPULAIRE" (fond orange #FF4D00)

#### Plan 3 - 12 semaines
- ID: `12w`
- Titre multi-lignes: "Plan de 12<br>semaines"
- Prix total: **25.99 EUR**
- Prix par jour: **0.29 EUR/jour**

**Style des cartes**:
- Radio button circulaire (20px)
- Si sélectionné: Border 2px solid #FF4D00
- Si non sélectionné: Border 1px solid rgba(255,255,255,0.18)
- Background: rgba(255,255,255,0.03)
- Grid 3 colonnes: [Radio] [Info] [Prix]

**Texte informatif** (en dessous):
- 💪 "Les personnes utilisant le plan pendant 3 mois obtiennent deux fois plus de résultats que pendant 1 mois"
- Note: "*Selon une étude interne réalisée en 2022"

**Bouton CTA**:
- Texte: "Continuer →"
- Style: Orange #FF4D00, font weight 800
- Width: auto, padding 12px 18px
- Border radius: 0
- Position: Aligné à droite


---

### 12. GARANTIE DE REMBOURSEMENT

**Layout**: Grid 2 colonnes [Texte] [Badge]

**Texte**:
- Titre: "Politique de remboursement garanti" (taille 26px, font weight 900)
- Description: "Nous pensons que notre plan peut fonctionner pour vous et que vous obtiendrez des résultats visibles en 4 semaines ! Nous sommes même prêts à vous rembourser intégralement dans les 30 jours suivant l'achat si vous n'obtenez pas de résultats visibles et pouvez démontrer que vous avez suivi notre plan."

**Badge circulaire SVG** (120x120px):
- Cercle extérieur: stroke #FF7A1A, strokeWidth 6
- Cercle intérieur pointillé: stroke #FF7A1A, strokeWidth 2
- Texte "30" centré: taille 42px, font weight 900

**Style container**:
- Background: rgba(255,255,255,0.02)
- Border: 1px solid rgba(255,255,255,0.18)
- Padding: 18px

---

## 🔧 État et logique Flutter

### Variables d'état nécessaires

```dart
// Réponses du quiz (Map)
Map<String, dynamic> answers;

// Prénom de l'utilisateur
String firstName = answers['__email']?['firstName'] ?? '';


// Index du carousel d'avis
int currentReviewIndex = 0;

// Animation pulse
bool pulseState = true; // Toggle toutes les 2 secondes

// Calculs dérivés
int beforeMin;  // Calculé à partir de answers['diag_duration']
int targetMin;  // Calculé à partir de answers['proj_target_duration']
String profile; // 'Hypertonique' ou 'Hypotonique'
String eta;     // Date dans 28 jours
```

### Widgets Flutter principaux à créer

1. **PaywallScreen** (StatefulWidget)
2. **BeforeAfterSection** - Grid 2 colonnes avec images
3. **PersonalSummaryCard** - Résumé style IMC
4. **PersonalizedPlanCards** - 4 cartes info
5. **ProgressionChart** - SVG CustomPaint
6. **ProtocolContentList** - Liste avec checkmarks
7. **StatisticsGrid** - Grid 2x2
8. **BenefitsChecklist** - Liste avec checkmarks
9. **ReviewCarousel** - PageView horizontal
10. **UrgencyCard** - Carte avec animation
11. **PlanSelectorRadio** - Radio button custom
12. **GuaranteeCard** - Garantie avec badge

---

## 📐 Spacing & Typography

### Margins standards
- Section spacing: 40px (top/bottom)
- Border top sections: 1px solid rgba(255,255,255,0.12)
- Card internal padding: 12-18px

### Typography
- Titre principal: Font weight 900, 22-24px, letter-spacing 0.2
- Titre de section: Font weight 900, 22px, letter-spacing 0.2
- Corps de texte: Font weight normal, 16px, opacity 0.9
- Petits textes: 12-14px, opacity 0.7-0.85
- Valeurs importantes: Font weight 900, 32-36px

### Bordures
- Border radius: 0 (design carré) sauf pour éléments spécifiques (8px)
- Border standard: 1px solid rgba(255,255,255,0.12)
- Border actif: 2px solid #FF4D00

---

## 🚀 Points d'attention pour l'implémentation Flutter

1. **Images à fournir**:
   - `/triste.png` (homme stressé)
   - `/confiant.png` (homme confiant)

2. **Animations**:
   - Pulse sur section urgence (2s interval)
   - Smooth scroll sur carousel
   - Hover effects (web/desktop)

3. **Responsive**:
   - Grid 2 colonnes → 1 colonne sur mobile si width < 600px
   - Font sizes adaptatives
   - Spacing réduit sur mobile

5. **Données dynamiques**:
   - Toutes les valeurs {beforeMin}, {targetMin}, {profile} sont calculées depuis `answers`
   - Date ETA calculée dynamiquement
   - Prénom optionnel depuis answers

---

## 💡 Conseils pour l'IA qui implémente

### Prompt suggéré pour votre IA Flutter:

```
Crée un écran Flutter complet de paywall en te basant sur ce document de spécifications.

IMPORTANT:
- Utilise la palette de couleurs exacte fournie
- Respecte l'ordre des sections (1 à 12)
- Implémente tous les calculs de logique métier (mapMinutes, computeProfile, etc.)
- Crée des widgets réutilisables pour chaque section
- Utilise StatefulWidget pour gérer l'état (plan sélectionné, carousel, animations)
- Implémente le carousel avec PageView et indicateurs de points
- Ajoute les animations (pulse sur urgence)
- Rends le design responsive (Grid adaptatif)

Le résultat doit être pixel-perfect par rapport aux spécifications.
Fournis le code complet avec tous les imports nécessaires.
```



Dernière mise à jour: 3 novembre 2025

