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

  function getClientId(){
    try {
      let id = localStorage.getItem('client_id');
      if (!id) { id = uuidv4(); localStorage.setItem('client_id', id); document.cookie = 'client_id='+id+'; path=/; max-age='+(3600*24*400); }
      return id;
    } catch(_) { return undefined; }
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

  async function ensureSession(){
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
      try {
        const lockKey = 'sb_signing_lock';
        if (!localStorage.getItem(lockKey)) {
          console.info('[sb] attempting anonymous signin...');
          localStorage.setItem(lockKey, '1');
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
        } else {
          console.warn('[sb] signup already in progress (lock exists)');
        }
      } catch(e) {
        console.error('[sb] anon signin FAILED - full error:', e);
        console.error('[sb] error details:', {
          message: e && e.message,
          status: e && e.status,
          code: e && e.code,
          name: e && e.name,
          __isAuthError: e && e.__isAuthError
        });
      }
      finally { try { localStorage.removeItem('sb_signing_lock'); } catch(_) {} }
      ({ data: { session } } = await sb.auth.getSession());
    }
    // upsert profile shell (one row per user_id) - TEMPORAIREMENT COMMENTÉ POUR DEBUG
    /*
    try { const { data: u } = await sb.auth.getUser(); if (u && u.user) {
      const { error } = await sb.from('profiles').upsert({ id: u.user.id }, { onConflict: 'id' });
      if (error) console.error('[sb] profiles upsert shell error', error); else console.info('[sb] profiles upsert shell ok');
      // Ensure a quiz_session row exists at step 0 for this user (but do NOT override higher steps)
      try {
        const { data: existing, error: selErr } = await sb.from('quiz_sessions').select('user_id, variant_lp').eq('user_id', u.user.id).maybeSingle();
        if (!selErr && !existing) {
          const init = { user_id: u.user.id, client_id: getClientId(), step: 0, answers: {}, quiz_version: getQuizVersion(), variant_lp: getLpVariant() };
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
    } } catch(e) { console.warn('[sb] profiles upsert shell skipped', e && e.message); }
    */
    console.info('[sb] DB upserts disabled for debugging');
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
    // Read current to avoid decreasing the stored step; merge answers
    let currentStep = 0; let currentAnswers = {}; let currentVariant = undefined;
    try {
      const { data: cur, error: selErr } = await sb.from('quiz_sessions').select('step, answers, variant_lp').eq('user_id', user_id).maybeSingle();
      if (!selErr && cur) { currentStep = Number(cur.step||0)||0; currentAnswers = cur.answers || {}; currentVariant = cur.variant_lp; }
    } catch(_) {}
    const nextStep = Math.max(currentStep, Number(step||0)||0);
    const mergedAnswers = Object.assign({}, currentAnswers, answers||{});
    const payload = { user_id, client_id: getClientId(), step: nextStep, answers: mergedAnswers, quiz_version: getQuizVersion(), variant_lp: (currentVariant || getLpVariant()) };
    const { error } = await sb.from('quiz_sessions').upsert(payload, { onConflict: 'user_id' });
    if (error) { console.error('[sb] saveProgress error', error); return false; }
    console.info('[sb] saveProgress ok', { step_submitted: step||0, step_saved: payload.step });
    return true;
  }

  async function finalizePlan({ scores, plan }){
    await waitForClient();
    const sb = ensure(); if (!sb) return false;
    const { data: u } = await sb.auth.getUser(); const user_id = u && u.user && u.user.id;
    if (!user_id) return false;
    const { error } = await sb.from('plans').insert({ user_id, client_id: getClientId(), version: 1, plan: plan||{}, quiz_version: getQuizVersion(), created_at: new Date().toISOString() });
    if (error) { console.error('[sb] finalizePlan error', error); return false; }
    console.info('[sb] finalizePlan ok');
    return true;
  }

  async function signInWithGoogle(){
    const sb = ensure(); if (!sb) throw new Error('Supabase not ready');
    const { error } = await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.href.replace(/\?.*$/, '') } });
    if (error) throw error; return true;
  }

  window.sbApi = { ensureSession, upsertProfile, saveProgress, finalizePlan, signUpEmail, signInWithGoogle, __sbDebug };
  console.info('[sb] wrapper loaded');
})();


