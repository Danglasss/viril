// Text: textarea with placeholder and character counter
(function(){
  function Text({ question, value, onChange, lang }) {
    const ph = (question.placeholder && (question.placeholder[lang] || question.placeholder.en)) || '';
    const ml = question.maxLength || 200;
    return React.createElement('div', null,
      React.createElement('textarea', {
        rows: 4, placeholder: ph, maxLength: ml, value: value || '',
        onChange: (e) => onChange(e.target.value)
      }),
      React.createElement('div', { style: { textAlign: 'right', opacity: .6, marginTop: 4 } }, `${(value||'').length}/${ml}`)
    );
  }
  window.__registerQuestionComponent('Text', Text);
})(); 