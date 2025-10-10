(function(){
  function mapDurationAnswer(ans){
    if (ans === '<1') return 1;
    if (ans === '1-2' || ans === '1_2') return 2;
    if (ans === '3-5' || ans === '3_5') return 4;
    if (ans === '6-10' || ans === '6_10') return 8;
    if (ans === '10-15' || ans === '10_15') return 12;
    if (typeof ans === 'number') return ans;
    return 3;
  }

  function computeProfile(a){
    var hyper=0, hypo=0;
    if (a.hx_sport_core === 'often') hyper++; else if (a.hx_sport_core === 'never') hypo++;
    if (a.hx_ejac_precoce_always === 'yes') hyper++;
    if (a.hx_erection_difficulty === 'yes' || a.hx_erection_difficulty === 'sometimes') hypo++;
    if (a.hx_urine_leak === 'yes') hypo++;
    if (a.hx_post_act_feel === 'fatigue') hyper++; else if (a.hx_post_act_feel === 'relaxed') hypo++;
    if (a.hx_tension_pattern === 'tense') hyper++; else if (a.hx_tension_pattern === 'relaxed') hypo++;
    if (a.hx_penetration_sensation === 'yes') hypo++;
    return hyper >= hypo ? 'hyper' : 'hypo';
  }

  function formatDatePlusDays(days, lang){
    var d = new Date(); d.setDate(d.getDate() + days);
    return d.toLocaleDateString(lang==='fr'?'fr-FR':'en-US', { day:'2-digit', month:'short', year:'numeric' });
  }

  function PlanProjection(){
    var lang = (new URL(location.href)).searchParams.get('lang') || 'fr';
    var answers = (window.__getAnswers && window.__getAnswers()) || {};
    var currentMin = mapDurationAnswer(answers['diag_duration']);
    var goal = parseInt(answers['proj_goal_minutes']||'',10); if (!goal || isNaN(goal)) goal = 15;
    var eta = formatDatePlusDays(28, lang);
    var profile = computeProfile(answers);

    // simple chart dimensions
    var W = 300, H = 160, LEFT = 24, RIGHT = 24, TOP = 16, BOTTOM = 28;
    var innerW = W-LEFT-RIGHT, innerH = H-TOP-BOTTOM;
    function X(t){ return LEFT + t*innerW; }
    function Y(v){
      // map minutes to vertical: higher minutes at top for "progress up"
      var minV = Math.min(currentMin, goal)-1; if (minV<0) minV=0;
      var maxV = Math.max(currentMin, goal)+2;
      var ny = (v-minV)/(maxV-minV);
      return TOP + (1-ny)*innerH;
    }
    // smooth multi-segment curve (slow start → slight plateau → rise to goal)
    function buildPath(points){
      if (!points || points.length===0) return '';
      var d='M '+X(points[0][0])+' '+Y(points[0][1]);
      for (var i=0;i<points.length-1;i++){
        var p0 = i>0?points[i-1]:points[i];
        var p1 = points[i];
        var p2 = points[i+1];
        var p3 = i!==points.length-2?points[i+2]:p2;
        var s = 0.2; // smoothness
        var cp1x = X(p1[0]) + (X(p2[0]) - X(p0[0])) * s;
        var cp1y = Y(p1[1]) + (Y(p2[1]) - Y(p0[1])) * s;
        var cp2x = X(p2[0]) - (X(p3[0]) - X(p1[0])) * s;
        var cp2y = Y(p2[1]) - (Y(p3[1]) - Y(p1[1])) * s;
        d += ' C '+cp1x+' '+cp1y+', '+cp2x+' '+cp2y+', '+X(p2[0])+' '+Y(p2[1]);
      }
      return d;
    }
    var dPath = (function(){
      var dy = goal - currentMin;
      var pts = [
        [0.05, currentMin],
        [0.25, currentMin + dy*0.15], // démarrage lent
        [0.60, currentMin + dy*0.35], // montée progressive
        [0.75, currentMin + dy*0.40], // léger plateau
        [0.95, goal] // arrivée
      ];
      return buildPath(pts);
    })();

    var title = (lang==='fr'
      ? 'D’après nos calculs, tu atteindras ton objectif de tenir '+goal+' min \uD83C\uDF89 d’ici'
      : 'According to our estimate, you will reach your goal of '+goal+' min \uD83C\uDF89 by');
    var dateLabel = eta;

    return React.createElement(React.Fragment, null,
      React.createElement('div', { className:'card' },
        React.createElement('h2', { style:{ textAlign:'center', marginBottom:4 } }, title),
        React.createElement('div', { style:{ textAlign:'center' } },
          React.createElement('span', { style:{ fontWeight:800, borderBottom:'3px solid var(--slider-fill)', padding:'0 6px', display:'inline-block' } }, dateLabel)
        ),
        React.createElement('div', { style:{ display:'flex', justifyContent:'center' } },
          React.createElement('svg', { width: W, height: H, viewBox: '0 0 '+W+' '+H },
            // grid dotted
            React.createElement('g', { stroke: 'rgba(255,255,255,.15)' },
              React.createElement('line', { x1:LEFT, y1:TOP, x2:LEFT, y2:TOP+innerH }),
              [0.25,0.5,0.75].map(function(t,i){ return React.createElement('line', { key:i, x1:LEFT, y1:TOP+innerH*t, x2:LEFT+innerW, y2:TOP+innerH*t, strokeDasharray:'3 5' }); })
            ),
            // path
            React.createElement('path', { d: dPath, fill:'none', stroke:'var(--slider-fill)', strokeWidth:4, strokeLinecap:'round', strokeLinejoin:'round' }),
            // start & end points with labels
            React.createElement('circle', { cx:X(0.05), cy:Y(currentMin), r:7, fill:'transparent', stroke:'var(--slider-fill)', strokeWidth:2 }),
            // start pill
            React.createElement('g', { transform:'translate('+(X(0.05)-18)+','+(Y(currentMin)-26)+')' },
              React.createElement('rect', { width:50, height:18, rx:6, ry:6, fill:'rgba(255,255,255,.08)' }),
              React.createElement('text', { x:25, y:12, fontSize:11, fill:'#fff', textAnchor:'middle' }, (lang==='fr'?'Aujourd’hui: ':'Today: ')+currentMin+' min')
            ),
            React.createElement('circle', { cx:X(0.95), cy:Y(goal), r:7, fill:'var(--slider-fill)' }),
            // goal pill
            React.createElement('g', { transform:'translate('+(X(0.95)-20)+','+(Y(goal)+6)+')' },
              React.createElement('rect', { width:56, height:18, rx:6, ry:6, fill:'rgba(255,255,255,.08)' }),
              React.createElement('text', { x:28, y:12, fontSize:11, fill:'#fff', textAnchor:'middle' }, goal+' min \uD83C\uDF89')
            )
          )
        )
      ),
      React.createElement('div', { style:{ position:'fixed', left:0, right:0, bottom:16, textAlign:'center' } },
        React.createElement('button', { className:'btn primary', onClick:function(){ if (window.__goNext) window.__goNext(); } }, (lang==='fr'?'Continuer':'Continue'))
      )
    );
  }

  window.__registerQuestionComponent('PlanProjection', PlanProjection);
})();


