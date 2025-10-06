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
  const url = 'https://jlxmjcwckikwohndadue.supabase.co';
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpseG1qY3dja2lrd29obmRhZHVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3Mjg2MTQsImV4cCI6MjA3NTMwNDYxNH0.yt9-Blx8SObkxj7ZhaCRENxNhH5fNj906dNOigZst5w';

  function ensure(){
    if (!window._sb) {
      if (!(window.supabase && typeof window.supabase.createClient === 'function')) return null;
      window._sb = window.supabase.createClient(url, anonKey, { auth: { persistSession: true } });
      console.info('[sb] client created');
    }
    return window._sb;
  }

  async function ensureSession(){
    await waitForClient();
    const sb = ensure(); if (!sb) return null;
    let { data: { session } } = await sb.auth.getSession();
    if (!session) {
      try { await sb.auth.signInAnonymously(); console.info('[sb] anon signin ok'); } catch(e) { console.error('[sb] anon signin failed', e); }
      ({ data: { session } } = await sb.auth.getSession());
    }
    // upsert profile shell
    try { const { data: u } = await sb.auth.getUser(); if (u && u.user) {
      const { error } = await sb.from('profiles').upsert({ id: u.user.id }, { onConflict: 'id' });
      if (error) console.error('[sb] profiles upsert shell error', error); else console.info('[sb] profiles upsert shell ok');
    } } catch(e) { console.warn('[sb] profiles upsert shell skipped', e && e.message); }
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
    const { error } = await sb.from('profiles').upsert({ id, ...partial }, { onConflict: 'id' });
    if (error) { console.error('[sb] upsertProfile error', error); throw error; }
    console.info('[sb] upsertProfile ok');
    return true;
  }

  async function saveProgress({ step, answers }){
    await waitForClient();
    const sb = ensure(); if (!sb) return false;
    const { data: u } = await sb.auth.getUser(); const user_id = u && u.user && u.user.id;
    if (!user_id) return false;
    const payload = { user_id, step: step||0, answers: answers||{} };
    const { error } = await sb.from('quiz_sessions').upsert(payload, { onConflict: 'user_id' });
    if (error) { console.error('[sb] saveProgress error', error); return false; }
    console.info('[sb] saveProgress ok', { step: payload.step });
    return true;
  }

  async function finalizePlan({ scores, plan }){
    await waitForClient();
    const sb = ensure(); if (!sb) return false;
    const { data: u } = await sb.auth.getUser(); const user_id = u && u.user && u.user.id;
    if (!user_id) return false;
    const { error } = await sb.from('plans').insert({ user_id, version: 1, plan: plan||{}, created_at: new Date().toISOString() });
    if (error) { console.error('[sb] finalizePlan error', error); return false; }
    console.info('[sb] finalizePlan ok');
    return true;
  }

  async function signInWithGoogle(){
    const sb = ensure(); if (!sb) throw new Error('Supabase not ready');
    const { error } = await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.href.replace(/\?.*$/, '') } });
    if (error) throw error; return true;
  }

  window.sbApi = { ensureSession, upsertProfile, saveProgress, finalizePlan, signUpEmail, signInWithGoogle };
  console.info('[sb] wrapper loaded');
})();


