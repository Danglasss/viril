(function(){
  function Bar({ label, value, color }){
    const scale = Math.max(0, Math.min(1, value/100));
    return React.createElement('div', { style: { margin: '12px 0' } },
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 12, opacity: .9 } },
        React.createElement('span', null, label),
        React.createElement('span', null, Math.round(value)+'%')
      ),
      React.createElement('div', { style: { height: 8, background: 'rgba(255,255,255,.12)', borderRadius: 999, overflow: 'hidden', marginTop: 6 } },
        React.createElement('div', { style: { width: '100%', height: '100%', background: color || 'var(--slider-fill)', transformOrigin: '0 50%', transform: `scaleX(${scale})`, transition: 'transform 300ms linear', willChange: 'transform' } })
      )
    );
  }

  function Stars(){
    const box = (i)=>React.createElement('div', { key:i, style:{width:16, height:16, background:'#00B67A', borderRadius:2, display:'flex', alignItems:'center', justifyContent:'center', marginRight:3}},
      React.createElement('svg', { width:10, height:10, viewBox:'0 0 24 24' },
        React.createElement('path', { fill:'#FFFFFF', d:'M12 17.3l-6.2 3.7 1.6-7-5.4-4.7 7.1-.6L12 2l2.9 6.7 7.1.6-5.4 4.7 1.6 7z'}))
    );
    return React.createElement('div', { style:{display:'flex'}}, [0,1,2,3,4].map(box));
  }

  function Review({ title, text, name }){
    return React.createElement('div', { style: { background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 12, padding: 12 } },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 } },
        React.createElement(Stars),
        React.createElement('span', { style: { fontWeight: 700, fontSize: 12, opacity: .9 } }, 'Trustpilot'),
        React.createElement('span', { style: { opacity: .6, fontSize: 12 } }, '• '+name)
      ),
      React.createElement('div', { style: { fontWeight: 700, marginBottom: 4 } }, title),
      React.createElement('div', { style: { fontSize: 13, lineHeight: 1.5 } }, text)
    );
  }

  function AnalyzeResults(){
    const lang = (new URL(location.href)).searchParams.get('lang') || 'fr';
    const t = (fr,en) => (lang==='fr'?fr:en);
    const labels = [
      t('Indicateurs intimes','Intimate health indicators'),
      t('Comportements sexuels','Sexual behaviours'),
      t('Style de vie','Lifestyle'),
      t('Création de ton plan','Creating your plan')
    ];
    const [vals, setVals] = React.useState([0,0,0,0]);
    const [idx, setIdx] = React.useState(0);
    const [barColor, setBarColor] = React.useState('#FF6A3D');
    React.useEffect(()=>{
      try {
        const cs = getComputedStyle(document.documentElement);
        const v = cs.getPropertyValue('--slider-fill').trim();
        if (v) setBarColor(v);
      } catch(_) {}
    }, []);
    React.useEffect(()=>{
      let t0 = performance.now();
      let acc = 0; // elapsed visible time in ms (only when tab visible)
      const dur = 3500; // 3.5s per bar
      let raf = 0;
      function step(ts){
        const dt = ts - t0; t0 = ts; if (!document.hidden) acc += dt;
        const p = Math.min(1, acc/dur);
        setVals(prev => prev.map((v,i)=> i < idx ? 100 : (i===idx ? p*100 : v)));
        if (p >= 1) {
          if (idx < labels.length - 1) {
            setIdx(i=>i+1); acc = 0; t0 = ts; // next bar
            raf = requestAnimationFrame(step);
          } else {
            setVals(prev => prev.map(()=>100));
            setTimeout(function(){ if (window.__goNext) window.__goNext(); }, 300);
          }
          return;
        }
        raf = requestAnimationFrame(step);
      }
      raf = requestAnimationFrame(step);
      return ()=>cancelAnimationFrame(raf);
    }, [idx]);

    return React.createElement('div', null,
      React.createElement('h2', null, t('Analyse de tes réponses…', 'Analyzing your answers…')),
      labels.map(function(l,i){ return React.createElement(Bar, { key:i, label:l, value: vals[i], color: barColor }); }),
      React.createElement('div', { style: { height: 12 } }),
      React.createElement(Review, { name: 'Marc', title: t('Des résultats concrets','Real results'), text: t("J’avais un vrai problème d’éjaculation trop rapide. En suivant le plan pas à pas, j’ai gagné du contrôle en quelques semaines.", 'I struggled with premature ejaculation. Following the plan step by step, I gained control in a few weeks.') })
    );
  }

  window.__registerQuestionComponent('AnalyzeResults', AnalyzeResults);
})();


