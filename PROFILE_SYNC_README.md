# 🔄 Profile Auto-Sync - Documentation

## Vue d'ensemble

Le système de synchronisation automatique du profil met à jour en temps réel la table `profiles` de Supabase à partir des réponses du quiz, **sans jamais bloquer l'interface utilisateur**.

---

## 🎯 Objectif

Synchroniser automatiquement ces champs du profil pendant que l'utilisateur répond au quiz :

| Champ | Source (quiz answer) | Type | Description |
|-------|---------------------|------|-------------|
| `age_range` | `demo_age` / `age` | string | Tranche d'âge |
| `relationship_status` | `demo_relationship` | string | Statut relationnel |
| `baseline_minutes` | `diag_duration` | int | Durée actuelle (calculée) |
| `target_minutes` | `proj_target_duration` | int | Objectif de durée (calculée) |
| `goal` | `proj_goal` | string | Objectif principal |
| `locale` | `lang` | string | Langue (fr/en) |
| `first_name` | `__email.firstName` | string | Prénom (si disponible) |
| `email` | `__email.email` | string | Email (si disponible) |

---

## 🏗️ Architecture

### Fichiers créés/modifiés

```
/public/
  profileSync.js          ← Service de synchronisation (NOUVEAU)
  app.js                  ← Intégration auto-sync (MODIFIÉ)
  components/
    ResultsSale.js        ← Sync forcée au paywall (MODIFIÉ)

/pages/
  test.tsx                ← Chargement du script (MODIFIÉ)
```

---

## ⚡ Comment ça marche

### 1. **Synchronisation automatique (Fire-and-forget)**

À chaque fois que l'utilisateur répond à une question :

```javascript
// Dans app.js (ligne ~106)
React.useEffect(() => {
  if (window.profileSync && Object.keys(answers).length > 0) {
    window.profileSync.syncAnswers(answers); // ← Ne bloque JAMAIS l'UI
  }
}, [answers]);
```

**Flux :**
1. L'utilisateur clique sur une réponse → `answers` change
2. Le hook `useEffect` détecte le changement
3. `profileSync.syncAnswers()` est appelé (fire-and-forget)
4. La fonction retourne immédiatement
5. En arrière-plan :
   - **Debounce de 500ms** (si l'utilisateur clique vite, on attend)
   - **Queue intelligente** (on ne garde que la dernière version)
   - **Détection de doublons** (pas de requête si identique)
   - **Timeout de 5s** (protection contre les lags réseau)

### 2. **Synchronisation forcée (Bloquante)**

Au chargement du paywall, on force une sync finale pour garantir que tout est à jour :

```javascript
// Dans ResultsSale.js (ligne ~7)
React.useEffect(() => {
  if (window.profileSync && Object.keys(answers).length > 0) {
    window.profileSync.syncNow(answers); // ← Bloquant (avec timeout 10s)
  }
}, []);
```

---

## 📊 Logique de mapping des données

### Calcul des minutes

```javascript
function mapMinutes(val) {
  if (val === '<1') return 1;
  if (val === '1-2') return 1;
  if (val === '3-5') return 3;
  if (val === '5+' || val === '6-10') return 5;
  if (/^\d+$/.test(val)) return Number(val);
  return 2; // défaut
}
```

**Exemples :**
- `answers['diag_duration'] = '3-5'` → `baseline_minutes = 3`
- `answers['proj_target_duration'] = '5+'` → `target_minutes = 5`

### Extraction des données

```javascript
// Age
age_range = answers['demo_age'] || answers['age']

// Relationship
relationship_status = answers['demo_relationship']

// Goal
goal = answers['proj_goal'] || answers['goal']

// Locale
locale = answers['lang']

// Email data
first_name = answers['__email'].firstName
email = answers['__email'].email
```

---

## 🔍 Exemples de logs

### Console normale (tout va bien)

```
[profileSync] loading
[profileSync] loaded
[app] saveProgress call { step: 1 }
✅ [profileSync] Success (3 fields)
[app] saveProgress call { step: 2 }
✅ [profileSync] Success (4 fields)
✅ [profileSync] Force sync success
```

### Console en cas d'erreur (non bloquant)

```
[profileSync] loading
⚠️ [profileSync] Supabase client not ready
[app] saveProgress call { step: 1 }
❌ [profileSync] Error: timeout
```

---

## 🎮 API publique

Le service expose `window.profileSync` avec ces méthodes :

### `syncAnswers(answers)`

Synchronise en arrière-plan (fire-and-forget).

```javascript
// Exemple
window.profileSync.syncAnswers({
  demo_age: '25-34',
  diag_duration: '1-2',
  proj_target_duration: '5+',
  lang: 'fr'
});
```

**Caractéristiques :**
- ✅ Ne bloque jamais l'UI
- ✅ Debounce de 500ms
- ✅ Détection de doublons
- ✅ Queue intelligente (garde la dernière version)

### `syncNow(answers)`

Synchronise immédiatement (bloquant avec timeout).

```javascript
// Exemple
const success = await window.profileSync.syncNow(answers);
if (success) {
  console.log('Profile synced!');
}
```

**Caractéristiques :**
- ⏱️ Bloquant (retourne une Promise)
- ⏰ Timeout de 10 secondes
- ✅ Retourne true/false
- 🎯 Utiliser avant des actions critiques (paywall, checkout)

### `mapQuizAnswersToProfile(answers)`

Utilitaire pour voir la transformation des données.

```javascript
// Exemple
const profileData = window.profileSync.mapQuizAnswersToProfile(answers);
console.log(profileData);
// {
//   age_range: '25-34',
//   baseline_minutes: 1,
//   target_minutes: 5,
//   locale: 'fr',
//   updated_at: '2025-11-03T...'
// }
```

---

## 🧪 Tests

### Test manuel 1 : Vérifier la sync automatique

1. Ouvre la console (`F12`)
2. Va sur `/test`
3. Réponds à quelques questions
4. Vérifie les logs : `✅ [profileSync] Success`
5. Va dans Supabase → table `profiles` → vérifie que les champs sont mis à jour

### Test manuel 2 : Vérifier le debounce

1. Réponds très vite à 5 questions (1 par seconde)
2. Observe les logs : Tu devrais voir moins de 5 syncs (car debounce)
3. Le dernier sync devrait contenir toutes les données

### Test manuel 3 : Vérifier le paywall

1. Complète le quiz jusqu'au paywall
2. Vérifie le log : `✅ [profileSync] Force sync success`
3. Vérifie dans Supabase que toutes les données sont présentes

---

## 🚀 Performance

### Optimisations implémentées

1. **Debounce de 500ms**
   - Si l'utilisateur clique vite, on attend qu'il ralentisse
   - Évite 10 requêtes quand 1 suffit

2. **Queue intelligente**
   - On ne garde que la dernière version des données
   - Pas de backlog inutile

3. **Détection de doublons**
   - Compare les données avant d'envoyer
   - Évite les requêtes inutiles si rien n'a changé

4. **Timeout de 5s**
   - Protection contre les lags réseau
   - L'app continue même si la sync échoue

5. **Fire-and-forget**
   - Aucun `await` dans le flux principal
   - L'UI reste 100% réactive

---

## 🛠️ Dépannage

### Problème : Les données ne se synchronisent pas

**Solutions :**
1. Vérifie que `/profileSync.js` est bien chargé :
   ```javascript
   console.log(window.profileSync); // Ne doit pas être undefined
   ```

2. Vérifie que Supabase est connecté :
   ```javascript
   console.log(window._sb); // Ne doit pas être undefined
   ```

3. Vérifie les logs de la console (recherche "profileSync")

4. Vérifie que l'utilisateur est bien connecté :
   ```javascript
   const { data } = await window._sb.auth.getUser();
   console.log(data?.user?.id);
   ```

### Problème : Erreur "Supabase client not ready"

**Cause :** Le script `profileSync.js` se charge avant que Supabase soit initialisé.

**Solution :** C'est normal et non bloquant. La sync se fera au prochain changement de réponse.

### Problème : Erreur "timeout"

**Cause :** Réseau lent ou Supabase inaccessible.

**Solution :** C'est non bloquant. L'utilisateur peut continuer le quiz. La sync sera retentée au prochain changement.

---

## 📈 Améliorations futures possibles

1. **Retry automatique** en cas d'erreur réseau
2. **Cache local** avec IndexedDB pour offline-first
3. **Batch updates** toutes les 5 questions au lieu d'une par une
4. **WebSocket** pour sync temps réel bidirectionnelle
5. **Compression** des données avant envoi

---

## 📝 Notes importantes

### ⚠️ Ordre de chargement des scripts

**IMPORTANT :** L'ordre dans `test.tsx` est critique :

```tsx
<Script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2" strategy="beforeInteractive" />
<Script src="/supabaseClient.js" strategy="beforeInteractive" />
<Script src="/profileSync.js" strategy="beforeInteractive" />  ← Après supabaseClient
<Script src="/app.js" strategy="afterInteractive" />           ← Après profileSync
```

### ⚠️ Dépendances

- React (déjà présent via UMD)
- Supabase JS v2
- `window.__getAnswers()` (défini dans app.js)

### ⚠️ Compatibilité navigateur

- ✅ Chrome/Edge (100%)
- ✅ Firefox (100%)
- ✅ Safari (100%)
- ✅ Mobile (iOS/Android)
- ⚠️ IE11 (non supporté, mais l'app ne crash pas)

---

## 🔐 Sécurité

### Protection des données

1. **Pas de données sensibles en clair**
   - Tout passe par Supabase RLS (Row Level Security)
   - L'utilisateur ne peut modifier que son propre profil

2. **Validation côté serveur**
   - Les types sont vérifiés par Supabase
   - Les contraintes de table sont respectées

3. **Rate limiting**
   - Le debounce limite naturellement les requêtes
   - Supabase a son propre rate limiting

---

## 📞 Support

En cas de problème, vérifier dans l'ordre :

1. ✅ Console browser (logs profileSync)
2. ✅ Network tab (requêtes Supabase)
3. ✅ Supabase dashboard (table profiles)
4. ✅ Supabase logs (erreurs serveur)

---

**Dernière mise à jour :** 3 novembre 2025  
**Version :** 1.0.0  
**Auteur :** Dan @ Viril

