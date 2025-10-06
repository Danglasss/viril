// Results: self-contained – loads dict, chooses top with random tie
(function(){
  function Results({ question }) {
    const lang = new URL(location.href).searchParams.get('lang') || 'fr';
    React.useEffect(()=>{ try { if (window.sbApi) window.sbApi.finalizePlan({ scores: {}, plan: { type: 'kegel_v1' } }); } catch(e) {} }, []);

    const Title = lang==='fr' ? 'Tes résultats – plan gratuit Kegel' : 'Your results – Free Kegel plan';
    const Subtitle = lang==='fr'
      ? 'Renforce ton plancher pelvien, retarde l’éjaculation et gagne en contrôle.'
      : 'Strengthen your pelvic floor to delay ejaculation and gain control.';

    const Stat = (v,l) => React.createElement('div', { style: { flex: 1, background: 'var(--color-card)', borderRadius: 14, padding: '10px 12px', textAlign: 'center' } },
      React.createElement('div', { style: { fontWeight: 800, fontSize: 18 } }, v),
      React.createElement('div', { style: { opacity: .85, fontSize: 12 } }, l)
    );

    const Card = (title, children) => React.createElement('div', { style: { background: 'var(--color-card)', borderRadius: 16, padding: 14, marginBottom: 12 } },
      React.createElement('div', { style: { fontWeight: 800, marginBottom: 8 } }, title),
      children
    );

    const Bullet = (t) => React.createElement('li', { style: { margin: '6px 0' } }, t);

    return React.createElement('div', null,
      React.createElement('p', { style: { opacity: .85, marginTop: -6, marginBottom: 14 } }, Subtitle),

      React.createElement('div', { className: 'row', style: { marginBottom: 12 } },
        Stat(lang==='fr'?'3×/jour':'3×/day', lang==='fr'?'Micro‑séances':'Micro sessions'),
        Stat('8–12', lang==='fr'?'Contractions/série':'Contractions/set'),
        Stat('4 semaines', lang==='fr'?'Progression':'Progression')
      ),

      Card(lang==='fr'?'1) Localiser le plancher pelvien':'1) Find your pelvic floor',
        React.createElement('ul', { style: { margin: '0 0 0 18px', padding: 0 } },
          Bullet(lang==='fr'?'Contracte comme pour retenir l’urine; ne bloque pas la respiration.':'Contract as if to stop urinating; don’t hold your breath.'),
          Bullet(lang==='fr'?'Le bas-ventre, les fessiers et les cuisses doivent rester détendus.':'Keep abs, glutes and thighs relaxed.')
        )
      ),

      Card(lang==='fr'?'2) Technique (4‑4)':'2) Technique (4‑4)',
        React.createElement('ul', { style: { margin: '0 0 0 18px', padding: 0 } },
          Bullet(lang==='fr'?'Inspire 4 s, contracte 4 s. Relâche 4 s, respire normalement.':'Inhale 4 s, contract 4 s. Release 4 s, breathe normally.'),
          Bullet(lang==='fr'?'Fais 8–12 répétitions = 1 série.':'Do 8–12 reps = 1 set.')
        )
      ),

      Card(lang==='fr'?'3) Programme 4 semaines':'3) 4‑week plan',
        React.createElement('ul', { style: { margin: 0, padding: 0, listStyle: 'none' } },
          React.createElement('li', { style: { margin: '6px 0' } }, lang==='fr'?'S1: 3 séries × 8 reps, 3×/jour':'W1: 3 sets × 8 reps, 3×/day'),
          React.createElement('li', { style: { margin: '6px 0' } }, lang==='fr'?'S2: 3 séries × 10 reps (ajoute 1 pause longue)':'W2: 3 sets × 10 reps (add 1 long hold)'),
          React.createElement('li', { style: { margin: '6px 0' } }, lang==='fr'?'S3: 4 séries × 10 reps (rythme 4‑6)':'W3: 4 sets × 10 reps (tempo 4‑6)'),
          React.createElement('li', { style: { margin: '6px 0' } }, lang==='fr'?'S4: 4 séries × 12 reps + 2 pauses longues':'W4: 4 sets × 12 reps + 2 long holds')
        )
      ),

      Card(lang==='fr'?'4) Pendant le rapport: réflexe STOP‑START':'4) During sex: STOP‑START',
        React.createElement('ul', { style: { margin: '0 0 0 18px', padding: 0 } },
          Bullet(lang==='fr'?'Quand l’excitation monte trop: stop 10–20 s, respire profondément, puis reprends.':'When arousal spikes: pause 10–20 s, breathe deep, resume.'),
          Bullet(lang==='fr'?'Combine avec 3 contractions Kegel lentes pour faire retomber la pression.':'Combine with 3 slow Kegels to reduce arousal.')
        )
      ),

      Card(lang==='fr'?'Erreurs fréquentes':'Common mistakes',
        React.createElement('ul', { style: { margin: '0 0 0 18px', padding: 0 } },
          Bullet(lang==='fr'?'Serrer les abdos/fessiers au lieu du plancher pelvien.':'Squeezing abs or glutes instead of pelvic floor.'),
          Bullet(lang==='fr'?'Couper la respiration.':'Holding your breath.'),
          Bullet(lang==='fr'?'Trop forcer: la qualité > quantité.':'Over‑tensing: quality > quantity.')
        )
      ),

      React.createElement('div', { style: { height: 8 } }),
      React.createElement('div', { style: { opacity: .7, fontSize: 12 } }, lang==='fr' ? 'Ton plan est enregistré.' : 'Your plan is saved.')
    );
  }
  window.__registerQuestionComponent('Results', Results);
})();