(function(){
  function Cycle({ question, lang }) {
    const cfg = question || {};
    const title = (cfg.title && (cfg.title[lang] || cfg.title['fr'] || cfg.title['en'])) || cfg.title || 'Le cercle vicieux de l’éjaculation précoce';
    const ctaText = (cfg.cta && (cfg.cta[lang] || cfg.cta['fr'] || cfg.cta['en'])) || cfg.cta || 'Je comprends';

    const [progress, setProgress] = React.useState(0); // 0 → 1 over animation
    const [done, setDone] = React.useState(false);
    const p1 = React.useRef(null), p2 = React.useRef(null), p3 = React.useRef(null);

    React.useEffect(() => {
      const arcs = [p1.current, p2.current, p3.current].filter(Boolean);
      arcs.forEach(function(p,i){
        const len = p.getTotalLength();
        p.style.strokeDasharray = len + ' ' + len;
        p.style.strokeDashoffset = String(len);
        p.getBoundingClientRect();
        p.style.transition = 'stroke-dashoffset 0.7s ease-out ' + (i*0.6) + 's';
        p.style.strokeDashoffset = '0';
      });
      let start = performance.now();
      let raf = 0;
      function tick(now){
        const t = Math.min(1, (now - start)/2000);
        setProgress(t);
        if (t < 1) raf = requestAnimationFrame(tick); else setDone(true);
      }
      raf = requestAnimationFrame(tick);
      return () => raf && cancelAnimationFrame(raf);
    }, []);

    // Layout
    const W = 320, H = 260, CX = 160, CY = 140, R = 80;

    function arcPath(a1, a2){
      const x1 = CX + R * Math.cos(a1), y1 = CY + R * Math.sin(a1);
      const x2 = CX + R * Math.cos(a2), y2 = CY + R * Math.sin(a2);
      const large = (a2 - a1) % (Math.PI*2) > Math.PI ? 1 : 0;
      return `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`;
    }

    // Equidistant label anchors with consistent offset
    const OFFSET = 16;
    const labels = [
      { text: 'Éjaculation précoce', x: CX, y: CY - R - OFFSET, anchor: 'middle' },
      { text: 'Perte de confiance', x: CX + R + OFFSET, y: CY, anchor: 'start' },
      { text: 'Anxiété sexuelle', x: CX, y: CY + R + OFFSET, anchor: 'middle' }
    ];

    return React.createElement('div', null,
      React.createElement('h2', { style: { textAlign: 'center', fontWeight: 800, fontFamily: 'Manrope, ui-sans-serif', lineHeight: 1.2 } }, title),
      React.createElement('div', { style: { display: 'flex', justifyContent: 'center', marginTop: 8, marginBottom: 72 } },
        React.createElement('svg', { width: '100%', height: H, viewBox: `0 0 ${W} ${H}` },
          // Circle base (very faint)
          React.createElement('circle', { cx: CX, cy: CY, r: R, fill: 'url(#none)', stroke: 'rgba(255,255,255,.12)', strokeWidth: 1 }),
          // Arrow heads
          React.createElement('defs', null,
            React.createElement('marker', { id: 'arrowHead', markerWidth: 8, markerHeight: 8, refX: 6, refY: 3.5, orient: 'auto' },
              React.createElement('path', { d: 'M0,0 L0,7 L7,3.5 z', fill: 'var(--slider-fill)' })
            )
          ),
          // Arcs with animation (clockwise) split in three equal arcs to align with labels
          React.createElement('path', { ref: p1, d: arcPath(-Math.PI/2, 0. + Math.PI/6), fill: 'none', stroke: 'var(--slider-fill)', strokeWidth: 3, markerEnd: 'url(#arrowHead)' }),
          React.createElement('path', { ref: p2, d: arcPath(0. + Math.PI/6, Math.PI + Math.PI/6), fill: 'none', stroke: 'var(--slider-fill)', strokeWidth: 3, markerEnd: 'url(#arrowHead)' }),
          React.createElement('path', { ref: p3, d: arcPath(Math.PI + Math.PI/6, 2*Math.PI - 0.01), fill: 'none', stroke: 'var(--slider-fill)', strokeWidth: 3, markerEnd: 'url(#arrowHead)' }),
          // Labels
          labels.map(function(l, i){
            const show = progress > i*0.28;
            return React.createElement('text', { key: i, x: l.x, y: l.y, fill: 'rgba(255,255,255,' + (show?1:0) + ')', fontSize: 14, fontWeight: 700, textAnchor: l.anchor }, l.text);
          })
        )
      ),
      React.createElement('div', { style: { position: 'fixed', left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,.9)', padding: '16px 12px', display: 'flex', justifyContent: 'center' } },
        React.createElement('button', { className: 'btn primary', style: Object.assign({ width: 'min(520px, 92%)' }, done ? {} : { opacity: .5, pointerEvents: 'none' }), onClick: function(){ if (window.__goNext) window.__goNext(); } }, ctaText)
      )
    );
  }

  window.__registerQuestionComponent('Cycle', Cycle);
})();


