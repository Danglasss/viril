(function(){
  function Graphique({ question, lang }) {
    const cfg = question || {};
    const title = (cfg.title && (cfg.title[lang] || cfg.title['fr'] || cfg.title['en'])) || cfg.title || '';
    const ctaText = (cfg.cta && (cfg.cta[lang] || cfg.cta['fr'] || cfg.cta['en'])) || cfg.cta || 'Je comprends';

    const xDomain = (cfg.x && cfg.x.domain) || [1, 15];
    const xTicks = (cfg.x && cfg.x.ticks) || [1,3,5,10,15];
    const yDomain = (cfg.y && cfg.y.domain) || [0, 100];
    const yTicks = (cfg.y && cfg.y.ticks) || [0,50,100];
    const lines = cfg.lines || [
      { color: 'var(--slider-fill)', points: [[1,10],[3,40],[5,60],[10,85],[15,100]] }
    ];
    const orgasmeX = (cfg.orgasmeX != null ? cfg.orgasmeX : 14);
    const subtitle = (cfg.subtitle && (cfg.subtitle[lang] || cfg.subtitle['fr'] || cfg.subtitle['en'])) || cfg.subtitle || 'En dessous de 6 minutes, la satisfaction féminine chute fortement.';

    const [done, setDone] = React.useState(false);
    const [progress, setProgress] = React.useState(0);
    const pathRefs = React.useRef([]);
    const clipIdRef = React.useRef('clip_' + Math.random().toString(36).slice(2));

    React.useEffect(() => {
      const durations = [];
      pathRefs.current.forEach(function(p){
        if (!p) return;
        const len = p.getTotalLength();
        p.style.strokeDasharray = len + ' ' + len;
        p.style.strokeDashoffset = String(len);
        p.getBoundingClientRect();
        p.style.transition = 'stroke-dashoffset 1.8s ease-out';
        p.style.strokeDashoffset = '0';
        durations.push(1850);
      });
      // manual RAF to animate progress for area/labels
      const start = performance.now();
      let raf = 0;
      function tick(now){
        const dt = Math.min(1, (now - start) / 1800);
        setProgress(dt);
        if (dt < 1) raf = requestAnimationFrame(tick); else setDone(true);
      }
      raf = requestAnimationFrame(tick);
      return function(){ if (raf) cancelAnimationFrame(raf); };
    }, []);

    // Layout
    const W = 320, H = 240, LEFT = 28, RIGHT = 48, TOP = 28, BOTTOM = 36;
    const innerW = W - LEFT - RIGHT; const innerH = H - TOP - BOTTOM;
    function nx(v){ return (v - xDomain[0]) / (xDomain[1] - xDomain[0]); }
    function ny(v){ return (v - yDomain[0]) / (yDomain[1] - yDomain[0]); }
    function X(v){ return LEFT + nx(v) * innerW; }
    function Y(v){ return TOP + (1 - ny(v)) * innerH; }

    // Build smooth cubic path (simple Catmull-Rom to Bezier)
    function buildPath(pts){
      if (!pts || pts.length === 0) return '';
      var d = 'M ' + X(pts[0][0]) + ' ' + Y(pts[0][1]);
      for (var i = 0; i < pts.length - 1; i++) {
        var p0 = i > 0 ? pts[i - 1] : pts[i];
        var p1 = pts[i];
        var p2 = pts[i + 1];
        var p3 = i !== pts.length - 2 ? pts[i + 2] : p2;
        var smooth = 0.18; // tuning for gentle curvature
        var cp1x = X(p1[0]) + (X(p2[0]) - X(p0[0])) * smooth;
        var cp1y = Y(p1[1]) + (Y(p2[1]) - Y(p0[1])) * smooth;
        var cp2x = X(p2[0]) - (X(p3[0]) - X(p1[0])) * smooth;
        var cp2y = Y(p2[1]) - (Y(p3[1]) - Y(p1[1])) * smooth;
        d += ' C ' + cp1x + ' ' + cp1y + ', ' + cp2x + ' ' + cp2y + ', ' + X(p2[0]) + ' ' + Y(p2[1]);
      }
      return d;
    }

    // Build area path for a soft fill under main line (first line)
    const mainPoints = (lines[0] && lines[0].points) || [];
    const markers = cfg.markers || [];
    const areaPath = (function(){
      if (!mainPoints.length) return '';
      const start = `M ${X(mainPoints[0][0])} ${TOP + innerH}`;
      const line = ' L ' + mainPoints.map(function(p){ return `${X(p[0])} ${Y(p[1])}`; }).join(' ');
      const end = ` L ${X(mainPoints[mainPoints.length-1][0])} ${TOP + innerH} Z`;
      return start + line + end;
    })();

    // Interpolate Y on the main curve for any minute value
    function yOnCurve(min){
      if (!mainPoints.length) return 0;
      const pts = mainPoints;
      if (min <= pts[0][0]) return pts[0][1];
      for (let i=0; i<pts.length-1; i++) {
        const a = pts[i], b = pts[i+1];
        if (min >= a[0] && min <= b[0]) {
          const t = (min - a[0]) / (b[0] - a[0]);
          return a[1] + t * (b[1] - a[1]);
        }
      }
      return pts[pts.length-1][1];
    }

    return React.createElement('div', null,
      title && React.createElement('h2', { style: { textAlign: 'center', fontWeight: 800, fontFamily: 'Manrope, ui-sans-serif', lineHeight: 1.2, marginBottom: 8 } }, title),
      React.createElement('div', { style: { display: 'flex', justifyContent: 'center', marginTop: 12, marginBottom: 56 } },
        React.createElement('svg', { width: '100%', height: H, viewBox: `0 0 ${W} ${H}` },
          // defs for gradient fill
          React.createElement('defs', null,
            React.createElement('linearGradient', { id: 'areaFill', x1: '0', y1: '0', x2: '0', y2: '1' },
              React.createElement('stop', { offset: '0%', stopColor: 'var(--slider-fill)', stopOpacity: 0.35 }),
              React.createElement('stop', { offset: '100%', stopColor: 'var(--slider-fill)', stopOpacity: 0 })
            ),
            React.createElement('clipPath', { id: clipIdRef.current },
              React.createElement('rect', { x: LEFT, y: TOP, width: Math.max(0.001, innerW * progress), height: innerH })
            )
          ),
          // area under main curve (animated with clip)
          areaPath && React.createElement('path', { d: areaPath, fill: 'url(#areaFill)', stroke: 'none', clipPath: `url(#${clipIdRef.current})` }),
          // lines (split colored section)
          (function(){
            if (!lines.length) return null;
            const main = lines[0];
            const pts = main.points || [];
            if (!pts.length) return null;
            // Draw base line (brand color)
            const dAll = buildPath(pts);
            const elements = [React.createElement('path', { key: 'all', ref: function(el){ pathRefs.current[0]=el; }, d: dAll, fill: 'none', stroke: main.color || 'var(--slider-fill)', strokeWidth: 3, strokeLinecap: 'round' })];
            // Highlight segment from user marker X to orgasmeX in red
            if (markers && markers.length) {
              const ux = Math.max(xDomain[0], Math.min(xDomain[1], markers[0].x));
              const start = Math.min(ux, orgasmeX), end = Math.max(ux, orgasmeX);
              // build a sub-array including interpolated boundary points for smoother segment
              const seg = [];
              seg.push([start, yOnCurve(start)]);
              for (let i=0; i<pts.length; i++) {
                const p = pts[i];
                if (p[0] > start && p[0] < end) seg.push(p);
              }
              seg.push([end, yOnCurve(end)]);
              if (seg.length >= 2) {
                const dSeg = buildPath(seg);
                elements.push(React.createElement('path', { key: 'seg', d: dSeg, fill: 'none', stroke: '#FF3B30', strokeWidth: 4, strokeLinecap: 'round' }));
              }
            }
            return elements;
          })(),
          // end dots for each line
          lines.map(function(l, i){
            if (!l.points || !l.points.length) return null;
            const last = l.points[l.points.length-1];
            return React.createElement('circle', { key: 'c'+i, cx: X(last[0]), cy: Y(last[1]), r: 4, fill: l.color || (i===0? 'var(--slider-fill)' : 'rgba(255,255,255,.95)' ), opacity: progress });
          }),
          // start/end labels for clarity
          (function(){
            if (!mainPoints.length) return null;
            const first = mainPoints[0]; const last = mainPoints[mainPoints.length-1];
            const ox = X(orgasmeX); const oy = Y(yOnCurve(orgasmeX));
            const pillW = 132, pillH = 24, rx = 12;
            return React.createElement(React.Fragment, null,
              // Orgasme pill near the peak
              React.createElement('g', { transform: `translate(${ox - pillW - 6}, ${oy - pillH - 8})`, opacity: progress },
                React.createElement('rect', { x: 0, y: 0, width: pillW, height: pillH, rx: rx, ry: rx, fill: 'var(--slider-fill)' }),
                React.createElement('text', { x: pillW/2, y: pillH/2 + 4, fill: '#0E0E0F', fontSize: 12, fontWeight: 800, textAnchor: 'middle' }, 'Orgasme Féminin'),
                React.createElement('circle', { cx: pillW + 6, cy: pillH + 8, r: 4, fill: 'var(--slider-fill)' })
              ),
              // 0 min label below baseline for visibility
              React.createElement('text', { x: LEFT + 4, y: TOP + innerH + 12, fill: '#FFFFFF', fontSize: 12, fontWeight: 700, textAnchor: 'start', opacity: progress }, '0 min'),
              // 15 min label to the right of the point (plateau)
              React.createElement('text', { x: Math.min(LEFT + innerW - 6, X(15) + 22), y: Y(yOnCurve(15)), fill: '#FFFFFF', fontSize: 12, fontWeight: 700, textAnchor: 'start', dominantBaseline: 'middle', opacity: progress }, '15 min')
            );
          })(),
          // dynamic markers (user score, average, etc.)
          markers.map(function(m, i){
            const xm = Math.max(xDomain[0], Math.min(xDomain[1], m.x));
            const yVal = yOnCurve(xm);
            const cx = X(xm), cy = Y(yVal);
            const show = progress >= nx(xm);
            const pillText = ((m.label || '')).trim();
            const pillW = Math.max(48, Math.min(110, 9 * pillText.length + 16));
            const pillH = 20, rx = 10;
            // centered above the point, compact
            let tx = cx - (pillW/2);
            tx = Math.max(LEFT, Math.min(LEFT + innerW - pillW, tx));
            const ty = Math.max(TOP + 4, Math.min(TOP + innerH - pillH - 4, cy - (pillH + 12)));
            const label = pillText;
            return React.createElement('g', { key: 'mk'+i, opacity: show ? 1 : 0 },
              React.createElement('circle', { cx, cy, r: 4, fill: m.color || '#FFFFFF' }),
              React.createElement('g', { transform: `translate(${tx}, ${ty})` },
                React.createElement('rect', { x: 0, y: 0, width: pillW, height: pillH, rx: rx, ry: rx, fill: m.bg || 'rgba(255,255,255,.08)', stroke: m.color || '#FFFFFF', strokeWidth: 1 }),
                React.createElement('text', { x: pillW/2, y: pillH/2 + 3, fill: m.textColor || '#FFF', fontSize: 11, fontWeight: 700, textAnchor: 'middle' }, label)
              )
            );
          })
        )
      ),
      subtitle && React.createElement('div', { style: { textAlign: 'center', opacity: .85, fontSize: 13, marginTop: -8, marginBottom: 72 } }, subtitle),
      // bottom action bar
      React.createElement('div', { style: { position: 'fixed', left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,.9)', padding: '16px 12px', display: 'flex', justifyContent: 'center' } },
        React.createElement('button', { className: 'btn primary', style: Object.assign({ width: 'min(520px, 92%)' }, done ? {} : { opacity: .5, pointerEvents: 'none' }), onClick: function(){ if (window.__goNext) window.__goNext(); } }, ctaText)
      )
    );
  }

  window.__registerQuestionComponent('Graphique', Graphique);
})();


