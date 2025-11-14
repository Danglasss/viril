// Profile Auto-Sync Service
// Synchronise automatiquement les réponses du quiz vers la table profiles
// STRATÉGIE : Fire-and-forget avec debounce pour ne JAMAIS bloquer l'UI
(function(){
  console.info('[profileSync] loading');

  // Queue de synchronisation
  let syncQueue = [];
  let isSyncing = false;
  let lastSyncedData = null;
  let debounceTimer = null;

  // ========================================
  // MAPPING QUIZ → PROFILE
  // ========================================

  function mapMinutes(val) {
    if (!val) return null;
    const v = String(val).toLowerCase().trim();
    if (v === '<1') return 1;
    if (v === '1-2') return 1;
    if (v === '3-5') return 3;
    if (v === '5+' || v === '6-10') return 5;
    const parsed = parseInt(v, 10);
    if (!isNaN(parsed)) return parsed;
    return 2; // default
  }

  function mapQuizAnswersToProfile(answers) {
    const profile = {
      updated_at: new Date().toISOString()
    };

    // Resolve language for label mappings
    const resolveLang = (function(){
      try {
        return (answers && (answers.lang || answers.locale)) || (typeof window !== 'undefined' && window.__LANG_CODE) || 'fr';
      } catch(_) { return 'fr'; }
    })();
    const lang = (resolveLang === 'fr' || resolveLang === 'en') ? resolveLang : 'fr';

    function mapReasonToGoalString(val){
      if (!val) return null;
      const v = String(val);
      try {
        if (typeof window !== 'undefined' && window.__QUIZ_OPTIONS && window.__QUIZ_OPTIONS['proj_main_reason']) {
          const opts = window.__QUIZ_OPTIONS['proj_main_reason'] || [];
          const found = opts.find(function(o){ return o && o.value === v; });
          if (found && found.label) {
            const lbl = found.label[lang] || found.label.en || null;
            if (lbl) return lbl;
          }
        }
      } catch(_) {}
      // Fallback map aligned with test.json
      const fallback = {
        'partner_pleasure': { fr: 'Pour donner plus de plaisir à ma partenaire', en: 'Give more pleasure to my partner' },
        'confidence': { fr: 'Pour me sentir plus confiant et puissant', en: 'Feel more confident and powerful' },
        'avoid_frustration': { fr: 'Pour éviter la frustration', en: 'Avoid frustration' },
        'enjoy_more': { fr: 'Pour profiter pleinement de mes rapports', en: 'Enjoy my sex life more' },
        'other': { fr: 'Autre', en: 'Other' }
      };
      const f = fallback[v];
      return f ? (f[lang] || f.en) : v;
    }

    // Age range
    const ageRange = answers['demo_age'] || answers['age'] || answers['age_range'];
    if (ageRange) profile.age_range = ageRange;

    // Relationship status
    const relationshipStatus = answers['demo_status'] || answers['demo_relationship'] || answers['relationship_status'] || answers['couple_status'];
    if (relationshipStatus) profile.relationship_status = relationshipStatus;

    // Baseline minutes (durée actuelle)
    const diagDuration = answers['diag_duration'];
    const baselineMinutes = mapMinutes(diagDuration);
    if (baselineMinutes !== null) profile.baseline_minutes = baselineMinutes;

    // Target minutes (objectif)
    const targetDuration = answers['proj_target_duration'] || answers['target_duration'];
    const targetMinutes = mapMinutes(targetDuration);
    if (targetMinutes !== null) profile.target_minutes = targetMinutes;

    // Goal (localized human-readable label from proj_main_reason)
    const rawReason = answers['proj_main_reason'] || answers['proj_goal'] || answers['goal'] || answers['main_goal'];
    const goal = mapReasonToGoalString(rawReason);
    if (goal) profile.goal = goal;

    // Locale
    const locale = answers['lang'] || answers['locale'];
    if (locale) profile.locale = locale;

    // First name (si disponible depuis __email)
    const emailData = answers['__email'];
    if (emailData && typeof emailData === 'object') {
      if (emailData.firstName) profile.first_name = emailData.firstName;
      if (emailData.email) profile.email = emailData.email;
    }

    // Quiz version (si disponible via sbApi)
    try {
      if (window.sbApi && typeof window.sbApi.getQuizVersion === 'function') {
        profile.quiz_version = window.sbApi.getQuizVersion();
      }
    } catch(_) {}

    return profile;
  }

  // ========================================
  // SYNC LOGIC (Fire-and-forget)
  // ========================================

  function areEqual(a, b) {
    if (!a || !b) return false;
    const keysA = Object.keys(a).filter(k => k !== 'updated_at');
    const keysB = Object.keys(b).filter(k => k !== 'updated_at');
    if (keysA.length !== keysB.length) return false;
    for (let key of keysA) {
      if (a[key] !== b[key]) return false;
    }
    return true;
  }

  async function processQueue() {
    if (isSyncing || syncQueue.length === 0) return;
    
    isSyncing = true;

    try {
      // Prendre le dernier élément (le plus récent)
      const data = syncQueue[syncQueue.length - 1];
      syncQueue = []; // Vider la queue

      // S'assurer que la session est prête (tentative anonyme si besoin)
      try { if (window.sbApi && typeof window.sbApi.ensureSession === 'function') { await window.sbApi.ensureSession(); } } catch(e) { console.warn('[profileSync] ensureSession failed', e); }
      // Vérifier qu'on a un client Supabase
      if (!window._sb) {
        console.warn('[profileSync] Supabase client not ready, retrying soon');
        // re-queue and retry later
        syncQueue.push(data);
        setTimeout(processQueue, 500);
        return;
      }

      const { data: user } = await window._sb.auth.getUser();
      if (!user || !user.user || !user.user.id) {
        console.warn('[profileSync] No user logged in (session not ready yet) — retrying soon');
        // re-queue and retry later
        syncQueue.push(data);
        setTimeout(processQueue, 500);
        return;
      }

      const userId = user.user.id;

      // Écrire le profil (upsert pour créer si la ligne n'existe pas encore)
      const payload = Object.assign({ id: userId }, data);
      const { error } = await Promise.race([
        window._sb.from('profiles').upsert(payload, { onConflict: 'id' }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
      ]);

      if (error) {
        console.error('[profileSync] Error:', error);
      } else {
        lastSyncedData = data;
        const fieldsCount = Object.keys(data).length - 1; // -1 pour updated_at
        console.info(`✅ [profileSync] Success (${fieldsCount} fields)`);
      }

    } catch (e) {
      console.error('[profileSync] Exception:', e);
    } finally {
      isSyncing = false;

      // Si d'autres éléments ont été ajoutés, continuer
      if (syncQueue.length > 0) {
        setTimeout(processQueue, 300);
      }
    }
  }

  function queueSync(answers) {
    const profileData = mapQuizAnswersToProfile(answers);

    // Ne pas ajouter si identique au dernier sync
    if (lastSyncedData && areEqual(profileData, lastSyncedData)) {
      return;
    }

    // Ajouter à la queue
    syncQueue.push(profileData);

    // Annuler le debounce précédent
    if (debounceTimer) clearTimeout(debounceTimer);

    // Débuter le traitement après 500ms
    // Si l'utilisateur clique vite, on attend qu'il ralentisse
    debounceTimer = setTimeout(() => {
      if (!isSyncing) {
        processQueue();
      }
    }, 500);
  }

  // ========================================
  // API PUBLIQUE
  // ========================================

  // Synchronisation instantanée (fire-and-forget)
  function syncAnswers(answers) {
    if (!answers || typeof answers !== 'object') return;
    queueSync(answers);
  }

  // Synchronisation forcée (bloquante) - pour moments critiques
  async function syncNow(answers) {
    try {
      const profileData = mapQuizAnswersToProfile(answers);
      
      if (!window._sb) {
        console.warn('[profileSync] Supabase client not ready');
        return false;
      }

      const { data: user } = await window._sb.auth.getUser();
      if (!user || !user.user || !user.user.id) {
        console.warn('[profileSync] No user logged in (session not ready yet)');
        return false;
      }

      const { error } = await Promise.race([
        window._sb.from('profiles').update(profileData).eq('id', user.user.id),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000))
      ]);

      if (error) {
        console.error('[profileSync] Force sync error:', error);
        return false;
      }

      lastSyncedData = profileData;
      console.info('✅ [profileSync] Force sync success');
      return true;

    } catch (e) {
      console.error('[profileSync] Force sync exception:', e);
      return false;
    }
  }

  // Exposer l'API
  window.profileSync = {
    syncAnswers,    // Fire-and-forget
    syncNow,        // Bloquant
    mapQuizAnswersToProfile // Utilitaire exposé
  };

  console.info('[profileSync] loaded');
})();

