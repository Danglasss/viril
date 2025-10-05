// Email: capture first name + email then submit to see results
(function(){
  function Email({ question, value, onChange, lang }) {
    const data = (value && typeof value === 'object') ? value : { firstName: '', email: '' };
    const upd = (k, v) => onChange({ ...data, [k]: v });
    const submit = () => { if (window.__submitEmail) window.__submitEmail(); };
    return React.createElement('div', null,
      React.createElement('input', { type: 'text', placeholder: question.namePlaceholder || (lang==='fr'?'Ton prénom':'Your first name'), value: data.firstName, onChange: e=>upd('firstName', e.target.value) , style: { marginBottom: 12 } }),
      React.createElement('input', { type: 'email', placeholder: question.placeholder || (lang==='fr'?'ton@email.com':'your@email.com'), value: data.email, onChange: e=>upd('email', e.target.value) }),
      React.createElement('div', { style: { marginTop: 16 } },
        React.createElement('button', { className: 'btn primary', onClick: submit }, question.cta || 'See results')
      )
    );
  }
  window.__registerQuestionComponent('Email', Email);
})(); 