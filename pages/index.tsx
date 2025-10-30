import Head from 'next/head';
import { useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';

type LangDict = Record<string, Record<string, string>>;

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const langCode = (Array.isArray(query.lang) ? query.lang[0] : query.lang) || 'fr';
  return { props: { langCode } };
};

export default function Home({ langCode }: { langCode: string }) {
  const [lang, setLang] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/data/lang.json');
        if (res.ok) {
          const data: LangDict = await res.json();
          setLang(data[langCode] || data['fr'] || {});
        }
      } catch {}
    })();
  }, [langCode]);

  const t = (key: string) => lang[key] || key;

  return (
    <>
      <Head>
        <title>Viril — Reprends le contrôle au lit en 12 semaines</title>
        <meta name="description" content="Programme d'exercices périnéaux guidés. 5 min/jour, résultats mesurés dès la 2ᵉ semaine. 8 500+ utilisateurs. Test gratuit." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{ background: '#0E0E0F', color: '#F2F2F3', minHeight: '100vh', fontFamily: 'Manrope, ui-sans-serif, system-ui, -apple-system' }}>
        
        {/* Header */}
        <header style={{ borderBottom: '1px solid rgba(255,255,255,.08)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <img src="/viril-logo.svg" alt="Viril" style={{ height: 32 }} />
          <a href="/test?lp=science" style={{ color: '#FF7A1A', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
            {t('lp_cta_quiz')}
          </a>
        </header>

        {/* Hero */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 20px 80px', textAlign: 'center' }}>
          <h1 style={{ fontSize: 48, fontWeight: 900, lineHeight: 1.1, margin: '0 0 16px', letterSpacing: '-.02em' }}>
            {t('lp_hero_title')}
          </h1>
          <p style={{ fontSize: 18, opacity: .85, margin: '0 0 24px', maxWidth: 700, marginLeft: 'auto', marginRight: 'auto' }}>
            {t('lp_hero_subtitle')}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 20, fontSize: 14, opacity: .7 }}>
            <span>⭐ 8 500+ utilisateurs</span>
            <span>•</span>
            <span>Note 4,8/5</span>
            <span>•</span>
            <span>Méthode validée</span>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a 
              href="/construction" 
              style={{ 
                background: 'linear-gradient(135deg, #FF4D00, #FF7A1A)', 
                color: '#FFF', 
                padding: '16px 32px', 
                borderRadius: 8, 
                textDecoration: 'none', 
                fontWeight: 800, 
                fontSize: 16,
                boxShadow: '0 4px 20px rgba(255,77,0,.3)',
                display: 'inline-block'
              }}
            >
              {t('lp_cta_download')}
            </a>
            <a 
              href="/test?lp=science" 
              style={{ 
                background: 'rgba(255,255,255,.06)', 
                color: '#F2F2F3', 
                padding: '16px 32px', 
                borderRadius: 8, 
                textDecoration: 'none', 
                fontWeight: 800, 
                fontSize: 16,
                border: '1px solid rgba(255,255,255,.12)',
                display: 'inline-block'
              }}
            >
              {t('lp_cta_quiz')}
            </a>
          </div>
          <p style={{ marginTop: 12, fontSize: 12, opacity: .6 }}>
            Gratuit • Confidentiel • Sans équipement
          </p>
        </section>

        {/* Comment ça fonctionne */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 20px', borderTop: '1px solid rgba(255,255,255,.08)' }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, textAlign: 'center', marginBottom: 40, letterSpacing: '-.01em' }}>
            {t('lp_how_title')}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
            {[
              { num: '1', title: t('lp_step1_title'), desc: t('lp_step1_desc') },
              { num: '2', title: t('lp_step2_title'), desc: t('lp_step2_desc') },
              { num: '3', title: t('lp_step3_title'), desc: t('lp_step3_desc') }
            ].map(step => (
              <div key={step.num} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, padding: 24 }}>
                <div style={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: 8, 
                  background: 'linear-gradient(135deg, #FF4D00, #FF7A1A)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: 24, 
                  fontWeight: 900,
                  marginBottom: 16
                }}>
                  {step.num}
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>{step.title}</h3>
                <p style={{ fontSize: 15, opacity: .8, lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <a 
              href="/test?lp=science" 
              style={{ 
                background: 'linear-gradient(135deg, #FF4D00, #FF7A1A)', 
                color: '#FFF', 
                padding: '14px 28px', 
                borderRadius: 8, 
                textDecoration: 'none', 
                fontWeight: 800, 
                fontSize: 15,
                display: 'inline-block'
              }}
            >
              {t('lp_cta_quiz')}
            </a>
          </div>
        </section>

        {/* Features */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 20px', borderTop: '1px solid rgba(255,255,255,.08)' }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, textAlign: 'center', marginBottom: 40 }}>
            {t('lp_features_title')}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {[
              'Accès privé à ton espace d\'entraînement (mobile & desktop)',
              'Vidéos techniques : posture, respiration, contraction/relâchement',
              'Programme progressif sur 12 semaines (débutant → avancé)',
              'Suivi automatique de tes performances (tracking des durées)',
              'Exercices de désensibilisation et techniques de contrôle mental',
              'Protocole validé sur 8 500+ utilisateurs'
            ].map((feature, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ color: '#FF7A1A', fontSize: 20, lineHeight: 1 }}>✓</span>
                <span style={{ fontSize: 15, opacity: .9, lineHeight: 1.6 }}>{feature}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Preuves sociales */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 20px', borderTop: '1px solid rgba(255,255,255,.08)' }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, textAlign: 'center', marginBottom: 16 }}>
            {t('lp_social_title')}
          </h2>
        
          <div style={{ display: 'flex', gap: 32, justifyContent: 'center', marginBottom: 40, flexWrap: 'wrap', fontSize: 15, opacity: .85 }}>
            <span>✓ 89% atteignent 10+ min</span>
            <span>✓ +320% de durée moyenne</span>
            <span>✓ 97% voient des résultats dès la 2ᵉ semaine</span>
          </div>
        
        </section>

        {/* Pourquoi ça marche */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 20px', borderTop: '1px solid rgba(255,255,255,.08)' }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, textAlign: 'center', marginBottom: 40 }}>
            {t('lp_why_title')}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            <div style={{ background: 'rgba(255,77,0,.08)', border: '1px solid rgba(255,77,0,.2)', borderRadius: 12, padding: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#FF7A1A' }}>Hypertonique</h3>
              <p style={{ fontSize: 15, lineHeight: 1.6, margin: 0, opacity: .9 }}>
                Excès de tension → hypersensibilité. <br />
                Méthode : désensibilisation progressive + respiration.
              </p>
            </div>
            <div style={{ background: 'rgba(255,77,0,.08)', border: '1px solid rgba(255,77,0,.2)', borderRadius: 12, padding: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#FF7A1A' }}>Hypotonique</h3>
              <p style={{ fontSize: 15, lineHeight: 1.6, margin: 0, opacity: .9 }}>
                Manque de tonus → contrôle limité. <br />
                Méthode : renforcement musculaire + coordination.
              </p>
            </div>
          </div>
          <p style={{ textAlign: 'center', marginTop: 32, fontSize: 16, opacity: .9 }}>
            Le test gratuit identifie ton profil en 2 minutes.
          </p>
        </section>

        {/* FAQ */}
        <section style={{ maxWidth: 900, margin: '0 auto', padding: '60px 20px', borderTop: '1px solid rgba(255,255,255,.08)' }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, textAlign: 'center', marginBottom: 40 }}>
            {t('lp_faq_title')}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              { q: "Le programme est-il adapté à tous ?", a: "Oui, sauf contre-indications médicales spécifiques. Consulte un médecin si doute." },
              { q: "C'est anonyme ?", a: "Oui, aucune donnée personnelle divulguée." },
              { q: "Dois-je m'entraîner tous les jours ?", a: "5 jours/semaine, 5 min/jour suffit." },
              { q: "Quand vais-je voir des résultats ?", a: "97% des utilisateurs constatent des améliorations dès la 2ᵉ semaine." },
              { q: "Ça remplace un traitement médical ?", a: "Non. Si tu as des troubles persistants, consulte un professionnel de santé." },
              { q: "Je suis célibataire, c'est utile ?", a: "Oui, tu seras prêt et confiant quand l'occasion se présentera." }
            ].map((faq, i) => (
              <details key={i} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, padding: 20 }}>
                <summary style={{ fontSize: 16, fontWeight: 700, cursor: 'pointer', marginBottom: 12 }}>
                  {faq.q}
                </summary>
                <p style={{ fontSize: 15, opacity: .85, lineHeight: 1.6, margin: 0 }}>
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 20px', borderTop: '1px solid rgba(255,255,255,.08)', textAlign: 'center' }}>
          <h2 style={{ fontSize: 36, fontWeight: 900, marginBottom: 16 }}>
            Tu ne risques rien. Tu as tout à gagner.
          </h2>
          <p style={{ fontSize: 18, opacity: .85, marginBottom: 32 }}>
            Commence dès maintenant ton programme personnalisé.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a 
              href="/construction" 
              style={{ 
                background: 'linear-gradient(135deg, #FF4D00, #FF7A1A)', 
                color: '#FFF', 
                padding: '16px 32px', 
                borderRadius: 8, 
                textDecoration: 'none', 
                fontWeight: 800, 
                fontSize: 16,
                display: 'inline-block'
              }}
            >
              {t('lp_cta_download')}
            </a>
            <a 
              href="/test?lp=science" 
              style={{ 
                background: 'rgba(255,255,255,.06)', 
                color: '#F2F2F3', 
                padding: '16px 32px', 
                borderRadius: 8, 
                textDecoration: 'none', 
                fontWeight: 800, 
                fontSize: 16,
                border: '1px solid rgba(255,255,255,.12)',
                display: 'inline-block'
              }}
            >
              {t('lp_cta_quiz')}
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,.08)', padding: '40px 20px', textAlign: 'center', opacity: .7, fontSize: 13 }}>
          <div style={{ marginBottom: 16 }}>
            <a href="/terms" style={{ color: 'inherit', textDecoration: 'none', marginRight: 16 }}>CGU</a>
            <a href="/privacy" style={{ color: 'inherit', textDecoration: 'none', marginRight: 16 }}>Politique de confidentialité</a>
            <a href="/cookies" style={{ color: 'inherit', textDecoration: 'none', marginRight: 16 }}>Cookies</a>
            <a href="mailto:contact@viril.app" style={{ color: 'inherit', textDecoration: 'none' }}>Contact</a>
          </div>
          <p style={{ margin: 0 }}>© {new Date().getFullYear()} Viril. Tous droits réservés.</p>
        </footer>

      </div>
    </>
  );
}
