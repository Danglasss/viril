// Lightweight client wrapper exposed on window for centralized access from UMD components
// This makes it easy to later route calls through a backend while keeping a single interface.
(function(){
  console.info('[sb] wrapper loading');
  // simple wait helper because CDN scripts can be async
  function waitForClient(){
    if (window.supabase && typeof window.supabase.createClient === 'function') return Promise.resolve();
    return new Promise(function(resolve){
      var tries = 0; var id = setInterval(function(){
        if ((window.supabase && typeof window.supabase.createClient === 'function') || tries++ > 200) { clearInterval(id); resolve(); }
      }, 25);
    });
  }
  // Read from env (Next.js public env) or window injections; fallback to provided defaults for reliability
  const DEFAULT_SUPABASE_URL = 'https://jdglouhvmwozdbuzbngh.supabase.co';
  const DEFAULT_SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkZ2xvdWh2bXdvemRidXpibmdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3OTM5NzUsImV4cCI6MjA3NzM2OTk3NX0.HBvyGfjkLxcK-OOl9yUA-7sUzl5o6Xdke98NlLY20LQ';
  const url = (function(){ try { return (typeof process!=='undefined' && process.env && process.env.NEXT_PUBLIC_SUPABASE_URL) || window.__SUPABASE_URL || DEFAULT_SUPABASE_URL; } catch(_) { return window.__SUPABASE_URL || DEFAULT_SUPABASE_URL; } })();
  const anonKey = (function(){ try { return (typeof process!=='undefined' && process.env && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) || window.__SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON; } catch(_) { return window.__SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON; } })();
  try { if (url) window.__SUPABASE_URL = url; if (anonKey) window.__SUPABASE_ANON_KEY = anonKey; } catch(_) {}
  if (!url || !anonKey) { console.error('[sb] Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY'); }

  function uuidv4(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c){
      const r = Math.random()*16|0, v = c==='x'?r:(r&0x3|0x8); return v.toString(16);
    });
  }

  // User ID persistence helpers
  function getStoredUserId(){
    try { return localStorage.getItem('viril_user_id') || null; } catch(_) { return null; }
  }
  function setStoredUserId(id){
    try { if (id) localStorage.setItem('viril_user_id', id); } catch(_) {}
  }

  function ensure(){
    if (!window._sb) {
      if (!(window.supabase && typeof window.supabase.createClient === 'function')) return null;
      window._sb = window.supabase.createClient(url, anonKey, { auth: { persistSession: true } });
      console.info('[sb] client created');
    }
    return window._sb;
  }

  // Debug helper to inspect current auth/client state on demand
  async function __sbDebug(){
    try {
      await waitForClient();
      const sb = ensure();
      const env = { url, anonLen: String(anonKey||'').length };
      const sess = sb ? await sb.auth.getSession() : null;
      const usr = sb ? await sb.auth.getUser() : null;
      console.info('[sb][debug]', { env, hasClient: !!sb, session: (sess && sess.data && !!sess.data.session), userId: (usr && usr.data && usr.data.user && usr.data.user.id) });
    } catch(e) { console.warn('[sb][debug] failed', e && e.message); }
  }

  // quiz version: env -> window flag -> url ?qv=
  function getQuizVersion(){
    try {
      var fromEnv = (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_QUIZ_VERSION) || undefined;
    } catch(_) { var fromEnv = undefined; }
    const fromWin = (window && window.__QUIZ_VERSION) || undefined;
    let fromUrl = undefined;
    try { fromUrl = new URL(window.location.href).searchParams.get('qv') || undefined; } catch(_) {}
    return fromEnv || fromWin || fromUrl || 'A';
  }

  // LP variant from URL (?lp=emotion|science|var) or pathname (/lp/emotion)
  function getLpVariant(){
    try {
      var url = new URL(window.location.href);
      var fromParam = url.searchParams.get('lp');
      if (fromParam) return String(fromParam);
      var path = url.pathname || '';
      var m = path.match(/\/lp\/([^/?#]+)/);
      if (m && m[1]) return String(m[1]);
    } catch(_) {}
    return undefined;
  }

  // ⭐ PROTECTION ANTI-RACE CONDITION: Promise partagée entre tous les appels simultanés
  let _sessionInitPromise = null;
  
  async function ensureSession(){
    // Si une initialisation est déjà en cours, attendre sa résolution au lieu d'en lancer une nouvelle
    if (_sessionInitPromise) {
      console.info('[sb] ensureSession: waiting for existing initialization...');
      return _sessionInitPromise;
    }

    await waitForClient();
    const sb = ensure(); 
    if (!sb) {
      console.error('[sb] ensureSession: client not ready');
      return null;
    }
    console.info('[sb] ensureSession: checking session...');
    let { data: { session } } = await sb.auth.getSession();
    console.info('[sb] existing session:', session ? 'YES' : 'NO');
    
    if (!session) {
      // Créer une promise partagée que tous les autres appels attendront
      _sessionInitPromise = (async () => {
        try {
          const lockKey = 'sb_signing_lock';
          const lockValue = Date.now().toString();
          const lockTimeout = 5000; // 5 secondes max
          
          // Vérifier si un lock existe déjà (protection multi-onglets)
          const existingLock = localStorage.getItem(lockKey);
          if (existingLock) {
            const lockAge = Date.now() - parseInt(existingLock, 10);
            // Si le lock est récent (< 5s), attendre un peu et réessayer
            if (lockAge < lockTimeout) {
              console.warn('[sb] signup already in progress (recent lock), waiting...');
              await new Promise(r => setTimeout(r, 1000));
              // Re-vérifier si une session existe maintenant
              const { data: { session: retrySession } } = await sb.auth.getSession();
              if (retrySession) {
                console.info('[sb] session now exists after waiting');
                return retrySession;
              }
            } else {
              console.warn('[sb] stale lock detected, overriding');
            }
          }
          
          // Acquérir le lock avec timestamp
          localStorage.setItem(lockKey, lockValue);
          
          // ⭐ VÉRIFICATION CRITIQUE: Double-check qu'on possède toujours le lock
          // (un autre onglet aurait pu l'écraser entre-temps)
          await new Promise(r => setTimeout(r, 50));
          if (localStorage.getItem(lockKey) !== lockValue) {
            console.warn('[sb] lost lock race to another tab, aborting signin');
            return null;
          }
          
          console.info('[sb] attempting anonymous signin...');
          const result = await sb.auth.signInAnonymously();
          console.info('[sb] anon signin result:', { 
            hasData: !!result.data, 
            hasSession: !!(result.data && result.data.session),
            hasError: !!result.error,
            errorMsg: result.error ? result.error.message : null,
            errorStatus: result.error ? result.error.status : null,
            errorCode: result.error ? result.error.code : null
          });
          
          if (result.error) throw result.error;
          console.info('[sb] anon signin ok');
          
          // Récupérer la session créée
          const { data: { session: newSession } } = await sb.auth.getSession();
          return newSession;
          
        } catch(e) {
          console.error('[sb] anon signin FAILED - full error:', e);
          console.error('[sb] error details:', {
            message: e && e.message,
            status: e && e.status,
            code: e && e.code,
            name: e && e.name,
            __isAuthError: e && e.__isAuthError
          });
          return null;
        } finally { 
          try { localStorage.removeItem('sb_signing_lock'); } catch(_) {}
          _sessionInitPromise = null; // Libérer la promise
        }
      })();
      
      // Attendre la promise partagée
      session = await _sessionInitPromise;
    }
    // upsert profile shell (one row per user_id) and quiz_session
    try { 
      const { data: u } = await sb.auth.getUser(); 
      if (u && u.user) {
        // persist user id locally for quick retrievals
        try { setStoredUserId(u.user.id); } catch(_) {}
        const { error } = await sb.from('profiles').upsert({ id: u.user.id }, { onConflict: 'id' });
        if (error) console.error('[sb] profiles upsert shell error', error); else console.info('[sb] profiles upsert shell ok');
        // Ensure a quiz_session row exists at step 0 for this user (but do NOT override higher steps)
        try {
          const { data: existing, error: selErr } = await sb.from('quiz_sessions').select('user_id, variant_lp').eq('user_id', u.user.id).maybeSingle();
          if (!selErr && !existing) {
            const init = { user_id: u.user.id, step: 0, answers: {}, quiz_version: getQuizVersion(), variant_lp: getLpVariant() };
            const { error: insErr } = await sb.from('quiz_sessions').insert(init);
            if (insErr) console.warn('[sb] init quiz_session insert failed', insErr); else console.info('[sb] init quiz_session created');
          } else if (!selErr && existing && !existing.variant_lp) {
            const v = getLpVariant();
            if (v) {
              const { error: updErr } = await sb.from('quiz_sessions').update({ variant_lp: v }).eq('user_id', u.user.id);
              if (updErr) console.warn('[sb] variant_lp update failed', updErr); else console.info('[sb] variant_lp set');
            }
          }
        } catch(e2) { console.warn('[sb] init quiz_session check failed', e2 && e2.message); }
      } 
    } catch(e) { 
      console.warn('[sb] profiles upsert shell skipped', e && e.message); 
    }
    return session;
  }

  async function signUpEmail({ email, password, data }){
    await waitForClient();
    const sb = ensure(); if (!sb) return null;
    const { data: res, error } = await sb.auth.signUp({ email, password, options: { data } });
    if (error) throw error; return res;
  }

  async function upsertProfile(partial){
    await waitForClient();
    const sb = ensure(); if (!sb) return null;
    const { data: u } = await sb.auth.getUser(); const id = u && u.user && u.user.id;
    if (!id) throw new Error('no user');
    const { error } = await sb.from('profiles').upsert({ id, quiz_version: getQuizVersion(), ...partial }, { onConflict: 'id' });
    if (error) { console.error('[sb] upsertProfile error', error); throw error; }
    console.info('[sb] upsertProfile ok');
    return true;
  }

  async function saveProgress({ step, answers }){
    await waitForClient();
    const sb = ensure(); if (!sb) return false;
    const { data: u } = await sb.auth.getUser(); const user_id = u && u.user && u.user.id;
    if (!user_id) return false;
    // persist user id locally
    try { setStoredUserId(user_id); } catch(_) {}
    // Read current to avoid decreasing the stored step; merge answers
    let currentStep = 0; let currentAnswers = {}; let currentVariant = undefined;
    try {
      const { data: cur, error: selErr } = await sb.from('quiz_sessions').select('step, answers, variant_lp').eq('user_id', user_id).maybeSingle();
      if (!selErr && cur) { currentStep = Number(cur.step||0)||0; currentAnswers = cur.answers || {}; currentVariant = cur.variant_lp; }
    } catch(_) {}
    const nextStep = Math.max(currentStep, Number(step||0)||0);
    const mergedAnswers = Object.assign({}, currentAnswers, answers||{});
    const payload = { user_id, step: nextStep, answers: mergedAnswers, quiz_version: getQuizVersion(), variant_lp: (currentVariant || getLpVariant()) };
    const { error } = await sb.from('quiz_sessions').upsert(payload, { onConflict: 'user_id' });
    if (error) { console.error('[sb] saveProgress error', error); return false; }
    console.info('[sb] saveProgress ok', { step_submitted: step||0, step_saved: payload.step });
    return true;
  }

  // ⭐ Calcul du profil de périnée basé sur les réponses du quiz
  function computePerineeProfile(answers){
    if (!answers || typeof answers !== 'object') return null;
    let hyper = 0, hypo = 0;
    // hx_sport_core: often -> hyper, never -> hypo
    if (answers.hx_sport_core === 'often') hyper++; 
    else if (answers.hx_sport_core === 'never') hypo++;
    // hx_ejac_precoce_always: yes -> hyper
    if (answers.hx_ejac_precoce_always === 'yes') hyper++;
    // hx_erection_difficulty: yes/sometimes -> hypo
    if (answers.hx_erection_difficulty === 'yes' || answers.hx_erection_difficulty === 'sometimes') hypo++;
    // hx_urine_leak: yes -> hypo
    if (answers.hx_urine_leak === 'yes') hypo++;
    // hx_post_act_feel: fatigue -> hyper, relaxed -> hypo
    if (answers.hx_post_act_feel === 'fatigue') hyper++; 
    else if (answers.hx_post_act_feel === 'relaxed') hypo++;
    // hx_tension_pattern: tense -> hyper, relaxed -> hypo
    if (answers.hx_tension_pattern === 'tense') hyper++; 
    else if (answers.hx_tension_pattern === 'relaxed') hypo++;
    // hx_penetration_sensation: yes -> hypo
    if (answers.hx_penetration_sensation === 'yes') hypo++;
    
    return hyper >= hypo ? 'hyper' : 'hypo';
  }

  async function finalizePlan({ scores, plan, answers }){
    await waitForClient();
    const sb = ensure(); if (!sb) return false;
    const { data: u } = await sb.auth.getUser(); const user_id = u && u.user && u.user.id;
    if (!user_id) return false;
    try { setStoredUserId(user_id); } catch(_) {}
    
    // ⭐ Calculer le profil de périnée depuis les réponses
    const perineeProfile = computePerineeProfile(answers || {});
    console.info('[sb] finalizePlan: perinee_profile =', perineeProfile);
    
    // 1️⃣ Insérer le plan
    const { error: planError } = await sb.from('plans').insert({ 
      user_id, 
      version: 1, 
      plan: plan||{}, 
      quiz_version: getQuizVersion(), 
      created_at: new Date().toISOString() 
    });
    if (planError) { 
      console.error('[sb] finalizePlan error', planError); 
      return false; 
    }
    console.info('[sb] finalizePlan: plan inserted');
    
    // 2️⃣ Mettre à jour quiz_sessions.scores avec perinee_profile
    if (perineeProfile) {
      const scoresData = { perinee_profile: perineeProfile, ...(scores || {}) };
      const { error: scoresError } = await sb.from('quiz_sessions')
        .update({ scores: scoresData })
        .eq('user_id', user_id);
      if (scoresError) {
        console.error('[sb] finalizePlan: quiz_sessions.scores update error', scoresError);
      } else {
        console.info('[sb] finalizePlan: quiz_sessions.scores updated');
      }
    }
    
    // 3️⃣ Créer/mettre à jour user_progress avec parcours_type et niveau
    if (perineeProfile) {
      const { error: progressError } = await sb.from('user_progress').upsert({ 
        user_id,
        parcours_type: perineeProfile,
        niveau: 'débutant',
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
      if (progressError) {
        console.error('[sb] finalizePlan: user_progress upsert error', progressError);
      } else {
        console.info('[sb] finalizePlan: user_progress upserted');
      }
    }
    
    // 4️⃣ Mettre à jour profiles.diagnostic avec perinee_profile
    if (perineeProfile) {
      const { error: diagError } = await sb.from('profiles')
        .update({ diagnostic: perineeProfile })
        .eq('id', user_id);
      if (diagError) {
        console.error('[sb] finalizePlan: profiles.diagnostic update error', diagError);
      } else {
        console.info('[sb] finalizePlan: profiles.diagnostic updated');
      }
    }
    
    console.info('[sb] finalizePlan ok (all writes completed)');
    return true;
  }

  async function signInWithGoogle(){
    const sb = ensure(); if (!sb) throw new Error('Supabase not ready');
    const { error } = await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.href.replace(/\?.*$/, '') } });
    if (error) throw error; return true;
  }

  window.sbApi = { ensureSession, upsertProfile, saveProgress, finalizePlan, signUpEmail, signInWithGoogle, computePerineeProfile, __sbDebug, getQuizVersion };
  console.info('[sb] wrapper loaded');
})();


