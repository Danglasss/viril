// Simple helpers for URL params
function getParam(name, defaultValue) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name) || defaultValue;
}
function setParam(name, value) {
  const url = new URL(window.location.href);
  url.searchParams.set(name, String(value));
  window.history.pushState({}, '', url.toString());
}

// Theme provider via React context
const ThemeContext = React.createContext(null);

function useFetch(url) {
  const [state, setState] = React.useState({ data: null, loading: true, error: null });
  React.useEffect(() => {
    let active = true;
    fetch(url)
      .then(r => r.json())
      .then(d => { if (active) setState({ data: d, loading: false, error: null }); })
      .catch(e => { if (active) setState({ data: null, loading: false, error: e }); });
    return () => { active = false; };
  }, [url]);
  return state;
}

// Small registry to map types to components
const registry = {};

function registerComponent(type, comp) { registry[type] = comp; }

function QuestionRenderer({ question, value, onChange, lang }) {
  const Comp = registry[question.type];
  if (!Comp) return React.createElement('div', null, `Unknown type: ${question.type}`);
  return React.createElement(Comp, { question, value, onChange, lang });
}
// expose a helper so Landing can embed first question
window.__renderQuestionElement = (question, value, onChange, lang) => {
  if (!question) return null;
  const Comp = registry[question.type];
  return Comp ? React.createElement(Comp, { question, value, onChange, lang }) : null;
};

function App() {
  const langCode = getParam('lang', 'fr');
  const stepParam = parseInt(getParam('step', '0'), 10);

  const { data: theme } = useFetch('/data/theme.json');
  const { data: langDict } = useFetch('/data/lang.json');
  const { data: test } = useFetch('/data/test.json');

  const [answers, setAnswers] = React.useState({});
  const [results, setResults] = React.useState(null);
  // Keep step in state so UI updates when navigating
  const [step, setStep] = React.useState(Number.isFinite(stepParam) ? stepParam : 0);

  // Sync with browser navigation (back/forward)
  React.useEffect(() => {
    const handler = () => {
      const sp = parseInt(getParam('step', '0'), 10);
      setStep(Number.isFinite(sp) ? sp : 0);
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  React.useEffect(() => {
    try {
      if (window.sbApi) { console.info('[app] ensureSession call'); window.sbApi.ensureSession(); }
    } catch(e) { console.error('[app] ensureSession error', e); }
    if (!theme) return;
    const r = document.documentElement;
    r.style.setProperty('--color-primary', theme.colors.primary);
    r.style.setProperty('--color-secondary', theme.colors.secondary);
    r.style.setProperty('--color-bg', theme.colors.background);
    r.style.setProperty('--color-text', theme.colors.text);
    if (theme.colors.card) r.style.setProperty('--color-card', theme.colors.card);
    if (theme.colors.optionBackground) r.style.setProperty('--color-option-bg', theme.colors.optionBackground);
    if (theme.colors.optionSelected) r.style.setProperty('--color-option-selected', theme.colors.optionSelected);
    if (theme.colors.button) r.style.setProperty('--color-button', theme.colors.button);
    if (theme.colors.buttonText) r.style.setProperty('--color-button-text', theme.colors.buttonText);
    if (theme.colors.emailButton) r.style.setProperty('--color-email-button', theme.colors.emailButton);
    if (theme.colors.emailButtonText) r.style.setProperty('--color-email-button-text', theme.colors.emailButtonText);
    // slider variables
    r.style.setProperty('--slider-track', theme.colors.optionBackground || '#E6E3DC');
    r.style.setProperty('--slider-fill', theme.colors.emailButton || theme.colors.primary || '#80C9AC');
    r.style.setProperty('--slider-thumb', '#FFFFFF');
    r.style.setProperty('--radius', theme.radius + 'px');
    r.style.setProperty('--border', theme.border + 'px');
  }, [theme]);

  // Persist progress even during early loading renders (use step, not derived current)
  React.useEffect(()=>{
    try {
      if (window.sbApi) {
        console.info('[app] saveProgress call', { step });
        Promise.resolve(window.sbApi.saveProgress({ step, answers }))
          .then(function(ok){ console.info('[app] saveProgress result', ok); })
          .catch(function(e){ console.error('[app] saveProgress error', e); });
      }
    } catch(e) { console.error('[app] saveProgress thrown', e); }
  }, [step, answers]);
  if (!theme || !langDict || !test) return React.createElement('div', { className: 'container' }, 'Loading...');

  const t = (k) => (langDict[langCode] && langDict[langCode][k]) || k;

  // Build flow: Landing + remaining questions (excluding first) + Email + Results
  const firstQuestion = test.questions[0];
  const landingStep = {
    id: '__landing',
    type: 'Landing',
    headline: { fr: 'Solution pour éjaculation précoce', en: 'Premature ejaculation solution' },
    subtitle: { fr: 'Passe ce test et recois un plan personnalisé pour ne plus jamais venir trop tôt', en: 'Improve control and confidence in bed' },
    first: firstQuestion
  };
  // Build questions with an explanatory step after partner satisfaction
  const qs = test.questions.slice(1);
  const insertAfterId = 'diag_partner_satisfaction';
  const idxInsert = qs.findIndex(function(q){ return q.id === insertAfterId; });
  const withExplainer = qs.slice();
  if (idxInsert !== -1) {
    withExplainer.splice(idxInsert + 1, 0, {
      id: '__exp_fem_duration',
      type: 'Graphique',
      title: { fr: 'En moyenne, une femme atteint l’orgasme après 14 minutes de stimulation' },
      subtitle: { fr: 'En dessous de 6 minutes, la satisfaction féminine chute fortement.' },
      cta: { fr: 'Je comprends' },
      x: { domain: [1,15], ticks: [1,3,5,10,15] },
      y: { domain: [0,100], ticks: [0,50,100] },
      // Courbe plus lente au début, plateau seulement proche de 15 min
      lines: [ { color: 'var(--slider-fill)', points: [[1,3],[2,5],[3,8],[5,14],[7,25],[9,38],[12,72],[14,90],[15,100]] } ],
      orgasmeX: 14,
      // Repères dynamiques (uniquement le temps de l'utilisateur)
      markers: [
        { x: parseFloat((answers['diag_duration'] === '<1' ? 1 : answers['diag_duration'] === '1-2' ? 2 : answers['diag_duration'] === '3-5' ? 4 : 6) || 0), label: 'Toi', color: '#FFFFFF', bg: 'rgba(255,255,255,.08)' }
      ]
    });
    // Insert "Cycle" component right after frustration question
    const idxFrustration = withExplainer.findIndex(function(q){ return q.id === 'pain_relationship'; });
    if (idxFrustration !== -1) {
      withExplainer.splice(idxFrustration + 1, 0, {
        id: '__cycle_ep',
        type: 'Cycle',
        title: { fr: 'Le cercle vicieux de l’éjaculation précoce' },
        cta: { fr: 'Je comprends' }
      });
    }
  }
  const flow = [
    landingStep,
    ...withExplainer,
    { id: '__email', type: 'Email', text: { [langCode]: (langCode==='fr' ? 'Récupère ton plan personnalisé' : 'Enter your email to get your personalized plan') }, placeholder: (langCode==='fr' ? 'ton@email.com' : 'your@email.com'), cta: (langCode==='fr' ? 'Voir mon plan' : 'See my plan') },
    { id: '__results', type: 'Results', results: results || { top: '', scores: {} }, title: (langCode==='fr' ? 'Ton plan personnalisé' : 'Your personalized plan') }
  ];

  const totalQuestions = test.questions.length;
  const total = flow.length;
  // Allow alternate routing: ?view=plan to jump directly to plan screen (for GTM events)
  const viewParam = getParam('view', '');
  const current = viewParam === 'plan' ? (total - 1) : Math.max(0, Math.min(step, total - 1));

  const q = flow[current];
  const qText = q.text && (q.text[langCode] || q.text['en'] || '');

  const onChange = (v) => setAnswers(a => ({ ...a, [q.id]: v }));
  const goTo = (n) => { setParam('step', n); setStep(n); };

  // expose global next for components that auto-advance
  window.__goNext = () => {
    goTo(Math.min(current + 1, total - 1));
  };

  function computeScores() {
    const counts = {};
    for (const qq of test.questions) {
      const ans = answers[qq.id];
      if (!ans || !qq.options) continue;
      const handleVal = (val) => {
        const opt = (qq.options || []).find(o => o.value === val);
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
  window.__submitEmail = () => {
    const v = answers['__email'];
    const email = v && v.email ? v.email : '';
    const firstName = v && v.firstName ? v.firstName : '';
    const okEmail = /.+@.+\..+/.test(email);
    if (!firstName) { alert(t('enter_first_name')); return; }
    if (!okEmail) { alert(t('invalid_email')); return; }
    const r = computeScores();
    setResults(r);
    // Switch URL to view=plan (remove step) so GTM peut écouter un event clair
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('view', 'plan');
      url.searchParams.delete('step');
      window.history.pushState({}, '', url.toString());
    } catch(_) {}
    setStep(flow.length - 1);
  };

  const isChoice = q.type === 'QCM' || q.type === 'ImageChoice';
  const hideNav = q.type === 'Email' || q.type === 'Landing' || q.type === 'Results' || q.type === 'Graphique' || q.type === 'Cycle';

  function isQuestionType(item) { return item && (item.type === 'QCM' || item.type === 'ImageChoice' || item.type === 'Slider' || item.type === 'Text'); }
  const questionNumber = Math.min(
    totalQuestions,
    Math.max(1, flow.slice(1, current + 1).filter(isQuestionType).length)
  );

  return React.createElement(ThemeContext.Provider, { value: theme },
    React.createElement('div', { className: 'container' },
      q.type !== 'Landing' && q.type !== 'Results' && React.createElement('div', { className: 'topline', style: { alignItems: 'center', gap: 12 } },
        React.createElement('img', { src: theme.logoUrl, alt: 'logo', style: { height: 24 } }),
        React.createElement('div', { style: { flex: 1, height: 6, background: 'var(--slider-track)', borderRadius: 999, overflow: 'hidden' } },
          React.createElement('div', { style: { width: `${(questionNumber / totalQuestions) * 100}%`, height: '100%', background: 'var(--slider-fill)' } })
        ),
        React.createElement('div', { className: 'bubble' }, `${questionNumber}/${totalQuestions}`)
      ),
      React.createElement('div', { className: 'card' },
        (q.type === 'Landing' ? null : React.createElement('h2', null, qText || (q.type === 'Results' ? t('results_title') : ''))),
        React.createElement(QuestionRenderer, { question: q, value: answers[q.id], onChange, lang: langCode }),
        !hideNav && React.createElement('div', { className: 'nav' },
          React.createElement('button', { className: 'btn secondary', onClick: () => goTo(Math.max(0, current - 1)) }, '←'),
          !isChoice && current > 0 && current < 1 + totalQuestions && React.createElement('button', { className: 'btn', onClick: () => goTo(current + 1) }, t('next_question'))
        )
      )
    ),
    q.type === 'Landing' && React.createElement('footer', { style: { position: 'fixed', left: 0, right: 0, bottom: 16, textAlign: 'center', opacity: .7, fontSize: 12 } },
      React.createElement('a', { href: '/terms.html', style: { color: 'inherit', textDecoration: 'none', marginRight: 8 } }, 'Terms'),
      ' · ',
      React.createElement('a', { href: '/privacy.html', style: { color: 'inherit', textDecoration: 'none', margin: '0 8px' } }, 'Privacy'),
      ' · ',
      React.createElement('a', { href: '/cookies.html', style: { color: 'inherit', textDecoration: 'none', marginLeft: 8 } }, 'Cookies')
    )
  );
}

// Register components dynamically by loading scripts and wait for them before rendering
function loadComponent(name) {
  return new Promise(function(resolve){
    const s = document.createElement('script');
    s.src = `/components/${name}.js`;
    s.async = true;
    s.onload = resolve;
    s.onerror = resolve;
    document.body.appendChild(s);
  });
}
const componentsToLoad = ['Landing','QCM','Slider','ImageChoice','Text','Email','Results','Graphique','Cycle'];
function waitForSb(){ return new Promise(function(res){ var t=0; var id=setInterval(function(){ if (window.sbApi || t++>200){ clearInterval(id); res(); } }, 25); }); }
Promise.all(componentsToLoad.map(loadComponent).concat([waitForSb()])).then(function(){
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(React.createElement(App));
});

// Expose API to components to register themselves
window.__registerQuestionComponent = registerComponent; 