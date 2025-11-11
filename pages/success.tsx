import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Success() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [purchaseSent, setPurchaseSent] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // On arrival, attempt to fetch Stripe Checkout Session and push GA4 purchase
  useEffect(() => {
    async function trackPurchase() {
      try {
        if (purchaseSent) return;
        if (!router.isReady) return;
        const sessionId = String((router.query.session_id as string) || '').trim();
        if (!sessionId) { console.warn('[success] missing session_id'); return; }

        // Prevent double-tracking on refresh
        try {
          const already = (typeof window !== 'undefined') ? window.sessionStorage.getItem('viril_purchase_tracked_session_id') : null;
          if (already && already === sessionId) {
            console.info('[success] purchase already tracked for session', sessionId);
            return;
          }
        } catch(_) {}

        // Read plan metadata saved before redirect (sessionStorage primary, localStorage fallback)
        let planMeta: any = null;
        try {
          const raw = (typeof window !== 'undefined') ? 
            (window.sessionStorage.getItem('viril_checkout_plan') || window.localStorage.getItem('viril_checkout_plan')) : null;
          if (raw) { planMeta = JSON.parse(raw); }
        } catch(_) {}
        if (!planMeta || !planMeta.value || !planMeta.currency) {
          console.warn('[success] missing plan metadata in storage');
          return;
        }

        const amount = Number(planMeta.value);
        const currency = String(planMeta.currency || 'EUR').toUpperCase();
        const itemId = String(planMeta.item_id || planMeta.plan_id || 'viril_subscription');
        const itemName = String(planMeta.item_name || 'Viril Premium');
        
        console.info('[success] Plan metadata found', { amount, currency, itemId, itemName });

        // Push GA4 purchase event via GTM dataLayer (transaction_id MUST be session_id)
        (window as any).dataLayer = (window as any).dataLayer || [];
        (window as any).dataLayer.push({
          event: 'purchase',
          ecommerce: {
            transaction_id: sessionId,
            value: amount,
            currency: currency || 'EUR',
            items: [
              {
                item_id: itemId,
                item_name: itemName,
                price: amount,
                quantity: 1
              }
            ]
          }
        });
        setPurchaseSent(true);
        console.info('[success] purchase event pushed', { transaction_id: sessionId, amount, currency, itemId });

        // Mark tracked and clean storage
        try {
          window.sessionStorage.setItem('viril_purchase_tracked_session_id', sessionId);
          window.sessionStorage.removeItem('viril_checkout_plan');
        } catch(_) {}
      } catch (e) {
        console.error('[success] trackPurchase error', e);
      }
    }
    trackPurchase();
  }, [router.isReady, router.query, purchaseSent]);

  const handleActivate = () => {
    router.push('/activate');
  };

  return (
    <>
      <Head>
        <title>Paiement confirmé — Viril</title>
        <meta name="robots" content="noindex" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div 
        style={{ 
          background: '#0E0E0F', 
          minHeight: '100vh', 
          color: '#F2F2F3',
          fontFamily: 'Manrope, ui-sans-serif, system-ui, -apple-system'
        }}
      >
        {/* Header with Logo */}
        <header 
          style={{ 
            padding: '20px', 
            position: 'absolute',
            top: 0,
            left: 0
          }}
        >
          <img src="/viril-logo.svg" alt="Viril" style={{ height: 32 }} />
        </header>

        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '20px'
          }}
        >
        <div 
          style={{ 
            maxWidth: 560, 
            width: '100%',
            textAlign: 'center',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease'
          }}
        >
          {/* Success Icon */}
          <div 
            style={{ 
              width: 80, 
              height: 80, 
              borderRadius: '50%', 
              background: 'rgba(34, 197, 94, 0.1)',
              border: '2px solid rgba(34, 197, 94, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: 40
            }}
          >
            ✅
          </div>

          {/* Title */}
          <h1 
            style={{ 
              fontSize: 36, 
              fontWeight: 900, 
              marginBottom: 12,
              letterSpacing: '-0.02em',
              lineHeight: 1.2
            }}
          >
            Paiement confirmé !
          </h1>

          {/* Subtitle */}
          <p 
            style={{ 
              fontSize: 18, 
              opacity: 0.85, 
              marginBottom: 32,
              lineHeight: 1.5
            }}
          >
            Étape suivante : Activez votre compte
          </p>

          {/* CTA Button */}
          <button
            onClick={handleActivate}
            style={{
              background: 'linear-gradient(135deg, #FF4D00, #FF7A1A)',
              color: '#FFF',
              padding: '18px 48px',
              borderRadius: 12,
              border: 'none',
              fontWeight: 800,
              fontSize: 18,
              cursor: 'pointer',
              boxShadow: '0 4px 24px rgba(255, 77, 0, 0.3)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              width: '100%',
              maxWidth: 360,
              marginBottom: 24
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 32px rgba(255, 77, 0, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 24px rgba(255, 77, 0, 0.3)';
            }}
          >
            Activer mon compte →
          </button>

          {/* Email notice */}
          <div 
            style={{ 
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 12,
              padding: 20,
              fontSize: 15,
              lineHeight: 1.6
            }}
          >
            <span style={{ fontSize: 20, marginRight: 8 }}>📧</span>
            <span style={{ opacity: 0.9 }}>
              Un email récapitulatif vous a été envoyé
            </span>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}

