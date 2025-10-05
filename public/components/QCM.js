// QCM: multiple-choice list; click an option to set the answer (auto-advance)
(function(){
  function QCM({ question, value, onChange, lang }) {
    const opts = question.options || [];
    const select = (val) => { onChange(val); if (window.__goNext) window.__goNext(); };
    return React.createElement('div', { className: 'options' },
      opts.map(o => React.createElement('div', {
        key: o.value,
        className: 'option' + (value === o.value ? ' selected' : ''),
        onClick: () => select(o.value)
      }, (o.label && (o.label[lang] || o.label.en)) || String(o.value)))
    );
  }
  window.__registerQuestionComponent('QCM', QCM);
})(); 