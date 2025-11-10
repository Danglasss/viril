(function(){
  console.info('[checkout] loading');

  async function ensureSession(){
    try { if (window.sbApi && typeof window.sbApi.ensureSession === 'function') { await window.sbApi.ensureSession(); } } catch(_) {}
  }

  async function getUserId(){
    try {
      if (window._sb && window._sb.auth) {
        const { data } = await window._sb.auth.getUser();
        return data && data.user && data.user.id;
      }
    } catch(_) {}
    await ensureSession();
    try {
      if (window._sb && window._sb.auth) {
        const { data } = await window._sb.auth.getUser();
        return data && data.user && data.user.id;
      }
    } catch(_) {}
    return null;
  }

  async function getAccessToken(){
    try {
      if (window._sb && window._sb.auth) {
        const { data } = await window._sb.auth.getSession();
        return data && data.session && data.session.access_token;
      }
    } catch(_) {}
    return null;
  }

  function getFunctionsUrl(){
    try {
      var base = (window.__SUPABASE_URL || '').replace(/\/$/, '');
      if (!base) throw new Error('missing_supabase_url');
      return base + '/functions/v1/create-checkout-link';
    } catch(_) { return '/functions/v1/create-checkout-link'; }
  }

  async function getCheckoutLink(planId, userId){
    // Map direct planId → Stripe Payment Link
    const stripeLinks = {
      'trial': 'https://buy.stripe.com/9B600l4IlcLocVF9oq8IU00',  // 7 jours
      '4w': 'https://buy.stripe.com/dRm7sN7UxaDgg7R7gi8IU01',     // 4 semaines
      '12w': 'https://buy.stripe.com/5kQ9AVeiV12GaNxfMO8IU02'     // 12 semaines
    };
    
    const baseUrl = stripeLinks[planId];
    if (!baseUrl) throw new Error('unknown_plan_id');
    
    // Construire l'URL avec client_reference_id
    const url = new URL(baseUrl);
    if (userId) url.searchParams.set('client_reference_id', userId);
    
    console.info('[checkout] stripe payment link', { planId, userId: userId ? 'present' : 'missing', url: url.toString() });
    return url.toString();
  }

  async function beginCheckoutForPlan(planId){
    try { if (window.dataLayer) { window.dataLayer.push({ event:'begin_checkout', plan: planId }); } } catch(_) {}

    // Persist plan metadata for GA4 purchase event on /success (sessionStorage)
    try {
      var planMetaMap = {
        'trial': { item_id: 'trial', item_name: 'Accès 7 jours', value: 6.99, currency: 'EUR' },
        '4w': { item_id: '4w', item_name: 'Transformation 4 semaines', value: 15.19, currency: 'EUR' },
        '12w': { item_id: '12w', item_name: 'Maîtrise totale 12 semaines', value: 25.99, currency: 'EUR' }
      };
      var meta = planMetaMap[planId] || null;
      if (meta) {
        var payload = { plan_id: planId, item_id: meta.item_id, item_name: meta.item_name, value: meta.value, currency: meta.currency, saved_at: Date.now() };
        try { sessionStorage.setItem('viril_checkout_plan', JSON.stringify(payload)); } catch(_) {}
      }
    } catch(_) {}

    try {
      const uid = await getUserId();
      const link = await getCheckoutLink(planId, uid);
      console.info('[checkout] redirecting to:', link);
      window.location.href = link;
    } catch (e) {
      console.error('[checkout] beginCheckoutForPlan error', e);
      try { if (window.dataLayer) { window.dataLayer.push({ event:'checkout_error', plan: planId, error: String(e && e.message || e) }); } } catch(_) {}
      alert('Impossible d\'ouvrir la page de paiement. Erreur: ' + (e && e.message));
    }
  }

  window.checkout = { getCheckoutLink, beginCheckoutForPlan };
  console.info('[checkout] loaded');
})();
