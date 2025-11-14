// Email: capture first name + email then submit to see results
(function(){
  function Email({ question, value, onChange, lang }) {
    const data = (value && typeof value === 'object') ? value : { firstName: '', email: '' };
    const upd = (k, v) => onChange({ ...data, [k]: v });
    const firedRef = React.useRef(false);
    // Build dynamic copy from previous answers
    const answers = (typeof window !== 'undefined' && window.__getAnswers && window.__getAnswers()) || {};
    const personalization = (function(){
      try {
        if (typeof window !== 'undefined' && window.__getPersonalization) return window.__getPersonalization();
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem('viril_personalization') : null;
        return raw ? JSON.parse(raw) : null;
      } catch(_) { return null; }
    })();
    // Helpers for analytics / Loops properties
    function computePerineeProfile(a){
      if (!a || typeof a !== 'object') return null;
      let hyper = 0, hypo = 0;
      if (a.hx_sport_core === 'often') hyper++; else if (a.hx_sport_core === 'never') hypo++;
      if (a.hx_ejac_precoce_always === 'yes') hyper++;
      if (a.hx_erection_difficulty === 'yes' || a.hx_erection_difficulty === 'sometimes') hypo++;
      if (a.hx_urine_leak === 'yes') hypo++;
      if (a.hx_post_act_feel === 'fatigue') hyper++; else if (a.hx_post_act_feel === 'relaxed') hypo++;
      if (a.hx_tension_pattern === 'tense') hyper++; else if (a.hx_tension_pattern === 'relaxed') hypo++;
      if (a.hx_penetration_sensation === 'yes') hypo++;
      return hyper >= hypo ? 'hyper' : 'hypo';
    }
    function parseBaselineMinutes(val){
      const v = String(val || '').trim();
      if (!v) return null;
      switch (v) {
        case '<1': return 1;
        case '1-2': return 2;
        case '3-5': return 4;
        case '5+': return 6;
        default: return null;
      }
    }
    function parseTargetMinutes(val){
      if (val == null) return null;
      const v = String(val).trim();
      const n = Number(v);
      if (!isNaN(n)) return n;
      if (v === 'as_long_as_wanted') return 15;
      return null;
    }
    function mapDesired(val){
      if (!val) return null;
      const v = String(val);
      // If user chose an open-ended label, default to 15 min for copy
      if (v === 'as_long_as_wanted') return '15 min';
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
    const desired = mapDesired(answers['proj_target_duration'] || (personalization && personalization.proj_target_duration));
    const reasonText = mapReason(answers['proj_main_reason'] || (personalization && personalization.proj_main_reason));
    const statusText = mapStatus(answers['demo_status'] || (personalization && personalization.demo_status));
    const headline = (lang==='fr'
      ? `Ton plan personnalisé pour tenir ${desired ? '+ de ' + desired : 'minutes'}`
      : `Your personalized plan to last ${desired ? 'over ' + desired : 'minutes'}`);
    const sub = (lang==='fr'
      ? `Basé sur tes réponses, reçois ton plan sur mesure pour ${reasonText} ${statusText}`
      : `Based on your answers, we built a tailored plan to ${reasonText} with your partner — without sacrificing pleasure.`);
    const submit = () => {
      // 1) Validate form first
      const okEmail = /.+@.+\..+/.test(data.email || '');
      const hasFirst = !!(data.firstName && String(data.firstName).trim().length > 0);
      if (!okEmail || !hasFirst) {
        try { alert(lang==='fr' ? 'Entre un prénom et un email valides' : 'Enter a valid first name and email'); } catch(_) {}
        return;
      }
      // 2) Guard against double clicks (component-local)
      if (firedRef.current) return;
      firedRef.current = true;
      setTimeout(function(){ firedRef.current = false; }, 1500);

      function proceed(){
        try { if (window.__submitEmail) window.__submitEmail(); } catch(_) {}
        // Fire-and-forget Loops event (non-blocking)
        try {
          (async function(){
            try {
              // Enrich Loops contact with quiz data
              const relStatus = answers['demo_status'] || (personalization && personalization.demo_status);
              const baselineRaw = answers['diag_duration'] || (personalization && personalization.diag_duration);
              const targetRaw = answers['proj_target_duration'] || (personalization && personalization.proj_target_duration);
              const goalRaw = answers['proj_main_reason'] || (personalization && personalization.proj_main_reason);
              const perineeType = computePerineeProfile(answers || (personalization && personalization.answers) || {});
              const body = {
                email: data.email,
                eventName: 'quiz_completed',
                firstName: data.firstName,
                perineeType: perineeType || null,
                relationshipStatus: relStatus || null,
                baselineMinutes: parseBaselineMinutes(baselineRaw),
                baselineBucket: baselineRaw || null,
                targetMinutes: parseTargetMinutes(targetRaw),
                targetBucket: targetRaw || null,
                goal: goalRaw || null
              };
              Object.keys(body).forEach(function(k){ if (body[k] === undefined) delete body[k]; });
              await fetch('/api/loops-event', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
              });
            } catch (e) { console.warn('loops event failed', e); }
          })();
        } catch(_) {}
        // Fire-and-forget Supabase tasks in background (non-blocking)
        try {
          (async function(){
            try {
              if (window.sbApi) {
                try { await window.sbApi.ensureSession(); } catch(_) {}
                try { await window.sbApi.upsertProfile({ email: data.email, first_name: data.firstName, is_anonymous: true }); } catch(_) {}
              }
            } catch (e) { console.warn('supabase upsert profile failed', e); }
          })();
        } catch(_) {}
      }
      // Push sign_up BEFORE navigating to ensure GTM fires; never block >150ms
      try {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: 'sign_up', method: 'email', eventCallback: proceed, event_callback: proceed, event_timeout: 150 });
        setTimeout(proceed, 150);
      } catch(_) { proceed(); }
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