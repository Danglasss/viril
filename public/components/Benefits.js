(function(){
  function Row({ icon, text }){
    const green = '#00B67A';
    return React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', background:'rgba(255,255,255,.04)', borderRadius:10 } },
      // simple gray icon square
      React.createElement('div', { style:{ width:26, height:26, borderRadius:6, background:'rgba(255,255,255,.12)', display:'flex', alignItems:'center', justifyContent:'center' } },
        React.createElement('div', { style:{ width:12, height:12, background:'rgba(255,255,255,.7)', borderRadius:2 } })
      ),
      React.createElement('div', { style:{ flex:1 } }, text),
      React.createElement('svg', { width:12, height:12, viewBox:'0 0 24 24', fill: green },
        React.createElement('path', { d:'M12 2l3 6 6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1z' })
      )
    );
  }

  function Benefits({ question, lang }){
    const title = (question && question.title && (question.title[lang] || question.title.fr || question.title.en)) || '';
    const items = (question && question.items) || [];
    return React.createElement(React.Fragment, null,
      React.createElement('div', { className:'card' },
        title && React.createElement('h2', { style:{ textAlign:'center', marginBottom:10 } }, title),
        React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:8 } },
          items.map(function(it, i){ var t = (it[lang]||it.fr||it.en||it)||''; return React.createElement(Row, { key:i, text:t }); })
        )
      ),
      React.createElement('div', { style:{ position:'fixed', left:0, right:0, bottom:16, textAlign:'center' } },
        React.createElement('button', { className:'btn primary', onClick:function(){ if (window.__goNext) window.__goNext(); } }, (lang==='fr'?'Continuer':'Continue'))
      )
    );
  }

  window.__registerQuestionComponent('Benefits', Benefits);
})();


