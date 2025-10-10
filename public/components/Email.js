// Email: capture first name + email then submit to see results
(function(){
  function Email({ question, value, onChange, lang }) {
    const data = (value && typeof value === 'object') ? value : { firstName: '', email: '' };
    const upd = (k, v) => onChange({ ...data, [k]: v });
    const submit = async () => {
      try {
        if (window.sbApi) {
          await window.sbApi.ensureSession();
          if (data.email && data.firstName) {
            await window.sbApi.upsertProfile({ email: data.email, first_name: data.firstName, is_anonymous: true });
          }
        }
      } catch (e) { console.warn('supabase upsert profile failed', e); }
      if (window.__submitEmail) window.__submitEmail();
    };
    return React.createElement('div', null,
      React.createElement('p', { style: { opacity: .85, marginTop: -6 } }, (lang==='fr' ? 'C\'est gratuit et instantané.' : 'Totally free.')),
      React.createElement('input', { type: 'text', placeholder: question.namePlaceholder || (lang==='fr'?'Ton prénom':'Your first name'), value: data.firstName, onChange: e=>upd('firstName', e.target.value) , style: { margin: '12px 0' } }),
      React.createElement('input', { type: 'email', placeholder: question.placeholder || (lang==='fr'?'ton@email.com':'your@email.com'), value: data.email, onChange: e=>upd('email', e.target.value) }),
      React.createElement('div', { style: { marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 } },
        React.createElement('button', { className: 'btn primary', onClick: submit }, (question.cta || (lang==='fr'?'Voir mon plan':'See my plan'))),
        React.createElement('div', { style: { background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.16)', borderRadius: 10, padding: '10px 12px', width: '92%' } },
          React.createElement('div', { style: { fontSize: 12, fontWeight: 700 } }, lang==='fr' ? 'Plus de 200 000 hommes nous ont choisis 💪' : '200,000+ men chose us 💪'),
          React.createElement('div', { style: { marginTop: 6, fontSize: 12, opacity: .8 } }, lang==='fr' ? 'Nous respectons votre vie privée et prenons sa protection très au sérieux — pas de spam.' : 'We respect your privacy and take protection seriously — no spam.')
        )
      )
    );
  }
  window.__registerQuestionComponent('Email', Email);
})(); 