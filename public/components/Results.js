// Results: self-contained – loads dict, chooses top with random tie
(function(){
  function Results({ question }) {
    const r = question.results || { top: '', scores: {} };
    const [dict, setDict] = React.useState(null);
    const lang = new URL(location.href).searchParams.get('lang') || 'en';
    React.useEffect(()=>{ fetch('/data/results.json').then(x=>x.json()).then(setDict).catch(()=>setDict({})); },[]);
    const entries = Object.entries(r.scores || {}).sort((a,b)=>b[1]-a[1]);
    const calcTop = () => {
      const pairs = Object.entries(r.scores||{}); if (!pairs.length) return '';
      const max = Math.max(...pairs.map(([,v])=>v));
      const tied = pairs.filter(([,v])=>v===max).map(([k])=>k);
      return tied[Math.floor(Math.random()*tied.length)];
    };
    const topKey = r.top || calcTop();
    if (!dict || !topKey || !dict[topKey]) return React.createElement('div', null, 'Loading results…');
    const top = dict[topKey], common = dict.common || {};
    const t = (obj, def='') => (obj && (obj[lang] || obj.en)) || def;
    const para = (text) => { const blocks = text.indexOf('\n')>=0 ? text.split(/\n\n+/) : (text.match(/[^.!?]+[.!?]+/g) || [text]); const out=[]; for(let i=0;i<blocks.length;i+=3) out.push(blocks.slice(i,i+3).join(' ').trim()); return out.filter(Boolean); };
    const pStyle = { lineHeight: 1.7, margin: '0 0 14px' };
    return React.createElement('div', null,
      t(top.style) && React.createElement('div', { style: { opacity: .7, marginBottom: 6 } }, t(top.style)),
      t(top.title) && React.createElement('h3', { style: { margin: '0 0 8px' } }, t(top.title)),
      t(top.tagline) && React.createElement('p', { style: { fontWeight: 600, margin: '0 0 12px' } }, t(top.tagline)),
      para(t(top.detail, t(top.summary,''))).map((p,i)=>React.createElement('p',{key:i,style:pStyle},p)),
      top.suggestions?.[lang] && React.createElement('div', null,
        React.createElement('h4', { style: { margin: '12px 0 8px' } }, lang==='fr'?'À essayer':'Try this'),
        React.createElement('ul', { style: { margin: '0 0 12px 18px' } }, top.suggestions[lang].map((s,i)=>React.createElement('li',{key:i,style:{margin:'4px 0'}},s)))
      ),
      React.createElement('hr', { style: { margin: '18px 0', opacity: .2 } }),
      React.createElement('div', { style: { fontWeight: 700, marginBottom: 8 } }, lang==='fr'?'Vos scores':'Your scores'),
      React.createElement('ul', { style: { listStyle: 'none', padding: 0, margin: 0 } },
        entries.map(([k,v]) => React.createElement('li', { key: k, style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-card)', borderRadius: 12, padding: '8px 12px', marginBottom: 8 } },
          React.createElement('span', null, k),
          React.createElement('span', { style: { background: 'var(--color-option-selected)', borderRadius: 999, padding: '2px 8px', fontWeight: 700 } }, String(v))
        ))
      ),
      common && React.createElement('div', null,
        React.createElement('hr', { style: { margin: '18px 0', opacity: .2 } }),
        React.createElement('h3', { style: { margin: '0 0 8px' } }, t(common.title)),
        para(t(common.detail,'')).map((p,i)=>React.createElement('p',{key:'c'+i,style:pStyle},p))
      )
    );
  }
  window.__registerQuestionComponent('Results', Results);
})(); 