// ImageChoice: pick one image; shows label, highlights selected (auto-advance)
(function(){
  function ImageChoice({ question, value, onChange, lang }) {
    const opts = question.options || [];
    const select = (val) => { onChange(val); if (window.__goNext) window.__goNext(); };
    return React.createElement('div', { className: 'options' },
      opts.map(o => React.createElement('div', {
        key: o.value, className: 'option img-option' + (value === o.value ? ' selected' : ''), onClick: () => select(o.value)
      },
        React.createElement('img', { src: o.src, alt: o.value, width: 56, height: 56 }),
        React.createElement('div', null, (o.label && (o.label[lang] || o.label.en)) || String(o.value))
      ))
    );
  }
  window.__registerQuestionComponent('ImageChoice', ImageChoice);
})(); 