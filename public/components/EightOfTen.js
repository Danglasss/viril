(function(){
  function Person({ fill }){
    return React.createElement('svg', { width:22, height:22, viewBox:'0 0 24 24', fill: 'none' },
      React.createElement('path', { d:'M12 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z', fill: fill }),
      React.createElement('path', { d:'M6 22v-5a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v5H6Z', fill: fill })
    );
  }

  function EightOfTen({ question, lang }){
    const title = (question && question.title && (question.title[lang] || question.title.fr || question.title.en)) || '';
    const filled = (question && question.filled) || 8;
    const total = 10;
    const green = '#00B67A';
    const gray = 'rgba(255,255,255,.18)';
    return React.createElement(React.Fragment, null,
      React.createElement('div', { className:'card' },
        title && React.createElement('h2', { style:{ textAlign:'center', fontSize:22, lineHeight:1.35, marginBottom:10 } }, title),
        React.createElement('div', { style:{ display:'flex', gap:8, justifyContent:'center', background:'rgba(255,255,255,.06)', padding:12, borderRadius:12, marginTop:8 } },
          Array.from({ length: total }).map(function(_, i){
            return React.createElement(Person, { key:i, fill: i < filled ? green : gray });
          })
        ),
        // Trustpilot-like review
        React.createElement('div', { style:{ marginTop:12, background:'rgba(255,255,255,.05)', borderRadius:10, padding:'12px' } },
          React.createElement('div', { style:{ display:'flex', gap:4, marginBottom:6 } },
            Array.from({ length: 5 }).map(function(_, i){
              return React.createElement('div', { key:i, style:{ width:16, height:16, background:green, borderRadius:3, display:'flex', alignItems:'center', justifyContent:'center' } },
                React.createElement('svg', { width:10, height:10, viewBox:'0 0 24 24', fill:'white' },
                  React.createElement('path', { d:'M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.908-7.417 3.908 1.481-8.279-6.064-5.828 8.332-1.151z' })
                )
              );
            })
          ),
          React.createElement('div', { style:{ fontWeight:800, marginBottom:4 } }, (lang==='fr' ? "Je suis content d’avoir trouvé ces exercices" : "I'm glad I found these exercises")),
          React.createElement('div', { style:{ opacity:.9 } }, (lang==='fr' ? "En 2 semaines, j’ai gagné en contrôle et en confiance. Je recommande la rééducation du périnée." : "In 2 weeks I gained control and confidence. I recommend pelvic floor retraining."))
        )
      ),
      React.createElement('div', { style:{ position:'fixed', left:0, right:0, bottom:16, textAlign:'center' } },
        React.createElement('button', { className:'btn primary', onClick:function(){ if (window.__goNext) window.__goNext(); } }, (lang==='fr'?'Continuer':'Continue'))
      )
    );
  }

  window.__registerQuestionComponent('EightOfTen', EightOfTen);
})();


