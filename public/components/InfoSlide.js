(function(){
  function InfoSlide({ question, onChange, lang }) {
    const t = (k) => {
      const src = question && question[k];
      if (!src) return '';
      if (typeof src === 'string') return src;
      const v = src[lang] || src.en;
      return typeof v === 'string' ? v : '';
    };
    const title = t('title');
    const subtitle = t('subtitle');
    const bullets = question && question.bullets || [];
    const cta = t('cta') || (lang==='fr'?'Je comprends':'Got it');
    const img = question && question.imageUrl;
    const columns = question && question.columns || [];

    // no extra decorative icon; emojis live in titles from data
    return React.createElement(React.Fragment, null,
      React.createElement('div', { className:'card' },
        title && React.createElement('h2', { style:{ textAlign:'center' } }, title),
        subtitle && React.createElement('p', { style:{opacity:.85, marginTop:-6, textAlign:'center'} }, subtitle),
        img && React.createElement('div', { style:{ display:'flex', justifyContent:'center', margin:'10px 0' } },
          React.createElement('img', { src: img, alt:'illustration', style:{ maxWidth:'80%', height:'auto' } })
        ),
        (columns.length>0 ? (
          React.createElement('div', { style:{ display:'flex', gap:10, flexWrap:'nowrap', alignItems:'stretch', justifyContent:'center', maxWidth:320, margin:'8px auto 0' } },
            columns.map(function(col, i){
              const titleCol = (col.title && (col.title[lang]||col.title.en)) || col.title || '';
              const points = col.points || [];
              return React.createElement('div', { key:i, style:{ flex:'0 0 150px', minWidth:150, background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.12)', borderRadius:12, padding:'12px', display:'flex', flexDirection:'column' } },
                React.createElement('div', { style:{ fontWeight:800, marginBottom:8, textAlign:'left' } }, titleCol || ''),
                React.createElement('div', { style:{ marginTop:6 } },
                  points.map(function(p, j){ return React.createElement('p', { key:j, style:{ margin:'6px 0', lineHeight:1.5 } }, (p[lang]||p.en||p)); })
                )
              );
            })
          )
        ) : (
          bullets.length>0 && React.createElement('ul', { style:{margin:'8px 0 0 18px', padding:0} },
            bullets.map(function(b,i){ return React.createElement('li',{key:i,style:{margin:'6px 0'}}, (typeof b==='string'?b:(b[lang]||b.en||''))); })
          )
        ))
      ),
      React.createElement('div', { style:{ position:'fixed', left:0, right:0, bottom:16, textAlign:'center' } },
        React.createElement('button', { className:'btn primary', onClick:function(){ if (window.__goNext) window.__goNext(); } }, cta)
      )
    );
  }
  window.__registerQuestionComponent('InfoSlide', InfoSlide);
})();


