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
  const quizVersionParam = getParam('version', 'v_viril');

  const { data: theme } = useFetch('/data/theme.json');
  const { data: langDict } = useFetch('/data/lang.json');
  const { data: test } = useFetch(`/data/quizzes/${quizVersionParam}.json`);

  // Restore answers from localStorage on load
  const [answers, setAnswers] = React.useState(() => {
    try {
      const stored = localStorage.getItem('viril_answers');
      return stored ? JSON.parse(stored) : {};
    } catch (_) { return {}; }
  });
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

  // ⭐ PROTECTION: S'assurer que ensureSession n'est appelé qu'UNE SEULE FOIS au montage
  const sessionInitRef = React.useRef(false);
  React.useEffect(() => {
    // Guard: si déjà initialisé, ne rien faire
    if (sessionInitRef.current) return;
    sessionInitRef.current = true;

    try {
      if (window.sbApi) {
        console.info('[app] ensureSession call (once)');
        Promise.resolve(window.sbApi.ensureSession())
          .then(function () { console.info('[app] session ready'); })
          .catch(function (e) { console.error('[app] ensureSession error', e); });
      }
    } catch (e) { console.error('[app] ensureSession error', e); }
  }, []); // ⭐ Dépendances vides = exécution UNE SEULE fois au montage

  React.useEffect(() => {
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
  React.useEffect(() => {
    try {
      if (window.sbApi) {
        console.info('[app] saveProgress call', { step });
        Promise.resolve(window.sbApi.saveProgress({ step, answers }))
          .then(function (ok) { console.info('[app] saveProgress result', ok); })
          .catch(function (e) { console.error('[app] saveProgress error', e); });
      }
    } catch (e) { console.error('[app] saveProgress thrown', e); }
  }, [step, answers]);

  // Auto-sync profile fields from quiz answers (fire-and-forget, never blocks UI)
  React.useEffect(() => {
    try {
      if (window.profileSync && Object.keys(answers).length > 0) {
        window.profileSync.syncAnswers(answers);
      }
    } catch (e) { console.error('[app] profileSync thrown', e); }
  }, [answers]);
  // Persist answers locally for client-side personalization and resilience on back/refresh
  React.useEffect(() => {
    try {
      localStorage.setItem('viril_answers', JSON.stringify(answers || {}));
      const a = answers || {};
      const emailData = (a['__email'] && typeof a['__email'] === 'object') ? a['__email'] : {};
      const personalization = {
        firstName: emailData.firstName || '',
        email: emailData.email || '',
        diag_duration: a['diag_duration'] || null,
        proj_target_duration: a['proj_target_duration'] || null,
        proj_main_reason: a['proj_main_reason'] || null,
        demo_status: a['demo_status'] || null,
        lang: langCode || 'fr',
        updatedAt: Date.now()
      };
      localStorage.setItem('viril_personalization', JSON.stringify(personalization));
      try { if (typeof window !== 'undefined') { window.__getPersonalization = function () { return personalization; }; } } catch (_) { }
    } catch (_) { }
  }, [answers, langCode]);
  // Restore answers from localStorage on first mount (if any)
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('viril_answers');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          setAnswers(parsed);
        }
      }
    } catch (_) { }
  }, []);
  if (!theme || !langDict || !test) return React.createElement('div', { className: 'container' }, 'Loading...');

  // Ensure quiz version from test.json is propagated to Supabase writes
  const quizVersion = (test && (test.version || test.quiz_version)) || (typeof window !== 'undefined' && window.__QUIZ_VERSION) || 'A';
  try {
    if (typeof window !== 'undefined') {
      window.__QUIZ_VERSION = quizVersion;
      // Expose current language to consumers that need localized labels
      window.__LANG_CODE = langCode;
      window.dataLayer = window.dataLayer || [];
      // push once per load
      if (!(window.__QV_Pushed)) { window.dataLayer.push({ event: 'quiz_version', quiz_version: quizVersion }); window.__QV_Pushed = true; }
      // Expose specific question options for localized mapping (e.g., proj_main_reason → profiles.goal)
      try {
        window.__QUIZ_OPTIONS = window.__QUIZ_OPTIONS || {};
        const reasonQ = (test && Array.isArray(test.questions)) ? test.questions.find(function (q) { return q && q.id === 'proj_main_reason'; }) : null;
        if (reasonQ && Array.isArray(reasonQ.options)) {
          window.__QUIZ_OPTIONS['proj_main_reason'] = reasonQ.options;
        }
      } catch (_) { }
    }
  } catch (_) { }

  const t = (k) => (langDict[langCode] && langDict[langCode][k]) || k;

  // Build flow: Landing + remaining questions (excluding first) + Email + Results
  const firstQuestion = test.questions[0];
  const landingStep = {
    id: '__landing',
    type: 'Landing',
    headline: { fr: 'Vaincre ton éjaculation précoce', en: 'Overcome premature ejaculation' },
    subtitle: { fr: 'Réponds à ce test rapide pour recevoir ton plan personnalisé', en: 'Take this quick test to receive your personalized plan' },
    privacy: { fr: 'ℹ️ Toutes les données de ce test sont anonymes', en: 'ℹ️ All data from this test is anonymous' },
    first: firstQuestion
  };
  // Build questions with an explanatory step after partner satisfaction
  const qs = test.questions.slice(1);
  const withExplainer = qs.slice();
  // Insert Graphique right after partner satisfaction question (content from test.json)
  (function () {
    const idxPartner = withExplainer.findIndex(function (q) { return q && q.id === 'diag_partner_satisfaction'; });
    const already = withExplainer.some(function (s) { return s && s.id === '__exp_fem_duration'; });
    if (idxPartner !== -1 && !already) {
      // find the Graphique config from test data
      const g = test.questions.find(function (q) { return q && q.id === '__exp_fem_duration'; });
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
    const idxGraph = withExplainer.findIndex(function (q) { return q && q.id === '__exp_fem_duration'; });
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
  if (!withExplainer.some(function (s) { return s && s.id === '__analyze'; })) {
    withExplainer.push({ id: '__analyze', type: 'AnalyzeResults' });
  }
  // Move engagement question just after AnalyzeResults and before Email
  (function () {
    let engIdx = withExplainer.findIndex(function (q) { return q && q.id === 'eng_try_program'; });
    let eng = null;
    if (engIdx !== -1) { eng = withExplainer.splice(engIdx, 1)[0]; }
    if (!eng) { eng = test.questions.find(function (q) { return q && q.id === 'eng_try_program'; }); }
    const idxAnalyze = withExplainer.findIndex(function (q) { return q && q.id === '__analyze'; });
    if (eng) {
      const insertPos = (idxAnalyze !== -1 ? idxAnalyze + 1 : withExplainer.length);
      withExplainer.splice(insertPos, 0, eng);
    }
  })();
  // Decide which landing page variant (LP) to use for the sale screen
  const lpParam = getParam('lp', 'new'); // default to new (sales_page.js)
  let saleType = (lpParam === 'emotion') ? 'lp_emotion' : (lpParam === 'new') ? 'lp_new' : 'lp_science';
  // Allow explicit override via view param before building the flow
  const normalizeViewEarly = (v) => (v === 'p_science' ? 'lp_science' : (v === 'p_emotion' ? 'lp_emotion' : (v === 'p_new' ? 'lp_new' : v)));
  const viewParam = normalizeViewEarly(getParam('view', ''));
  if (viewParam === 'lp_emotion' || viewParam === 'lp_science' || viewParam === 'lp_new') {
    saleType = viewParam;
  }

  const goalDuration = (answers && answers['goal_duration']) ? answers['goal_duration'] : '';
  const resultTitleFr = goalDuration ? `Ton plan personnalisé pour tenir ${goalDuration} minutes` : 'Ton plan personnalisé';
  const resultTitleEn = goalDuration ? `Your personalized plan to last ${goalDuration} minutes` : 'Your personalized plan';

  const flow = [
    landingStep,
    ...withExplainer,
    { id: '__email', type: 'Email', text: { placeholder: (langCode === 'fr' ? 'ton@email.com' : 'your@email.com'), cta: (langCode === 'fr' ? 'OBTENIR MON PLAN' : 'GET MY PLAN') } },
    // { id: '__results', type: 'Results', results: results || { top: '', scores: {} }, title: (langCode === 'fr' ? resultTitleFr : resultTitleEn) },
    { id: '__sale', type: saleType }
  ];

  const totalQuestions = flow.filter(function (it) {
    return it && (it.type === 'QCM' || it.type === 'ImageChoice' || it.type === 'Slider' || it.type === 'Text' || it.type === 'Rating');
  }).length;
  const total = flow.length;
  // Allow alternate routing: ?view=plan to jump directly to plan screen (for GTM events)
  const saleView = (viewParam === 'sale' || viewParam === 'sale_violent' || viewParam === 'lp_emotion' || viewParam === 'lp_science' || viewParam === 'lp_new');
  const current = saleView ? (flow.findIndex(i => i.type === saleType) !== -1 ? flow.findIndex(i => i.type === saleType) : (total - 1))
    : (viewParam === 'plan' ? (total - 1) : Math.max(0, Math.min(step, total - 1)));

  const q = flow[current];
  const qText = q.text && (q.text[langCode] || q.text['en'] || '');

  const onChange = (v) => setAnswers(a => ({ ...a, [q.id]: v }));
  // expose answers getter for components needing dynamic copy
  try { if (typeof window !== 'undefined') { window.__getAnswers = function () { return answers; }; } } catch (_) { }
  // expose setter for Landing to save under real question ID (demo_age) not __landing
  try { if (typeof window !== 'undefined') { window.__setAnswer = function (id, val) { setAnswers(a => ({ ...a, [id]: val })); }; } } catch (_) { }
  const goTo = (n) => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('view');
      url.searchParams.set('step', String(n));
      window.history.pushState({}, '', url.toString());
    } catch (_) {
      setParam('step', n);
    }
    setStep(n);
  };

  // expose global next for components that auto-advance
  window.__goNext = () => {
    try { window.dataLayer = window.dataLayer || []; window.dataLayer.push({ event: 'quiz_step', step: Math.min(current + 1, total - 1) }); } catch (_) { }
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
    Object.entries(counts).forEach(([k, v]) => { if (v > max) { max = v; top = k; } });
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
    } catch (_) { }
    setStep(flow.length - 1);
  };

  const isChoice = q.type === 'QCM' || q.type === 'ImageChoice';
  const hideNav = q.type === 'Email' || q.type === 'Landing' || q.type === 'Results' || q.type === 'Graphique' || q.type === 'Cycle' || q.type === 'InfoSlide' || q.type === 'PerineeDiag' || q.type === 'EightOfTen' || q.type === 'PlanProjection' || q.type === 'Benefits' || q.type === 'AnalyzeResults' || q.type === 'lp_emotion' || q.type === 'lp_science' || q.type === 'lp_new';

  function isQuestionType(item) { return item && (item.type === 'QCM' || item.type === 'ImageChoice' || item.type === 'Slider' || item.type === 'Text'); }
  const questionNumber = Math.min(
    totalQuestions,
    Math.max(1, flow.slice(1, current + 1).filter(isQuestionType).length)
  );

  return React.createElement(ThemeContext.Provider, { value: theme },
    React.createElement('div', { className: 'container' },
      q.type !== 'Landing' && q.type !== 'Results' && q.type !== 'lp_emotion' && q.type !== 'lp_science' && q.type !== 'lp_new' && React.createElement('div', { className: 'header' },
        React.createElement('img', { src: theme.logoUrl, alt: 'logo', className: 'logo' }),
        q.type !== 'Email' && React.createElement('div', { className: 'progress-row' },
          current >= 1 && React.createElement('button', { className: 'back-btn', onClick: () => goTo(Math.max(0, current - 1)) }, '‹'),
          React.createElement('div', { className: 'progress-bar' },
            React.createElement('div', { className: 'progress-fill', style: { width: `${(questionNumber / totalQuestions) * 100}%` } })
          ),
          React.createElement('div', { className: 'progress-text' }, `${questionNumber}/${totalQuestions}`)
        )
      ),
      ((q.type === 'Landing' || q.type === 'Results' || q.type === 'Email' || q.type === 'InfoSlide' || q.type === 'StudyFact' || q.type === 'EightOfTen' || q.type === 'UserSurvey' || q.type === 'ComparisonTable' || q.type === 'BenefitsList' || q.type === 'PlanProjection' || q.type === 'Benefits' || q.type === 'PerineeDiag') ? null : React.createElement('h1', { className: 'question-headline' }, qText || '')),
      React.createElement(QuestionRenderer, { question: q, value: answers[q.id], onChange, lang: langCode })
    ),
    q.type === 'Landing' && React.createElement('footer', { className: 'footer-links' },
      React.createElement('a', { href: '/terms.html' }, 'Terms'),
      ' · ',
      React.createElement('a', { href: '/privacy.html' }, 'Privacy'),
      ' · ',
      React.createElement('a', { href: '/cookies.html' }, 'Cookies')
    )
  );
}

// Register components dynamically by loading scripts and wait for them before rendering
function loadComponent(name) {
  return new Promise(function (resolve) {
    const s = document.createElement('script');
    s.src = `/components/${name}.js`;
    s.async = true;
    s.onload = resolve;
    s.onerror = resolve;
    document.body.appendChild(s);
  });
}
const baseComponents = ['StickyFooterButton', 'TrustpilotReview', 'Landing', 'QCM', 'Slider', 'ImageChoice', 'Text', 'Email', 'Results', 'Graphique', 'AnalyzeResults', 'InfoSlide', 'PerineeDiag', 'EightOfTen', 'PlanProjection', 'Benefits', 'StudyFact', 'Rating', 'UserSurvey', 'ComparisonTable', 'Consent', 'BenefitsList', 'ProjectionGraph', 'ImprovementGraph', 'BenchmarkGraph'];
const urlParams = new URL(window.location.href).searchParams;
const viewRaw = urlParams.get('view') || '';
const view = (viewRaw === 'p_science' ? 'lp_science' : (viewRaw === 'p_emotion' ? 'lp_emotion' : viewRaw));
const lp = urlParams.get('lp') || (window.location.pathname.indexOf('/emotion') !== -1 ? 'emotion' : (window.location.pathname.indexOf('/science') !== -1 ? 'science' : 'science'));
// Keep file names as original for now, but components register as lp_emotion/lp_science/lp_new
let saleScript = (lp === 'emotion') ? 'ResultsSale_violent' : (lp === 'new') ? 'sales_page' : 'ResultsSale';
if (view === 'lp_emotion') saleScript = 'ResultsSale_violent';
if (view === 'lp_science') saleScript = 'ResultsSale';
if (view === 'lp_new') saleScript = 'sales_page';
const componentsToLoad = baseComponents.concat([saleScript]);
function waitForSb() { return new Promise(function (res) { var t = 0; var id = setInterval(function () { if (window.sbApi || t++ > 200) { clearInterval(id); res(); } }, 25); }); }
Promise.all(componentsToLoad.map(loadComponent).concat([waitForSb()])).then(function () {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(React.createElement(App));
});

// Expose API to components to register themselves
window.__registerQuestionComponent = registerComponent; 