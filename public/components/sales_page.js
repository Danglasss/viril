(function () {
  function ResultsSale() {
    const lang = new URL(location.href).searchParams.get('lang') || 'fr';
    const answers = (typeof window !== 'undefined' && window.__getAnswers && window.__getAnswers()) || {};
    const personalization = (function () {
      try {
        if (typeof window !== 'undefined' && window.__getPersonalization) return window.__getPersonalization();
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem('viril_personalization') : null;
        return raw ? JSON.parse(raw) : null;
      } catch (_) { return null; }
    })();

    // Force sync profile at paywall load (ensure all data is up-to-date before purchase)
    React.useEffect(() => {
      try {
        if (window.profileSync && Object.keys(answers).length > 0) {
          window.profileSync.syncNow(answers);
        }
      } catch (e) { console.error('[paywall] profileSync error', e); }
    }, []);

    // Counter removed
    function mapMinutes(val) {
      const v = String(val || '');
      if (v === '<1') return 1;
      if (v === '1-2') return 1;
      if (v === '3-5') return 3;
      if (v === '5+' || v === '6-10') return 5;
      if (/^\d+$/.test(v)) return Number(v);
      return 2;
    }
    const beforeMin = mapMinutes(answers['diag_duration'] || (personalization && personalization.diag_duration));
    const targetMin = mapMinutes(answers['proj_target_duration'] || (personalization && personalization.proj_target_duration));

    // selection du plan
    const [plan, setPlan] = React.useState('4w');

    // Timer 10:00 active only when tab visible
    const initial = 600; // seconds
    const [remain, setRemain] = React.useState(initial);
    React.useEffect(() => {
      let id = 0;
      function tick() {
        if (document.visibilityState === 'visible') {
          setRemain(v => Math.max(0, v - 1));
        }
      }
      id = setInterval(tick, 1000);
      return () => clearInterval(id);
    }, []);
    function mmss(s) { const m = Math.floor(s / 60).toString().padStart(2, '0'); const sec = (s % 60).toString().padStart(2, '0'); return `${m}:${sec}`; }

    function formatMinutesLabel(min) {
      try {
        const n = Number(min);
        if (!Number.isFinite(n)) return 'quelques minutes';
        return n === 1 ? '1 minute' : `${n} minutes`;
      } catch (_) { return 'quelques minutes'; }
    }

    // Scroll to plans section
    const scrollToPlans = function () {
      const planSection = document.getElementById('plan-section');
      if (planSection) {
        planSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
    const firstName = (answers && answers['__email'] && answers['__email'].firstName) || '';

    const Block = (title, children) => React.createElement('div', {
      style: {
        margin: '40px 0', paddingTop: 18, borderTop: '1px solid rgba(255,255,255,.12)'
      }
    },
      React.createElement('div', { style: { fontWeight: 900, marginBottom: 14, fontSize: 22, letterSpacing: .2 } }, title),
      children
    );

    function Bar({ value, max }) {
      const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
      return React.createElement('div', { style: { background: 'rgba(255,255,255,.08)', height: 10, borderRadius: 999, overflow: 'hidden' } },
        React.createElement('div', { style: { width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg,#FF3B30,#FFB020)' } })
      );
    }

    const eta = (function () { const d = new Date(); d.setDate(d.getDate() + 28); return d.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' }); })();

    return React.createElement('div', null,
      // Fixed header with timer
      React.createElement('div', {
        style: {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: 'rgba(14, 14, 15, 0.98)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,.1)',
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16
        }
      },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12 } },
          React.createElement('div', {
            style: {
              background: 'rgba(255,0,0,.15)',
              border: '1px solid rgba(255,0,0,.3)',
              padding: '6px 12px',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }
          },
            React.createElement('div', { style: { fontSize: 13, opacity: .9 } }, 'Expire dans :'),
            React.createElement('div', {
              style: {
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontWeight: 900,
                color: '#FF5F5F',
                fontSize: 16
              }
            }, mmss(remain))
          )
        ),
        React.createElement('button', {
          onClick: scrollToPlans,
          style: {
            background: 'linear-gradient(135deg, #FF4D00, #FF7A00)',
            border: 'none',
            color: '#FFFFFF',
            padding: '10px 20px',
            borderRadius: 6,
            fontWeight: 800,
            fontSize: 14,
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(255,77,0,.3)',
            transition: 'transform 0.2s, box-shadow 0.2s'
          },
          onMouseEnter: function (e) {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(255,77,0,.4)';
          },
          onMouseLeave: function (e) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 10px rgba(255,77,0,.3)';
          }
        }, 'Mon Plan →')
      ),

      // Add padding top to account for fixed header
      React.createElement('div', { style: { paddingTop: 26 } }),

      // Logo removed
      React.createElement('div', { style: { margin: '0' } }),

      // New title
      // New title
      React.createElement('h2', { style: { margin: '8px 0 18px', lineHeight: 1.1, fontWeight: 900, letterSpacing: .2, fontSize: 32 } },
        React.createElement(React.Fragment, null,
          React.createElement('span', null, 'Plus jamais '),
          React.createElement('span', { style: { fontStyle: 'italic' } }, '"désolé"'),
          React.createElement('span', null, ' après '),
          React.createElement('span', null, formatMinutesLabel(beforeMin)),
          React.createElement('span', { style: { display: 'block', marginTop: 8, opacity: .95, fontSize: 17, fontWeight: 550, lineHeight: 1.3 } }, 'Ton plan personnalisé est prêt pour la faire jouir (enfin) avant toi.')
        )
      ),

      // Avant / Après amélioré
      (function () {
        function SegBar({ percent, color }) {
          const n = 4; const active = Math.round((percent / 100) * n);
          const items = [];
          for (let i = 0; i < n; i++) items.push(React.createElement('span', { key: i, style: { display: 'inline-block', width: 26, height: 6, marginRight: 6, borderRadius: 4, background: i < active ? color : 'rgba(255,255,255,.18)' } }));
          return React.createElement('div', null, items);
        }
        const sat = (m) => Math.max(0, Math.min(100, Math.round((m / 15) * 100)));
        return React.createElement('div', { style: { margin: '34px 0' } },

          // Bande visuelle haut: deux photos côte à côte
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, marginBottom: 8 } },
            React.createElement('div', { style: { height: 200, overflow: 'hidden', background: 'transparent' } },
              React.createElement('img', { src: '/images/triste.jpeg', alt: 'homme stressé', style: { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block', backgroundColor: 'transparent' } })
            ),
            React.createElement('div', { style: { height: 200, overflow: 'hidden', background: 'transparent' } },
              React.createElement('img', { src: '/images/heureux.jpeg', alt: 'homme confiant', style: { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block', backgroundColor: 'transparent' } })
            )
          ),
          // Légendes et métriques
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 } },
            React.createElement('div', { style: { padding: '10px 12px', background: 'rgba(255,0,0,.06)', borderTop: '1px solid rgba(255,255,255,.12)', borderRight: '1px solid rgba(255,255,255,.12)', borderBottom: '1px solid rgba(255,255,255,.12)' } },
              React.createElement('div', { style: { fontWeight: 900, color: '#FF6B6B' } }, 'Aujourd\'hui')
            ),
            React.createElement('div', { style: { padding: '10px 12px', background: 'rgba(0,255,100,.06)', borderTop: '1px solid rgba(255,255,255,.12)', borderBottom: '1px solid rgba(255,255,255,.12)' } },
              React.createElement('div', { style: { fontWeight: 900, color: '#00D67A' } }, 'Dans 30 jours')
            )
          ),
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 } },
            React.createElement('div', { style: { padding: '12px', borderRight: '1px solid rgba(255,255,255,.12)' } },
              React.createElement('div', { style: { opacity: .9, marginBottom: 4 } }, 'Performance'),
              React.createElement('div', { style: { color: '#FF7A3C', fontWeight: 900, marginBottom: 8 } }, `${beforeMin} min 😔`),
              React.createElement('div', { style: { opacity: .9, marginBottom: 4 } }, 'Satisfaction partenaire'),
              SegBar({ percent: sat(beforeMin), color: '#FF3B30' }),
              React.createElement('div', { style: { fontSize: 12, opacity: .7, marginTop: 4 } }, 'Elle fait semblant'),
              React.createElement('div', { style: { opacity: .9, marginTop: 12, marginBottom: 4 } }, 'État mental'),
              React.createElement('div', { style: { fontSize: 14, color: '#FF5F5F' } }, 'Anxieux, honteux')
            ),
            React.createElement('div', { style: { padding: '12px' } },
              React.createElement('div', { style: { opacity: .9, marginBottom: 4 } }, 'Performance'),
              React.createElement('div', { style: { color: '#00D67A', fontWeight: 900, marginBottom: 8 } }, `+${targetMin} min 💪`),
              React.createElement('div', { style: { opacity: .9, marginBottom: 4 } }, 'Satisfaction partenaire'),
              SegBar({ percent: sat(targetMin), color: '#00B67A' }),
              React.createElement('div', { style: { fontSize: 12, color: '#00D67A', marginTop: 4 } }, 'Elle te désire vraiment'),
              React.createElement('div', { style: { opacity: .9, marginTop: 12, marginBottom: 4 } }, 'État mental'),
              React.createElement('div', { style: { fontSize: 14, color: '#00D67A' } }, 'Confiant, viril')
            )
          )
        );
      })(),

      // Block 2: Résumé personnel basé sur tes réponses (design "IMC")
      (function () {
        function computeProfile(a) {
          let hyper = 0, hypo = 0;
          if (a['hx_sport_core'] === 'often') hyper++; else if (a['hx_sport_core'] === 'never') hypo++;
          if (a['hx_ejac_precoce_always'] === 'yes') hyper++;
          if (a['hx_erection_difficulty'] === 'yes' || a['hx_erection_difficulty'] === 'sometimes') hypo++;
          if (a['hx_urine_leak'] === 'yes') hypo++;
          if (a['hx_post_act_feel'] === 'fatigue') hyper++; else if (a['hx_post_act_feel'] === 'relaxed') hypo++;
          if (a['hx_tension_pattern'] === 'tense') hyper++; else if (a['hx_tension_pattern'] === 'relaxed') hypo++;
          if (a['hx_penetration_sensation'] === 'yes') hypo++;
          return hyper >= hypo ? 'Hypertonique' : 'Hypotonique';
        }
        const profile = computeProfile(answers);
        const profileLabel = `Périnné ${profile}`;
        const profileDesc = (profile === 'Hypertonique'
          ? 'Trop de tension au repos — hypersensibilité, réflexe plus rapide.'
          : 'Manque de tonus — contrôle limité, réflexe difficile à freiner.');
        const pct = Math.max(0, Math.min(100, Math.round((beforeMin / 15) * 100)));
        return Block('Ton résumé personnel', React.createElement('div', {
          style: {
            background: 'rgba(255,255,255,.06)', padding: 12
          }
        },
          React.createElement('div', { style: { opacity: .85, fontWeight: 800, marginBottom: 8, fontSize: 14, letterSpacing: .2 } }, 'Durée actuelle en moyenne'),
          React.createElement('div', { style: { fontSize: 36, fontWeight: 900, marginBottom: 10, color: '#FF7A3C' } }, `${beforeMin} min`),
          // gradient bar with pointer
          React.createElement('div', { style: { position: 'relative', height: 8, background: 'linear-gradient(90deg,#EF4444,#F59E0B,#34D399)', borderRadius: 4, overflow: 'hidden' } }),
          React.createElement('div', { style: { position: 'relative', height: 0 } },
            React.createElement('div', { style: { position: 'absolute', left: `calc(${pct}% - 6px)`, top: -9, width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '8px solid #FFFFFF', filter: 'drop-shadow(0 0 0.5px rgba(0,0,0,.6))' } })
          ),
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', opacity: .85, marginTop: 6, fontSize: 12 } },
            React.createElement('span', null, 'Zone rouge'),
            React.createElement('span', null, 'Normal')
          ),
          React.createElement('div', { style: { marginTop: 16, fontSize: 15, lineHeight: 1.5, fontWeight: 600, color: '#FFFFFF' } },
            `Une durée inférieure à 3 minutes est cliniquement considérée comme une éjaculation précoce.`
          )
        ));
      })(),

      // Block 3 removed as requested

      // Block 4: Projection d'amélioration (remplace "Quand espérer des améliorations ?")
      (function () {
        const maxY = Math.max(10, Math.max(beforeMin, targetMin) * 1.4);
        const W = 360; const H = 160; // base canvas for math, svg will scale
        function y(v) { return H - (v / maxY) * H; }
        const x1 = 28, x2 = W - 28; // padding
        const midX = (x1 + x2) / 2;
        const p1 = { x: x1, y: y(beforeMin) };
        const p2 = { x: x2, y: y(targetMin) };
        const c1 = { x: (x1 + midX) / 2, y: y((beforeMin + targetMin) / 2) + 18 };
        const c2 = { x: (midX + x2) / 2, y: y((beforeMin + targetMin) / 2) - 10 };
        const path = `M ${p1.x} ${p1.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p2.x} ${p2.y}`;
        function Badge({ left, top, text }) {
          return React.createElement('div', { style: { position: 'absolute', left, top, transform: 'translate(-50%, -100%)', background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.16)', borderRadius: 8, padding: '6px 8px', fontWeight: 800 } }, text);
        }
        return Block('', React.createElement('div', { style: { textAlign: 'center' } },
          React.createElement('div', { style: { fontWeight: 900, fontSize: 22, lineHeight: 1.25, margin: '6px 0 10px' } }, `D’après ton profil, tu atteindras ton objectif de tenir ${targetMin} min 🎉 d’ici le :`),
          React.createElement('div', { style: { fontWeight: 900, fontSize: 18, marginBottom: 12 } },
            React.createElement('span', { style: { borderBottom: '4px solid #FF4D00', padding: '0 8px 4px 8px' } }, eta)
          ),
          React.createElement('div', { style: { position: 'relative', background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.12)', padding: '10px 6px' } },
            React.createElement('svg', { viewBox: `0 0 ${W} ${H}`, style: { width: '100%', height: 180, display: 'block' } },
              // grid dashed lines
              React.createElement('g', { stroke: 'rgba(255,255,255,.2)', strokeDasharray: '4 6', strokeWidth: 1 },
                React.createElement('path', { d: `M 28 ${H * 0.2} H ${W - 28}` }),
                React.createElement('path', { d: `M 28 ${H * 0.4} H ${W - 28}` }),
                React.createElement('path', { d: `M 28 ${H * 0.6} H ${W - 28}` }),
                React.createElement('path', { d: `M 28 ${H * 0.8} H ${W - 28}` })
              ),
              // line path
              React.createElement('path', { d: path, fill: 'none', stroke: '#FF4D00', strokeWidth: 6, strokeLinecap: 'round' }),
              // points
              React.createElement('circle', { cx: p1.x, cy: p1.y, r: 8, fill: '#0E0E0F', stroke: '#FF4D00', strokeWidth: 4 }),
              React.createElement('circle', { cx: p2.x, cy: p2.y, r: 9, fill: '#FF4D00', stroke: '#FF4D00' })
            ),
            Badge({ left: `${(p1.x / W) * 100}%`, top: `${(p1.y / H) * 180}px`, text: `Aujourd’hui: ${beforeMin} min` }),
            Badge({ left: `${(p2.x / W) * 100}%`, top: `${(p2.y / H) * 180}px`, text: `${targetMin} min 🎉` })
          )
        ));
      })(),

      // Bloc protocole de rééducation
      Block('Obtiens dès maintenant :', (function () {
        function CheckItem(text) {
          return React.createElement('div', { style: { display: 'flex', alignItems: 'flex-start', gap: 12, padding: '4px 0' } },
            React.createElement('span', { style: { color: '#00D67A', fontSize: 20, lineHeight: 1 } }, '✅'),
            React.createElement('div', { style: { fontSize: 16, lineHeight: 1.5, opacity: .95 } }, text)
          );
        }
        return React.createElement('div', null,
          CheckItem("Accès à l'application Viril"),
          CheckItem("Exercices kegels adaptés à ton profil"),
          CheckItem("Progression en 5 minutes par jour"),
          CheckItem("Suivi automatique de tes performances"),
          CheckItem("Résultats visibles dès la 1ère semaine"),
          CheckItem("Protocole validé par + de 47 000 hommes")
        );
      })()),

      // Video App Viril
      React.createElement('div', { style: { margin: '40px 0', paddingTop: 18, borderTop: '1px solid rgba(255,255,255,.12)' } },
        React.createElement('div', { style: { fontWeight: 900, marginBottom: 14, fontSize: 22, letterSpacing: .2, textAlign: 'center' } }, 'Accède à notre application mobile'),
        React.createElement('div', { style: { marginTop: 20, marginBottom: 40, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,.1)' } },
          React.createElement('video', {
            src: '/videos/app_viril.mp4',
            autoPlay: true,
            loop: true,
            muted: true,
            playsInline: true,
            style: { width: '100%', display: 'block' }
          })
        )),




      // Bloc Avis — slider 6 avis, modulable (scroll-snap, user-controlled)
      (function () {
        const reviews = [
          { name: 'Thomas D.', text: "Après des années de frustration et de honte, j'ai enfin retrouvé confiance en moi. Ma femme et moi n'avons jamais été aussi heureux. Ce programme a sauvé mon couple.", stars: 5, verified: true, photo: '/images/reviews/1.png' },
          { name: 'Marc B.', text: "J'évitais les relations par peur de décevoir. Maintenant je peux tenir 15 minutes sans problème. Ma vie a changé, je me sens enfin un homme complet.", stars: 4, verified: true, photo: '/images/reviews/3.png' },
          { name: 'Sophie L.', text: "J'ai convaincu mon mari d'essayer après des mois de tension dans notre couple. Aujourd'hui je le vois épanoui, confiant... Notre intimité est revenue. Merci du fond du cœur.", stars: 5, verified: true },
          { name: 'Alexandre M.', text: "J'avais perdu espoir... En 3 semaines, je suis passé de 2 à 8 minutes. Je revis enfin et ma partenaire aussi. C'est comme si j'avais retrouvé ma virilité.", stars: 5, verified: true, photo: '/images/reviews/2.png' },
          { name: 'Lucas R.', text: "Les exercices sont simples mais efficaces. En 1 mois, mes érections sont plus dures et je contrôle parfaitement. Ma copine n'en revient pas du changement.", stars: 4, verified: true },
          { name: 'David P.', text: "À 45 ans, je pensais que c'était fini pour moi. Ce programme m'a prouvé le contraire. Je me sens comme à 25 ans, ma femme est aux anges.", stars: 5, verified: true, photo: '/images/reviews/4.png' }
        ];
        const [idx, setIdx] = React.useState(0);
        const scRef = React.useRef(null);
        function StarRow(n) {
          const stars = [];
          for (let i = 0; i < 5; i++) stars.push(React.createElement('span', { key: i, style: { color: i < n ? '#FFB020' : '#555', marginRight: 3, fontSize: 18 } }, '★'));
          return React.createElement('div', null, stars);
        }
        function Verified() {
          return React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 6, color: '#70E59C', fontWeight: 800, fontSize: 12 } },
            React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' },
              React.createElement('circle', { cx: 8, cy: 8, r: 7, stroke: '#70E59C', strokeWidth: 2 }),
              React.createElement('path', { d: 'M4.5 8.2l2.1 2.1L11.5 5.7', stroke: '#70E59C', strokeWidth: 2, fill: 'none', strokeLinecap: 'round' })
            ),
            'VÉRIFIÉ'
          );
        }
        function Card(r) {
          return React.createElement('div', { style: { width: '100%', boxSizing: 'border-box', padding: '12px' } },
            React.createElement('div', { style: { background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.16)', boxShadow: '0 10px 30px rgba(0,0,0,.25) inset', padding: '14px', borderRadius: 6 } },
              React.createElement('div', { style: { display: 'flex', alignItems: 'stretch', height: 56, gap: 12, padding: 0, background: 'rgba(0,0,0,.25)', border: '1px solid rgba(255,255,255,.1)', marginBottom: 10, overflow: 'hidden' } },
                r.photo
                  ? React.createElement('img', { src: r.photo, style: { height: '100%', width: 'auto', borderRadius: 0, objectFit: 'cover', borderRight: '1px solid rgba(255,255,255,.1)' }, alt: r.name })
                  : React.createElement('div', { style: { width: 56, height: '100%', background: '#2A2A2A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 20 } }, r.name.slice(0, 1)),
                React.createElement('div', { style: { fontWeight: 800, paddingLeft: 4, display: 'flex', alignItems: 'center' } }, r.name)
              ),
              React.createElement('div', { style: { fontSize: 18, lineHeight: 1.6, background: 'rgba(255,255,255,.08)', padding: '12px', borderRadius: 4, marginBottom: 12 } }, r.text),
              React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                StarRow(r.stars),
                r.verified && Verified()
              )
            )
          );
        }
        const containerStyle = {
          display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory', gap: 0,
          WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'none'
        };
        const onScroll = function (e) {
          const el = e.currentTarget;
          const perCard = el.scrollWidth / reviews.length;
          const i = Math.round(el.scrollLeft / perCard);
          if (i !== idx) setIdx(Math.max(0, Math.min(reviews.length - 1, i)));
        };
        const dotStyle = function (active) { return { width: 8, height: 8, borderRadius: 999, background: active ? '#FFFFFF' : 'rgba(255,255,255,.35)' }; };
        return Block('', React.createElement('div', null,
          React.createElement('div', { style: { textAlign: 'center', margin: '8px 0 14px' } },
            React.createElement('div', { style: { opacity: .9, fontWeight: 900 } }, 'Nous avons aidé'),
            React.createElement('div', { style: { fontSize: 32, fontWeight: 900, margin: '6px 0' } }, '+ de 47 000 hommes'),
            React.createElement('div', { style: { opacity: .8 } }, 'à retrouver une sexualité epanouie')
          ),
          React.createElement('div', { ref: scRef, onScroll: onScroll, style: containerStyle },
            reviews.map(function (r, i) {
              return React.createElement('div', { key: i, style: { flex: '0 0 86%', margin: '0 7%', scrollSnapAlign: 'center' } }, Card(r));
            })
          ),
          React.createElement('div', { style: { display: 'flex', justifyContent: 'center', gap: 10, marginTop: 10 } },
            reviews.map(function (_, i) {
              return React.createElement('span', {
                key: i, onClick: function () {
                  try {
                    const el = scRef.current; if (!el) { setIdx(i); return; }
                    const perCard = el.scrollWidth / reviews.length; el.scrollTo({ left: i * perCard, behavior: 'smooth' }); setIdx(i);
                  } catch (_) { setIdx(i); }
                }, style: Object.assign({ cursor: 'pointer' }, dotStyle(i === idx))
              });
            })
          )
        ));
      })(),

      // Section urgence - Pourquoi agir maintenant
      // Section urgence removed as requested

      // Block 7: Choisir ton plan — design cartes radio comme screenshot (sans radius)
      (function () {
        function Radio({ active }) {
          return React.createElement('span', { style: { display: 'inline-block', width: 20, height: 20, border: '2px solid ' + (active ? '#FF4D00' : '#7D828A'), borderRadius: 999, position: 'relative' } },
            active && React.createElement('span', { style: { position: 'absolute', left: 3, top: 3, width: 14, height: 14, borderRadius: 999, background: '#FF4D00' } })
          );
        }
        function Row({ id, title, totalEUR, perDayEUR, popular }) {
          const active = plan === id;
          return React.createElement('div', { onClick: function () { setPlan(id); }, style: { cursor: 'pointer', margin: '12px 0', padding: '16px 14px', background: 'rgba(255,255,255,.03)', border: (active ? '2px solid #FF4D00' : '1px solid rgba(255,255,255,.18)'), borderRadius: 0, boxSizing: 'border-box', overflow: 'hidden' } },
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: 12, minWidth: 0 } },
              React.createElement(Radio, { active }),
              React.createElement('div', { style: { minWidth: 0 } },
                (id === '12w'
                  ? React.createElement('div', { style: { fontWeight: 900, letterSpacing: .1, fontSize: 16, lineHeight: 1.1, textTransform: 'uppercase' } },
                    React.createElement('span', null, '12 semaines'),
                  )
                  : React.createElement('div', { style: { fontWeight: 900, letterSpacing: .1, fontSize: 16, lineHeight: 1.05, textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, title)
                ),
                React.createElement('div', { style: { opacity: .75, marginTop: 8, fontSize: 16 } }, `${totalEUR.toFixed(2)} EUR`)
              ),
              React.createElement('div', { style: { textAlign: 'right', minWidth: 0, whiteSpace: 'nowrap' } },
                React.createElement('div', { style: { display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: 6 } },
                  React.createElement('span', { style: { fontWeight: 900, fontSize: 26 } }, perDayEUR.toFixed(2)),
                  React.createElement('span', { style: { opacity: .75, fontSize: 12, textTransform: 'uppercase', letterSpacing: .5 } }, 'EUR')
                ),
                React.createElement('div', { style: { opacity: .75, marginTop: 4, fontSize: 14 } }, 'par jour')
              )
            ),
            popular && React.createElement('div', { style: { marginTop: 14, marginLeft: -16, marginRight: -16, marginBottom: -16, background: '#FF4D00', color: '#FFFFFF', textAlign: 'center', fontWeight: 900, padding: '6px 0', letterSpacing: .6, pointerEvents: 'none', fontSize: 11 } }, 'LE PLUS POPULAIRE')
          );
        }
        return Block(React.createElement('span', { style: { fontSize: 32 } }, (firstName ? firstName + ', ' : '') + 'voici nos plans pour toi'), React.createElement('div', { id: 'plan-section', style: { scrollMarginTop: 80 } },
          Row({ id: 'trial', title: `1 semaine d’essai`, totalEUR: 6.99, perDayEUR: 0.99 }),
          Row({ id: '4w', title: '4 semaines', totalEUR: 15.19, perDayEUR: 0.49, popular: true }),
          Row({ id: '12w', title: '12 semaines', totalEUR: 25.99, perDayEUR: 0.29 }),
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 12, marginTop: 12 } },
            React.createElement('div', { style: { color: '#FF7A1A', fontSize: 22 } }, '💪'),
            React.createElement('div', null,
              React.createElement('div', { style: { fontWeight: 700, lineHeight: 1.4, fontSize: 15, opacity: .95 } }, 'Les personnes utilisant le plan pendant 3 mois obtiennent 2 fois plus de résultats'),
              React.createElement('div', { style: { opacity: .6, fontSize: 11, marginTop: 6 } }, '*Selon une étude interne réalisée en 2022')
            )
          ),
          React.createElement('div', { style: { marginTop: 16, display: 'flex', justifyContent: 'center' } },
            React.createElement('button', {
              className: 'btn primary', style: { width: '100%', borderRadius: 0, padding: '16px 20px', color: '#FFFFFF', fontWeight: 900, background: '#FF4D00', fontSize: 18, border: 'none', cursor: 'pointer' }, onClick: function () {
                try { if (window && window.dataLayer) { window.dataLayer.push({ event: 'select_plan', plan }); } } catch (_) { }
                try { if (window.checkout && typeof window.checkout.beginCheckoutForPlan === 'function') { window.checkout.beginCheckoutForPlan(String(plan)); return; } } catch (_) { }
                var targetUrl = '/construction';
                try { var u = new URL(window.location.origin + '/construction'); try { var langParam = new URL(window.location.href).searchParams.get('lang'); if (langParam) u.searchParams.set('lang', langParam); } catch (_) { } if (plan) u.searchParams.set('plan', String(plan)); targetUrl = u.toString(); } catch (_) { }
                try { window.location.replace(targetUrl); } catch (_) { window.location.href = targetUrl; }
              }
            }, 'Obtenir mon plan')
          )
        ));
      })(),
      // Bloc garantie 30 jours — design carte avec badge
      (function () {
        function RefundBadge() {
          return React.createElement('svg', { width: 120, height: 120, viewBox: '0 0 120 120', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' },
            React.createElement('circle', { cx: 60, cy: 60, r: 52, stroke: '#FF7A1A', strokeWidth: 6, fill: 'none' }),
            React.createElement('circle', { cx: 60, cy: 60, r: 40, stroke: '#FF7A1A', strokeWidth: 2, fill: 'none', strokeDasharray: '6 6' }),
            React.createElement('text', { x: 60, y: 70, textAnchor: 'middle', fontSize: '42', fontWeight: '900', fill: '#FFFFFF' }, '30')
          );
        }
        const textStyle = { fontSize: 18, lineHeight: 1.6 };
        return React.createElement('div', { style: { margin: '18px 0', padding: '18px', border: '1px solid rgba(255,255,255,.18)', background: 'rgba(255,255,255,.02)' } },
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'start', gap: 16 } },
            React.createElement('div', null,
              React.createElement('div', { style: { fontWeight: 900, fontSize: 26, lineHeight: 1.2, marginBottom: 8 } }, 'Politique de remboursement garanti'),
              React.createElement('div', { style: Object.assign({}, textStyle, { marginTop: 10 }) },
                'Nous pensons que notre plan peut fonctionner pour toi et que tu obtiendras des résultats visibles en 4 semaines ! Nous sommes même prêts à te rembourser intégralement dans les 30 jours suivant l\'achat si tu n\'obtiens pas de résultats visibles et peux démontrer que tu as suivi notre plan.'
              )
            ),
            React.createElement('div', null, RefundBadge())
          )
        );
      })()
    );
  }
  window.__registerQuestionComponent('lp_new', ResultsSale);
})();