import Head from 'next/head';
import Script from 'next/script';
import { useEffect, useState } from 'react';

export default function Construction() {
  const [status, setStatus] = useState<'idle'|'saving'|'saved'|'error'>('idle');
  const [choice, setChoice] = useState<null|boolean>(null);
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Ensure quiz version is set from test.json BEFORE any sbApi call
    (async function(){
      try {
        const r = await fetch('/data/test.json');
        if (r && r.ok) {
          const test = await r.json();
          try { (window as any).__QUIZ_VERSION = (test && test.version) || (window as any).__QUIZ_VERSION || 'C'; } catch(_) {}
        }
      } catch(_) {}
      try {
        // Ensure anonymous session so we can upsert on profiles
        (window as any).sbApi && (await (window as any).sbApi.ensureSession());
      } catch(_) {}
    })();
    // Apply app theme (dark) like the main app
    (async function(){
      try {
        const res = await fetch('/data/theme.json');
        if (!res.ok) return;
        const theme = await res.json();
        const r = document.documentElement as HTMLElement;
        const c = (theme && theme.colors) || {} as any;
        const set = (k: string, v?: string) => v && r.style.setProperty(k, v);
        set('--color-primary', c.primary);
        set('--color-secondary', c.secondary);
        set('--color-bg', c.background);
        set('--color-text', c.text);
        set('--color-card', c.card);
        set('--color-option-bg', c.optionBackground);
        set('--color-option-selected', c.optionSelected);
        set('--color-button', c.button);
        set('--color-button-text', c.buttonText);
        set('--color-email-button', c.emailButton);
        set('--color-email-button-text', c.emailButtonText);
        // optional sliders
        r.style.setProperty('--slider-track', c.optionBackground || '#E6E3DC');
        r.style.setProperty('--slider-fill', c.emailButton || c.primary || '#80C9AC');
        r.style.setProperty('--slider-thumb', '#FFFFFF');
        try { setLogoUrl(theme && theme.logoUrl ? String(theme.logoUrl) : '/viril-logo.svg'); } catch(_) {}
      } catch(_) {}
    })();
  }, []);

  async function handleChoice(wantsNotify: boolean) {
    setChoice(wantsNotify);
    setStatus('saving');
    try {
      if ((window as any).dataLayer) {
        (window as any).dataLayer.push({ event: 'notify_choice', wants_notify: wantsNotify });
      }
      if ((window as any).sbApi && (window as any).sbApi.upsertProfile) {
        await (window as any).sbApi.upsertProfile({ app_interest: wantsNotify });
      }
      setStatus('saved');
    } catch (e) {
      setStatus('error');
    }
  }

  return (
    <>
      <Head>
        <title>Viril — Application en cours de construction</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div className="container" style={{ paddingTop: 28, paddingBottom: 28 }}>
        {logoUrl && (
          <div style={{ marginTop: 0, marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
            <img src={logoUrl} alt="logo" style={{ height: 48 }} />
          </div>
        )}
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <h1 style={{ fontFamily: 'Manrope, ui-sans-serif', fontSize: 30, fontWeight: 800, lineHeight: 1.15, margin: 0 }}>L’app est en cours de construction</h1>
          <p style={{ opacity: .9, marginTop: 10, fontSize: 16 }}>
            Merci de ton intérêt. On te prévient dès que c’est prêt ?
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 18 }}>
          <button
            onClick={() => handleChoice(true)}
            className="btn primary"
            style={{ width: 'auto' }}
          >Oui, préviens-moi</button>
          <button
            onClick={() => handleChoice(false)}
            className="btn secondary"
            style={{ width: 'auto', border: '1px solid rgba(255,255,255,.16)' }}
          >Non merci</button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 12, minHeight: 22, fontSize: 14, opacity: .85 }}>
          {status === 'saving' && 'Enregistrement...'}
          {status === 'saved' && (choice ? 'Parfait, on te avertira dès que c’est prêt.' : 'Compris. Merci pour ta réponse.')} 
          {status === 'error' && 'Une erreur est survenue. Réessaie.'}
        </div>

        <div style={{ marginTop: 28, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 12, padding: 16 }}>
          <h3 style={{ fontSize: 18, fontWeight: 900, letterSpacing: .2 }}>Ce que tu trouveras dans l’app :</h3>
          <div style={{ marginTop: 8, lineHeight: 1.7 }}>
            <div>✅ Accès privé à ton espace d'entraînement (mobile & desktop)</div>
            <div>✅ Vidéos techniques : posture, respiration, contraction/relâchement</div>
            <div>✅ Programme progressif sur 12 semaines (du niveau débutant à avancé)</div>
            <div>✅ Suivi automatique de tes performances (tracking des durées)</div>
            <div>✅ Exercices de désensibilisation et techniques de contrôle mental</div>
            <div>✅ Protocole validé sur 8500+ utilisateurs</div>
          </div>
        </div>
      </div>

      {/* Ensure Supabase and wrapper are available on this page too */}
      <Script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2" strategy="beforeInteractive" />
      <Script src="/supabaseClient.js" strategy="beforeInteractive" />
    </>
  );
}


