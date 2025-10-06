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
        // separator
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
          React.createElement('div', { style: { flex: 1, height: 1, background: 'rgba(255,255,255,.2)' } }),
          React.createElement('div', { style: { opacity: .7, fontSize: 12 } }, lang==='fr' ? 'ou' : 'or'),
          React.createElement('div', { style: { flex: 1, height: 1, background: 'rgba(255,255,255,.2)' } })
        ),
        // Google button (white)
        React.createElement('button', { onClick: async ()=>{ try { if (window.sbApi) await window.sbApi.signInWithGoogle(); } catch(e) { console.warn(e); } }, style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#FFFFFF', color: '#000', borderRadius: 10, padding: '12px 14px', width: '92%', border: '1px solid rgba(0,0,0,0.12)' } },
          // Google G icon SVG
          React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', width: 18, height: 18, viewBox: '0 0 48 48' },
            React.createElement('path', { fill: '#FFC107', d: 'M43.6 20.5H42V20H24v8h11.3C33.8 32.7 29.2 36 24 36c-7 0-12.8-5.8-12.8-12.8S17 10.5 24 10.5c3.2 0 6.1 1.2 8.3 3.2l5.7-5.7C34.7 4.6 29.7 2.5 24 2.5 12 2.5 2.5 12 2.5 24S12 45.5 24 45.5 45.5 36 45.5 24c0-1.2-.1-2.3-.4-3.5z' }),
            React.createElement('path', { fill: '#FF3D00', d: 'M6.3 14.7l6.6 4.8C14.6 16.9 18.9 14 24 14c3.2 0 6.1 1.2 8.3 3.2l5.7-5.7C34.7 4.6 29.7 2.5 24 2.5 16.2 2.5 9.4 6.7 6.3 14.7z' }),
            React.createElement('path', { fill: '#4CAF50', d: 'M24 45.5c5.2 0 10-2 13.6-5.3l-6.3-5.2C29.1 36.7 26.7 37.5 24 37.5c-5.1 0-9.4-3.3-10.9-7.9l-6.6 5.1C9.5 41.3 16.2 45.5 24 45.5z' }),
            React.createElement('path', { fill: '#1976D2', d: 'M43.6 20.5H42V20H24v8h11.3c-1.7 4.7-6.2 8-11.3 8-5.1 0-9.4-3.3-10.9-7.9l-6.6 5.1C9.5 41.3 16.2 45.5 24 45.5 35.9 45.5 45.5 36 45.5 24c0-1.2-.1-2.3-.4-3.5z' })
          ),
          React.createElement('span', null, lang==='fr' ? 'Continuer avec Google' : 'Continue with Google')
        )
      )
    );
  }
  window.__registerQuestionComponent('Email', Email);
})(); 