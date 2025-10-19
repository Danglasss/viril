// Email: capture first name + email then submit to see results
(function(){
  function Email({ question, value, onChange, lang }) {
    const data = (value && typeof value === 'object') ? value : { firstName: '', email: '' };
    const upd = (k, v) => onChange({ ...data, [k]: v });
    // Build dynamic copy from previous answers
    const answers = (typeof window !== 'undefined' && window.__getAnswers && window.__getAnswers()) || {};
    function mapDesired(val){
      if (!val) return null;
      const v = String(val);
      if (/^\d+$/.test(v)) return v + ' min';
      return v;
    }
    function mapReason(val){
      switch(String(val||'').trim()){
        case 'partner_pleasure': return 'faire jouir';
        case 'confidence': return 'te sentir à nouveau confiant avec';
        case 'avoid_frustration': return 'arrêter de stresser avant chaque rapport avec';
        case 'enjoy_more': return 'profiter de tes rapports sexuels avec';
        default: return 'atteindre ton objectif avec';
      }
    }
    function mapStatus(val){
      switch(String(val||'').trim()){
        case 'married': return 'ta femme';
        case 'couple': return 'ta copine';
        case 'single': return 'ta prochaine partenaire';
        default: return 'ta partenaire';
      }
    }
    const desired = mapDesired(answers['proj_target_duration']);
    const reasonText = mapReason(answers['proj_main_reason']);
    const statusText = mapStatus(answers['demo_status']);
    const headline = (lang==='fr'
      ? `Ton plan personnalisé pour tenir ${desired ? '+ de ' + desired : 'minutes'}`
      : `Your personalized plan to last ${desired ? 'over ' + desired : 'minutes'}`);
    const sub = (lang==='fr'
      ? `Basé sur tes réponses, reçois ton plan sur mesure pour ${reasonText} ${statusText}`
      : `Based on your answers, we built a tailored plan to ${reasonText} with your partner — without sacrificing pleasure.`);
    const submit = async () => {
      try {
        if (window.sbApi) {
          await window.sbApi.ensureSession();
          const okEmail = /.+@.+\..+/.test(data.email || '');
          if (okEmail && data.firstName) {
            await window.sbApi.upsertProfile({ email: data.email, first_name: data.firstName, is_anonymous: true });
            try {
              window.dataLayer = window.dataLayer || [];
              window.dataLayer.push({ event: 'sign_up', method: 'email' });
            } catch(_) {}
          }
        }
      } catch (e) { console.warn('supabase upsert profile failed', e); }
      if (window.__submitEmail) window.__submitEmail();
    };
    return React.createElement('div', null,
      // Dynamic copy
      React.createElement('h2', { style: { margin: '4px 0 6px' } }, headline),
      React.createElement('p', { style: { opacity: .9, marginTop: -2, marginBottom: 10 } }, sub),
      React.createElement('input', { type: 'text', placeholder: question.namePlaceholder || (lang==='fr'?'Ton prénom':'Your first name'), value: data.firstName, onChange: e=>upd('firstName', e.target.value) , style: { margin: '12px 0' } }),
      React.createElement('input', { type: 'email', placeholder: question.placeholder || (lang==='fr'?'ton@email.com':'your@email.com'), value: data.email, onChange: e=>upd('email', e.target.value) }),
      React.createElement('div', { style: { marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 } },
        React.createElement('button', { className: 'btn primary', onClick: submit }, (lang==='fr' ? ' Obtenir mon plan maintenant !' : '🔥 Get the method now')),
        React.createElement('div', { style: { background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.16)', borderRadius: 10, padding: '10px 12px', width: '92%' } },
          React.createElement('div', { style: { fontSize: 12, fontWeight: 700 } }, lang==='fr' ? '+ de 100 000 hommes qui ont repris le contrôle 💪' : '200,000+ men chose us 💪'),
          React.createElement('div', { style: { marginTop: 6, fontSize: 12, opacity: .8 } }, lang==='fr' ? 'Aucun spam. Recois ton plan personnalisé en toute discrétion et confidentialité.' : 'We respect your privacy and take its protection very seriously — no spam.')
        )
      )
    );
  }
  window.__registerQuestionComponent('Email', Email);
})(); 