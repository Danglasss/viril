import Head from 'next/head';
import Script from 'next/script';
import { useRouter } from 'next/router';

export default function Echec() {
  const router = useRouter();
  const plan = String((router.query.plan as string) || '').trim();
  const reason = String((router.query.reason as string) || 'checkout_error');

  const label = (function(){
    if (plan === 'trial') return 'Essai 7 jours';
    if (plan === '4w') return 'Plan 4 semaines';
    if (plan === '12w') return 'Plan 12 semaines';
    return plan ? `Plan: ${plan}` : 'Paiement';
  })();

  const title = `Échec du paiement — ${label} | Viril`;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div style={{ background:'#0E0E0F', minHeight:'100vh', color:'#F2F2F3' }}>
        <div style={{ maxWidth: 880, margin: '0 auto', padding: '24px 20px' }}>
          <h1 style={{ fontWeight: 900, letterSpacing: '.2px', margin: '12px 0 18px' }}>Le paiement n'a pas démarré</h1>
          <p style={{ opacity:.8, marginBottom: 12 }}>Vous tentiez d'ouvrir le paiement pour: <strong>{label}</strong></p>
          {reason && (
            <p style={{ opacity:.7, fontSize: 14 }}>Raison: {reason}</p>
          )}
          <div style={{ border:'1px solid rgba(255,255,255,.12)', borderRadius: 8, padding:16, background:'#161618' }}>
            <p style={{ lineHeight: 1.6, opacity:.9 }}>Vous pouvez tenter à nouveau d'ouvrir la page de paiement. Si le problème persiste, contactez le support.</p>
            <div style={{ display:'flex', gap:12, marginTop:12, flexWrap:'wrap' }}>
              <button
                onClick={function(){ try { if (window && (window as any).checkout && typeof (window as any).checkout.beginCheckoutForPlan === 'function') { (window as any).checkout.beginCheckoutForPlan(plan || '4w'); } } catch(_) {} }}
                style={{ background:'#FF4D00', color:'#FFFFFF', fontWeight:800, padding:'10px 14px', border:0, borderRadius:6, cursor:'pointer' }}
              >Réessayer le paiement</button>
              <a href={`mailto:dan@viril.app?subject=Problème paiement (${encodeURIComponent(plan||'inconnu')})`} style={{ color:'#FF7A1A', alignSelf:'center' }}>Contacter le support</a>
              <a href="/test" style={{ color:'#FF7A1A', alignSelf:'center' }}>Revenir au test</a>
            </div>
          </div>
        </div>
      </div>
      <Script src="/checkout.js" strategy="beforeInteractive" />
    </>
  );
}
