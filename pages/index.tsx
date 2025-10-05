import Head from 'next/head';
import Script from 'next/script';
import { GetServerSideProps } from 'next';
import { useEffect, useMemo, useState } from 'react';

type LangDict = Record<string, Record<string, string>>;
type Theme = {
  colors: Record<string, string> & { background?: string };
  radius: number;
  border: number;
  logoUrl?: string;
};
type Question = any;

function getParamFromQuery(query: Record<string, any>, name: string, defaultValue: string) {
  const raw = query[name];
  if (Array.isArray(raw)) return (raw[0] as string) ?? defaultValue;
  return (raw as string) ?? defaultValue;
}

export const getServerSideProps: GetServerSideProps = async ({ query, req }) => {
  const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
  const host = (req.headers['x-forwarded-host'] as string) || req.headers.host || '';
  const origin = host ? `${proto}://${host}` : '';
  async function readJson<T>(pathname: string): Promise<T> {
    const res = await fetch(`${origin}${pathname}`);
    if (!res.ok) throw new Error(`Failed to load ${pathname}: ${res.status}`);
    return (await res.json()) as T;
  }
  const theme: Theme = await readJson('/data/theme.json');
  const lang: LangDict = await readJson('/data/lang.json');
  const test: { questions: Question[] } = await readJson('/data/test.json');
  const langCode = getParamFromQuery(query as any, 'lang', 'en');
  const step = parseInt(getParamFromQuery(query as any, 'step', '0'), 10) || 0;
  return { props: { theme, lang, test, langCode, step } };
};

export default function Home({ theme, lang, test, langCode, step }: { theme: Theme; lang: LangDict; test: { questions: Question[] }; langCode: string; step: number; }) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [results, setResults] = useState<any>(null);
  const totalQuestions = test.questions.length;

  const t = (k: string) => (lang[langCode] && lang[langCode][k]) || k;
  const siteName = 'Viril';
  const origin = typeof window === 'undefined' ? '' : window.location.origin;
  const path = typeof window === 'undefined' ? '' : window.location.pathname + window.location.search;
  const url = `${origin || ''}${path || ''}`;
  const title = 'Viril — Solution contre l\u2019éjaculation pr\u00e9coce';
  const description = 'Programme et exercices pour retarder l\u2019\u00e9jaculation, am\u00e9liorer le contr\u00f4le et la confiance au lit.';

  useEffect(() => {
    const r = document.documentElement as HTMLElement;
    const c = theme.colors || {} as any;
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
    set('--slider-track', c.optionBackground || '#E6E3DC');
    set('--slider-fill', c.emailButton || c.primary || '#80C9AC');
    set('--slider-thumb', '#FFFFFF');
    r.style.setProperty('--radius', String(theme.radius)+'px');
    r.style.setProperty('--border', String(theme.border)+'px');
  }, [theme]);

  // Keep SSR block identical across server and first client render to avoid hydration mismatch

  const landingStep = useMemo(() => ({
    id: '__landing',
    type: 'Landing',
    headline: { fr: 'Solution pour éjaculation précoce', en: 'Premature ejaculation solution' },
    subtitle: { fr: 'Améliore ton contrôle et ta confiance au lit', en: 'Improve control and confidence in bed' },
    first: test.questions[0]
  }), [lang, test]);

  const flow = useMemo(() => ([
    landingStep,
    ...test.questions.slice(1),
    { id: '__email', type: 'Email', text: { [langCode]: t('enter_email') }, placeholder: t('email_placeholder'), cta: t('see_results') },
    { id: '__results', type: 'Results', results: results || { top: '', scores: {} }, title: t('results_title') }
  ]), [landingStep, test, langCode, results]);

  const total = flow.length;
  const current = Math.max(0, Math.min(step, total - 1));
  const q = flow[current];
  const qText = q.text && (q.text[langCode] || q.text['en'] || '');

  function computeScores() {
    const counts: Record<string, number> = {};
    for (const qq of test.questions) {
      const ans = (answers as any)[qq.id];
      if (!ans || !qq.options) continue;
      const handleVal = (val: any) => {
        const opt = (qq.options || []).find((o: any) => o.value === val);
        const key = opt && (opt.language || opt.lang);
        if (key) counts[key] = (counts[key] || 0) + 1;
      };
      if (Array.isArray(ans)) ans.forEach(handleVal); else handleVal(ans);
    }
    let top = '';
    let max = -1;
    Object.entries(counts).forEach(([k,v]) => { if (v > max) { max = v; top = k; } });
    return { top, scores: counts };
  }

  const goTo = (n: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set('step', String(n));
    window.location.assign(url.toString());
  };

  const isChoice = q.type === 'QCM' || q.type === 'ImageChoice';
  const hideNav = q.type === 'Email' || q.type === 'Landing' || q.type === 'Results';

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={url || 'https://example.com/'} />
        {/* OG */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={siteName} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url || 'https://example.com/'} />
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        {/* Single-locale FR; no hreflang alternates */}
        {/* JSON-LD */}
        <script type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: siteName,
            url: origin || 'https://example.com',
            logo: theme.logoUrl || undefined
          }) }} />
        <script type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: siteName,
            url: origin || 'https://example.com',
            potentialAction: {
              '@type': 'SearchAction',
              target: `${origin || 'https://example.com'}/?q={search_term_string}`,
              'query-input': 'required name=search_term_string'
            }
          }) }} />
      </Head>
      <div id="ssr-landing" className="container" suppressHydrationWarning>
        {theme.logoUrl && (
          <div style={{ marginTop: 0, marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
            <img src={theme.logoUrl} alt="logo" style={{ height: 48 }} />
          </div>
        )}
        <div style={{ minHeight: 'calc(100vh - 520px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'stretch' }}>
          <div style={{ marginBottom: 12, textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'Manrope, ui-sans-serif', fontSize: 34, fontWeight: 800, lineHeight: 1.15, margin: 0 }}>{landingStep.headline['fr']}</h1>
            <h2 style={{ opacity: .85, marginTop: 10, fontSize: 18, fontWeight: 600, fontFamily: 'Manrope, ui-sans-serif' }}>{landingStep.subtitle['fr']}</h2>
            {/* No-JS view: omit CTA link; show real options below */}
          </div>
          {/* Server-rendered preview of first question options (non-clickable, for SEO/no-JS) */}
          <div className="options" style={{ marginTop: 16 }}>
            {(landingStep.first?.options || []).map((o: any) => (
              <div key={String(o.value)} className="option">
                {(o.label && (o.label[langCode] || o.label.en)) || String(o.value)}
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Client bundle for current UMD app to preserve behavior */}
      <div id="root" />
      <Script src="/app.js" strategy="afterInteractive" />
      <Script id="remove-ssr-landing" strategy="afterInteractive">{`
        (function(){
          var el = document.getElementById('ssr-landing');
          if (el && el.parentNode) { el.parentNode.removeChild(el); }
        })();
      `}</Script>
    </>
  );
}


