(function(){
  console.info('[checkout] loading');

  async function getUserId(){
    try {
      if (window._sb && window._sb.auth) {
        const { data } = await window._sb.auth.getUser();
        return data && data.user && data.user.id;
      }
    } catch(_) {}
    try {
      if (window.sbApi && typeof window.sbApi.ensureSession === 'function') {
        await window.sbApi.ensureSession();
        if (window._sb && window._sb.auth) {
          const { data } = await window._sb.auth.getUser();
          return data && data.user && data.user.id;
        }
      }
    } catch(_) {}
    return null;
  }

  async function getCheckoutLink(productId, userId){
    try {
      const res = await fetch('/functions/v1/create-checkout-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, user_id: userId })
      });
      const json = await res.json();
      const url = json && json.checkout_url;
      if (url) { window.location.href = url; return true; }
      console.error('[checkout] missing checkout_url', json);
      return false;
    } catch(e) {
      console.error('[checkout] error', e);
      return false;
    }
  }

  async function beginCheckoutForPlan(planId){
    const productMap = {
      'trial': 'prod_TMlLkLBpjkxYGn',     // 7 jours
      '4w': 'prod_TMlMxNWIYzqpis',        // 4 semaines
      '12w': 'prod_TMlNLx2uTW8fe3'        // 12 semaines
    };
    const productId = productMap[planId] || productMap['4w'];

    try { if (window.dataLayer) { window.dataLayer.push({ event:'begin_checkout', plan: planId, product_id: productId }); } } catch(_) {}

    const uid = await getUserId();
    const ok = await getCheckoutLink(productId, uid);
    if (!ok) {
      // Fallback vers /echec en préservant plan et langue
      try {
        var u = new URL(window.location.origin + '/echec');
        if (planId) u.searchParams.set('plan', String(planId));
        try { var langParam = new URL(window.location.href).searchParams.get('lang'); if (langParam) u.searchParams.set('lang', langParam); } catch(_){ }
        u.searchParams.set('reason', 'checkout_error');
        window.location.href = u.toString();
      } catch(_) {
        window.location.href = '/echec';
      }
    }
  }

  window.checkout = { getCheckoutLink, beginCheckoutForPlan };
  console.info('[checkout] loaded');
})();
