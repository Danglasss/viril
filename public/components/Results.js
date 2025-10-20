// Results: self-contained – loads dict, chooses top with random tie
(function(){
  function Results(){
    const lang = new URL(location.href).searchParams.get('lang') || 'fr';
    React.useEffect(()=>{ try { if (window.sbApi) window.sbApi.finalizePlan({ scores: {}, plan: { type: 'waitlist' } }); } catch(e) {} }, []);

    // Simulated queue (slightly dynamic to feel live)
    const base = 247;
    const [q, setQ] = React.useState(base);
    React.useEffect(()=>{
      const id = setInterval(()=> setQ(v => Math.max(0, v + (Math.random()<.5?-1:0))), 3000);
      return ()=> clearInterval(id);
    }, []);

    const H = (t)=> React.createElement('div', { style:{ fontWeight:900, fontSize:26, letterSpacing:.2, margin:'2px 0 6px' } }, t);
    const P = (t)=> React.createElement('p', { style:{ opacity:.85, margin:'6px 0' } }, t);
    const Row = (icon,label,value)=> React.createElement('div', { style:{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0' } },
      React.createElement('div', { style:{ opacity:.85 } }, `${icon} ${label}`),
      React.createElement('div', { style:{ fontWeight:800 } }, value)
    );

    return React.createElement('div', { style:{ display:'flex', justifyContent:'center' } },
      React.createElement('div', { style:{ width:'86%', maxWidth:600 } },
        H(lang==='fr'?'Tu es sur liste d’attente':'You are on the waitlist'),
        P(lang==='fr'?'Nous recevons beaucoup de demandes en ce moment.':'We’re receiving a lot of requests right now.'),
        P(lang==='fr'?'Ton plan est en cours de création, un spécialiste le validera avant l’envoi.':'Your plan is being prepared and will be reviewed by a specialist.'),
        P(lang==='fr'?'Tu seras prévenu par e‑mail dès qu’il sera prêt.':'We’ll notify you by email as soon as it’s ready.'),

        React.createElement('div', { style:{ display:'grid', gap:10, marginTop:14 } },
          Row('⏳', lang==='fr'?'Personnes devant toi':'People ahead', String(q)),
          Row('🕒', lang==='fr'?'Temps d’attente moyen':'Average wait time', lang==='fr'?'2 à 3 jours':'2–3 days'),
          Row('🔒', lang==='fr'?'Discrétion':'Discretion', lang==='fr'?'e‑mail discret (objet neutre)':'discreet email (neutral subject)')
        )
      )
    );
  }
  window.__registerQuestionComponent('Results', Results);
})(); 