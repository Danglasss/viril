// QCM: multiple-choice list; click an option to set the answer (auto-advance with 300ms delay)
(function () {
  function QCM({ question, value, onChange, lang }) {
    const opts = question.options || [];
    const select = (val) => {
      onChange(val);
      // 300ms delay to see the selection animation
      setTimeout(() => {
        if (window.__goNext) window.__goNext();
      }, 300);
    };
    return React.createElement('div', { className: 'options' },
      question.imageUrl && React.createElement('img', {
        src: question.imageUrl,
        style: { width: '100%', borderRadius: 8, marginBottom: 16 }
      }),
      opts.map(o => React.createElement('div', {
        key: o.value,
        className: 'option' + (value === o.value ? ' selected' : ''),
        onClick: () => select(o.value)
      }, (o.label && (o.label[lang] || o.label.en)) || String(o.value)))
    );
  }
  window.__registerQuestionComponent('QCM', QCM);
})(); 