(function(){
  function computeProfile(a){
    var hyper=0, hypo=0;
    // hx_sport_core: often -> hyper, never -> hypo
    if (a.hx_sport_core === 'often') hyper++; else if (a.hx_sport_core === 'never') hypo++;
    // hx_ejac_precoce_always: yes -> hyper (souvent depuis l’adolescence)
    if (a.hx_ejac_precoce_always === 'yes') hyper++;
    // hx_erection_difficulty: yes/sometimes -> hypo
    if (a.hx_erection_difficulty === 'yes' || a.hx_erection_difficulty === 'sometimes') hypo++;
    // hx_urine_leak: yes -> hypo
    if (a.hx_urine_leak === 'yes') hypo++;
    // hx_post_act_feel: fatigue -> hyper, relaxed -> hypo
    if (a.hx_post_act_feel === 'fatigue') hyper++; else if (a.hx_post_act_feel === 'relaxed') hypo++;
    // hx_tension_pattern: tense -> hyper, relaxed -> hypo
    if (a.hx_tension_pattern === 'tense') hyper++; else if (a.hx_tension_pattern === 'relaxed') hypo++;
    // hx_penetration_sensation: yes -> hypo
    if (a.hx_penetration_sensation === 'yes') hypo++;
    return hyper >= hypo ? 'hyper' : 'hypo';
  }

  function PerineeDiag(){
    var answers = (window.__getAnswers && window.__getAnswers()) || {};
    var lang = (new URL(location.href)).searchParams.get('lang') || 'fr';
    var profile = computeProfile(answers);
    var isFr = lang === 'fr';
    var title = isFr ? (profile==='hyper' ? 'TON PÉRINÉE EST HYPERTONIQUE' : 'TON PÉRINÉE EST HYPOTONIQUE')
                     : (profile==='hyper' ? 'YOUR PERINEUM IS HYPERTONIC' : 'YOUR PERINEUM IS HYPOTONIC');
    var p1 = isFr ? (profile==='hyper'
      ? 'Ton périnée est en sur‑tension (contracté) au repos.'
      : 'Ton périnée manque de tonicité et de force.')
      : (profile==='hyper' ? 'Your pelvic floor is over‑tense at rest.' : 'Your pelvic floor lacks tone and strength.');
    var p2 = isFr ? (profile==='hyper'
      ? 'Mécanisme : cette tension constante rend le muscle hypersensible. Il déclenche des réflexes éjaculatoires à la moindre stimulation.'
      : 'Mécanisme : sans tonus suffisant, le périnée ne peut pas freiner la montée de l’excitation. L’éjaculation survient de manière incontrôlée.')
      : (profile==='hyper' ? 'Mechanism: constant tension makes the muscle hypersensitive; it triggers ejaculation reflex with minimal stimulation.'
        : 'Mechanism: without baseline tone, the muscle cannot brake arousal; ejaculation occurs uncontrollably.');
    var p3 = isFr ? (profile==='hyper'
      ? 'Souvent présent depuis l’adolescence.'
      : '')
      : (profile==='hyper' ? 'Often present since adolescence. Avoid Kegels/strength work for now.' : '');

    const warning = (profile==='hyper') ? (isFr ? {
      title: "Ne pas faire d’exercices de Kegel",
      body: "Quand le périnée est hypertonique, le renforcement peut empirer l’hypersensibilité et déclencher des éjaculations précoces."
    } : {
      title: "Do not perform Kegel exercises",
      body: "With a hypertonic pelvic floor, strengthening can worsen hypersensitivity and trigger premature ejaculation."
    }) : null;

    return React.createElement(React.Fragment, null,
      React.createElement('div', { className:'card' },
        React.createElement('h2', { style:{ textAlign:'center' } }, title),
        React.createElement('p', { style:{ marginTop:-6, textAlign:'center', opacity:.85 } }, p1),
        React.createElement('p', { style:{ marginTop:6 } }, p2),
        p3 && React.createElement('p', { style:{ marginTop:6, opacity:.9 } }, p3),
        warning && React.createElement('div', { style:{ marginTop:12, background:'#B01217', padding:'10px 12px', color:'#FFF', border:'none', borderRadius:0 } },
          React.createElement('div', { style:{ display:'flex', alignItems:'flex-start', gap:10 } },
            React.createElement('div', { style:{ width:22, height:22, background:'#D84C53', display:'flex', alignItems:'center', justifyContent:'center' } },
              React.createElement('svg', { width:14, height:14, viewBox:'0 0 24 24', fill:'white' },
                React.createElement('path', { d:'M1 21h22L12 2 1 21zm12-3h-2v2h2v-2zm0-8h-2v6h2V10z' })
              )
            ),
            React.createElement('div', { style:{ flex:1 } },
              React.createElement('div', { style:{ fontWeight:700, marginBottom:6 } }, warning.title),
              React.createElement('div', { style:{ lineHeight:1.45 } }, warning.body)
            )
          )
        )
      ),
      React.createElement('div', { style:{ position:'fixed', left:0, right:0, bottom:16, textAlign:'center' } },
        React.createElement('button', { className:'btn primary', onClick:function(){ if (window.__goNext) window.__goNext(); } }, isFr?'Continuer':'Continue')
      )
    );
  }

  window.__registerQuestionComponent('PerineeDiag', PerineeDiag);
})();


