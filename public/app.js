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
  const withExplainer = qs.slice();
  // Insert Graphique right after partner satisfaction question (content from test.json)
  (function(){
    const idxPartner = withExplainer.findIndex(function(q){ return q && q.id === 'diag_partner_satisfaction'; });
    const already = withExplainer.some(function(s){ return s && s.id === '__exp_fem_duration'; });
    if (idxPartner !== -1 && !already) {
      // find the Graphique config from test data
      const g = test.questions.find(function(q){ return q && q.id === '__exp_fem_duration'; });
      if (g) {
        // enrich with dynamic marker from prior answer
        const xFrom = g.dynamicMarkerFrom || 'diag_duration';
        const ans = (answers && answers[xFrom]) || null;
        // map buckets to conservative minimum values
        let val = 0;
        if (ans === '<1') val = 0;
        else if (ans === '1-2') val = 1;
        else if (ans === '3-5') val = 3;
        else if (ans === '5+' || ans === '6-10') val = 5;
        else if (typeof ans === 'number') val = ans;
        const merged = Object.assign({}, g, { markers: [{ x: val, label: 'Ton temps', color: '#FFFFFF', bg: 'rgba(255,255,255,.08)' }] });
        withExplainer.splice(idxPartner + 1, 0, merged);
      }
    }
    // Always refresh the dynamic marker on the existing Graphique slide
    const idxGraph = withExplainer.findIndex(function(q){ return q && q.id === '__exp_fem_duration'; });
    if (idxGraph !== -1) {
      const g = withExplainer[idxGraph];
      const xFrom = (g && g.dynamicMarkerFrom) || 'diag_duration';
      const ans = (answers && answers[xFrom]) || null;
      let val = 0;
      if (ans === '<1') val = 0;
      else if (ans === '1-2') val = 1;
      else if (ans === '3-5') val = 3;
      else if (ans === '5+' || ans === '6-10') val = 5;
      else if (typeof ans === 'number') val = ans;
      withExplainer[idxGraph] = Object.assign({}, g, { markers: [{ x: val, label: 'Ton temps', color: '#FFFFFF', bg: 'rgba(255,255,255,.08)' }] });
    }
  })();
  // Ensure AnalyzeResults is placed just before Email step
  if (!withExplainer.some(function(s){ return s && s.id === '__analyze'; })) {
    withExplainer.push({ id: '__analyze', type: 'AnalyzeResults' });
  }
  // Move engagement question just after AnalyzeResults and before Email
  (function(){
    let engIdx = withExplainer.findIndex(function(q){ return q && q.id === 'eng_try_program'; });
    let eng = null;
    if (engIdx !== -1) { eng = withExplainer.splice(engIdx, 1)[0]; }
    if (!eng) { eng = test.questions.find(function(q){ return q && q.id === 'eng_try_program'; }); }
    const idxAnalyze = withExplainer.findIndex(function(q){ return q && q.id === '__analyze'; });
    if (eng) {
      const insertPos = (idxAnalyze !== -1 ? idxAnalyze + 1 : withExplainer.length);
      withExplainer.splice(insertPos, 0, eng);
    }
  })();
  const flow = [
    landingStep,
    ...withExplainer,
    { id: '__email', type: 'Email', text: { [langCode]: (langCode==='fr' ? 'Récupère ton plan personnalisé' : 'Enter your email to get your personalized plan') }, placeholder: (langCode==='fr' ? 'ton@email.com' : 'your@email.com'), cta: (langCode==='fr' ? 'Voir mon plan' : 'See my plan') },
    { id: '__results', type: 'Results', results: results || { top: '', scores: {} }, title: (langCode==='fr' ? 'Ton plan personnalisé' : 'Your personalized plan') }
  ];

  const totalQuestions = (test.questions || []).filter(function(it){
    return it && (it.type === 'QCM' || it.type === 'ImageChoice' || it.type === 'Slider' || it.type === 'Text');
  }).length;
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
  const hideNav = q.type === 'Email' || q.type === 'Landing' || q.type === 'Results' || q.type === 'Graphique' || q.type === 'Cycle' || q.type === 'InfoSlide' || q.type === 'PerineeDiag' || q.type === 'EightOfTen' || q.type === 'PlanProjection' || q.type === 'Benefits' || q.type === 'AnalyzeResults';

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
const componentsToLoad = ['Landing','QCM','Slider','ImageChoice','Text','Email','Results','Graphique','AnalyzeResults','InfoSlide','PerineeDiag','EightOfTen','PlanProjection','Benefits'];
function waitForSb(){ return new Promise(function(res){ var t=0; var id=setInterval(function(){ if (window.sbApi || t++>200){ clearInterval(id); res(); } }, 25); }); }
Promise.all(componentsToLoad.map(loadComponent).concat([waitForSb()])).then(function(){
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(React.createElement(App));
});

// Expose API to components to register themselves
window.__registerQuestionComponent = registerComponent; 