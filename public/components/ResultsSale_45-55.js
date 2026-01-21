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

        function formatMinutesLabel(min) {
            try {
                const n = Number(min);
                if (!Number.isFinite(n)) return 'quelques minutes';
                return n === 1 ? '1 minute' : `${n} minutes`;
            } catch (_) { return 'quelques minutes'; }
        }
        const TitleEl = (function () {
            const label = formatMinutesLabel(beforeMin);
            return React.createElement(React.Fragment, null,
                React.createElement('span', null, 'Plus jamais '),
                React.createElement('span', { style: { fontStyle: 'italic' } }, '"désolé"'),
                React.createElement('span', null, ' après '),
                React.createElement('span', null, label),
                React.createElement('span', null, '...'),
                React.createElement('br'),
                React.createElement('span', { style: { opacity: .95, fontSize: 26, fontWeight: 550 } }, 'Ton plan personnalisé pour la faire jouir (enfin) avant toi.')
            );
        })();
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

        const eta = (function () { const d = new Date(); d.setDate(d.getDate() + 84); return d.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' }); })();

        // Scroll to plans section
        const scrollToPlans = function () {
            const planSection = document.getElementById('plan-section');
            if (planSection) {
                planSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        };

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

            // Logo just above main headline
            React.createElement('div', { style: { margin: '0 0 0px 0px' } },
                React.createElement('img', { src: '/viril-logo.svg', alt: 'Viril', style: { height: 28, opacity: .95 } })
            ),

            React.createElement('h2', { style: { margin: '8px 0 18px', lineHeight: 1.25, fontWeight: 900, letterSpacing: .2 } }, TitleEl),

            // PHASE 1: AGITATION - Section d'empathie émotionnelle adaptée 45-55 ans
            React.createElement('div', { style: { background: 'rgba(255,0,0,.08)', border: '1px solid rgba(255,0,0,.2)', padding: '16px', margin: '20px 0', borderRadius: 8 } },
                React.createElement('div', { style: { fontSize: 20, fontWeight: 700, marginBottom: 12, color: '#FF6B6B' } },
                    'Si tu reconnais ces signes...'
                ),
                React.createElement('div', { style: { fontSize: 16, lineHeight: 1.8, opacity: .9 } },
                    React.createElement('div', { style: { marginBottom: 8 } }, '• Cette angoisse qui monte avant chaque rapport'),
                    React.createElement('div', { style: { marginBottom: 8 } }, '• Cette honte écrasante juste après'),
                    React.createElement('div', { style: { marginBottom: 8 } }, '• La peur qu\'elle te quitte'),
                    React.createElement('div', { style: { marginBottom: 8 } }, '• Les excuses que tu inventes pour éviter l\'intimité')
                ),
                React.createElement('div', { style: { marginTop: 16, fontSize: 18, fontWeight: 800, textAlign: 'center' } },
                    '1 homme sur 3 est concerné.'
                ),
                React.createElement('div', { style: { marginTop: 8, fontSize: 16, textAlign: 'center', opacity: .8 } },
                    'Tu n\'es pas seul.'
                )
            ),

            // Témoignage douleur précoce adapté pour 45-55 ans
            React.createElement('div', { style: { background: 'rgba(0,0,0,.3)', padding: '14px', margin: '20px 0', borderLeft: '4px solid #FF4D00' } },
                React.createElement('div', { style: { fontSize: 16, lineHeight: 1.6, fontStyle: 'italic', marginBottom: 8 } },
                    '"J\'évitais de faire l\'amour à ma femme parce que j\'avais peur de la décevoir. Je voyais bien qu\'elle disait rien après. On faisait comme si c\'était normal..."',
                ),
                React.createElement('div', { style: { fontSize: 14, fontWeight: 700 } }, '- Thierry D. (47 ans), avant le programme')
            ),

            // PHASE 2: DIAGNOSTIC - Résumé personnel basé sur tes réponses
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
                const profileLabel = profile === 'Hypertonique'
                    ? 'Périnée : Hypertonique'
                    : 'Périnée : Hypotonique';
                const profileDesc = (profile === 'Hypertonique'
                    ? 'Ça signifie que ton périnée reste contracté en permanence, déjà tendu à 80%. Il suffit d\'une légère excitation pour qu\'il atteigne 100% et déclenche le réflexe éjaculatoire.\n\nTu n\'as pas de marge de contrôle. Le muscle est trop proche du point de non retour avant même de commencer. C\'est ce qui fait que ça arrive si vite, systématiquement.'
                    : 'Ça signifie que ton périnée est trop faible.\n\nQuand le périnée manque de tonicité, il ne peut plus réguler correctement le réflexe éjaculatoire. Le muscle n\'a pas la force nécessaire pour maintenir le contrôle.\n\nLe réflexe se déclenche alors de manière involontaire et rapide, bien avant que tu ne le souhaites.\n\nC\'est ce manque de force musculaire qui explique pourquoi ça arrive si vite, systématiquement.');
                const pct = Math.max(0, Math.min(100, Math.round((beforeMin / 15) * 100)));
                return Block('D\'après tes réponses, voici ton diagnostic personnel', React.createElement('div', {
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
                    React.createElement('div', { style: { marginTop: 16, color: '#FF6B6B', fontWeight: 900, fontSize: 20 } }, profileLabel),
                    React.createElement('div', { style: { opacity: .9, marginTop: 8, lineHeight: 1.6, fontSize: 16, whiteSpace: 'pre-line' } }, profileDesc),
                    React.createElement('div', { style: { marginTop: 12, padding: '10px', background: 'rgba(255,100,0,.1)', border: '1px solid rgba(255,100,0,.3)', borderRadius: 6 } },
                        React.createElement('div', { style: { fontWeight: 700, color: '#FF6B6B' } }, '⚠️ Ce qu\'il faut savoir :'),
                        React.createElement('div', { style: { fontSize: 14, marginTop: 4, lineHeight: 1.5 } },
                            'Sans action, ce problème empire avec l\'âge. La bonne nouvelle ? C\'est réversible avec la bonne méthode.'
                        )
                    )
                ));
            })(),

            // Le vrai problème - Version conditionnelle selon profil
            (function(){
                function computeProfile(a){
                    let hyper=0, hypo=0;
                    if (a['hx_sport_core']==='often') hyper++; else if (a['hx_sport_core']==='never') hypo++;
                    if (a['hx_ejac_precoce_always']==='yes') hyper++;
                    if (a['hx_erection_difficulty']==='yes' || a['hx_erection_difficulty']==='sometimes') hypo++;
                    if (a['hx_urine_leak']==='yes') hypo++;
                    if (a['hx_post_act_feel']==='fatigue') hyper++; else if (a['hx_post_act_feel']==='relaxed') hypo++;
                    if (a['hx_tension_pattern']==='tense') hyper++; else if (a['hx_tension_pattern']==='relaxed') hypo++;
                    if (a['hx_penetration_sensation']==='yes') hypo++;
                    return hyper>=hypo ? 'Hypertonique' : 'Hypotonique';
                }
                const profile = computeProfile(answers);
                const isHyper = profile === 'Hypertonique';
                
                return React.createElement('div', { style: { margin: '34px 0' } },
                    React.createElement('div', { style: { fontSize: 22, fontWeight: 900, marginBottom: 18, textAlign: 'center' } },
                        'Le vrai problème'
                    ),
                    React.createElement('div', { style: { background: 'rgba(255,255,255,.04)', padding: '14px', marginBottom: 10, borderRadius: 6 } },
                        React.createElement('div', { style: { fontSize: 15, fontWeight: 700, marginBottom: 10, color: '#00D67A' } },
                            '✓ Un homme qui tient longtemps : ' + (isHyper ? 'monte progressivement' : 'a un périnée tonique')
                        ),
                        React.createElement('div', { style: { height: 8, background: 'rgba(255,255,255,.08)', borderRadius: 4, overflow: 'hidden' } },
                            React.createElement('div', { style: { width: '50%', height: '100%', background: 'linear-gradient(90deg, #00D67A, #34D399)' } })
                        )
                    ),
                    React.createElement('div', { style: { background: 'rgba(255,0,0,.08)', border: '1px solid rgba(255,0,0,.2)', padding: '14px', borderRadius: 6, marginBottom: 16 } },
                        React.createElement('div', { style: { fontSize: 15, fontWeight: 700, marginBottom: 10, color: '#FF6B6B' } },
                            isHyper 
                                ? '✗ Toi : tu démarres déjà à 80% → 100% en quelques secondes'
                                : '✗ Toi : ton périnée est trop faible pour retenir'
                        ),
                        React.createElement('div', { style: { height: 8, background: 'rgba(255,255,255,.08)', borderRadius: 4, overflow: 'hidden' } },
                            React.createElement('div', { style: { width: '100%', height: '100%', background: 'linear-gradient(90deg, #EF4444, #FF3B30)' } })
                        )
                    ),
                    React.createElement('div', { style: { fontSize: 19, fontWeight: 900, textAlign: 'center', lineHeight: 1.4 } },
                        React.createElement('div', null, 'Tu n\'es pas mauvais au lit.'),
                        React.createElement('div', { style: { color: '#FF7A3C', marginTop: 6 } }, 'Ton corps est juste mal réglé.')
                    )
                );
            })(),

            // La solution Reset 30™ - Version conditionnelle
            (function(){
                function computeProfile(a){
                    let hyper=0, hypo=0;
                    if (a['hx_sport_core']==='often') hyper++; else if (a['hx_sport_core']==='never') hypo++;
                    if (a['hx_ejac_precoce_always']==='yes') hyper++;
                    if (a['hx_erection_difficulty']==='yes' || a['hx_erection_difficulty']==='sometimes') hypo++;
                    if (a['hx_urine_leak']==='yes') hypo++;
                    if (a['hx_post_act_feel']==='fatigue') hyper++; else if (a['hx_post_act_feel']==='relaxed') hypo++;
                    if (a['hx_tension_pattern']==='tense') hyper++; else if (a['hx_tension_pattern']==='relaxed') hypo++;
                    if (a['hx_penetration_sensation']==='yes') hypo++;
                    return hyper>=hypo ? 'Hypertonique' : 'Hypotonique';
                }
                const profile = computeProfile(answers);
                const isHyper = profile === 'Hypertonique';
                
                return React.createElement('div', { style: { background: 'linear-gradient(135deg, rgba(0,214,122,.1), rgba(0,182,103,.05))', border: '2px solid rgba(0,214,122,.3)', padding: '20px', margin: '34px 0', borderRadius: 8 } },
                    React.createElement('div', { style: { fontSize: 24, fontWeight: 900, textAlign: 'center', marginBottom: 10, color: '#00D67A' } },
                        'La solution : Reset 30™'
                    ),
                    React.createElement('div', { style: { fontSize: 16, lineHeight: 1.7, marginBottom: 20, textAlign: 'center' } },
                        isHyper 
                            ? 'Pour durer 10-15 minutes (ou plus), tu dois réparer deux choses :'
                            : 'Pour durer 10-15 minutes (ou plus), tu dois renforcer ton périnée :'
                    ),
                    React.createElement('div', { style: { display: 'grid', gap: 14 } },
                        isHyper ? (
                            React.createElement(React.Fragment, null,
                                React.createElement('div', { style: { background: 'rgba(255,255,255,.06)', padding: '14px', borderRadius: 6, borderLeft: '4px solid #00D67A' } },
                                    React.createElement('div', { style: { fontSize: 18, fontWeight: 900, marginBottom: 6, color: '#00D67A' } }, '1. Ton point de départ'),
                                    React.createElement('div', { style: { fontSize: 15, opacity: .9 } }, 'Passer de "déjà tendu" à "posé, détendu".')
                                ),
                                React.createElement('div', { style: { background: 'rgba(255,255,255,.06)', padding: '14px', borderRadius: 6, borderLeft: '4px solid #00D67A' } },
                                    React.createElement('div', { style: { fontSize: 18, fontWeight: 900, marginBottom: 6, color: '#00D67A' } }, '2. Ta vitesse de montée'),
                                    React.createElement('div', { style: { fontSize: 15, opacity: .9 } }, 'Passer de 5 secondes à plusieurs minutes.')
                                )
                            )
                        ) : (
                            React.createElement(React.Fragment, null,
                                React.createElement('div', { style: { background: 'rgba(255,255,255,.06)', padding: '14px', borderRadius: 6, borderLeft: '4px solid #00D67A' } },
                                    React.createElement('div', { style: { fontSize: 18, fontWeight: 900, marginBottom: 6, color: '#00D67A' } }, '1. Renforcer la base'),
                                    React.createElement('div', { style: { fontSize: 15, opacity: .9 } }, 'Donner au périnée la force nécessaire pour retenir.')
                                ),
                                React.createElement('div', { style: { background: 'rgba(255,255,255,.06)', padding: '14px', borderRadius: 6, borderLeft: '4px solid #00D67A' } },
                                    React.createElement('div', { style: { fontSize: 18, fontWeight: 900, marginBottom: 6, color: '#00D67A' } }, '2. Développer le contrôle'),
                                    React.createElement('div', { style: { fontSize: 15, opacity: .9 } }, 'Apprendre à gérer le réflexe volontairement.')
                                )
                            )
                        )
                    ),
                    React.createElement('div', { style: { marginTop: 20, padding: '16px', background: 'rgba(0,0,0,.2)', borderRadius: 6 } },
                        React.createElement('div', { style: { fontSize: 17, fontWeight: 700, marginBottom: 12 } }, 'Comment ça marche :'),
                        React.createElement('div', { style: { display: 'grid', gap: 10 } },
                            isHyper ? (
                                React.createElement(React.Fragment, null,
                                    React.createElement('div', { style: { display: 'flex', gap: 10, alignItems: 'start' } },
                                        React.createElement('div', { style: { fontSize: 20, minWidth: 32 } }, '💆'),
                                        React.createElement('div', null,
                                            React.createElement('div', { style: { fontWeight: 800, fontSize: 15 } }, 'Étape 1 : Détension'),
                                            React.createElement('div', { style: { fontSize: 14, opacity: .85, marginTop: 2 } }, 'On déprogramme la tension chronique du périnée.')
                                        )
                                    ),
                                    React.createElement('div', { style: { display: 'flex', gap: 10, alignItems: 'start' } },
                                        React.createElement('div', { style: { fontSize: 20, minWidth: 32 } }, '🔧'),
                                        React.createElement('div', null,
                                            React.createElement('div', { style: { fontWeight: 800, fontSize: 15 } }, 'Étape 2 : Recalibrage'),
                                            React.createElement('div', { style: { fontSize: 14, opacity: .85, marginTop: 2 } }, 'On transforme ta montée explosive en montée progressive.')
                                        )
                                    ),
                                    React.createElement('div', { style: { display: 'flex', gap: 10, alignItems: 'start' } },
                                        React.createElement('div', { style: { fontSize: 20, minWidth: 32 } }, '⚡'),
                                        React.createElement('div', null,
                                            React.createElement('div', { style: { fontWeight: 800, fontSize: 15 } }, 'Étape 3 : Automatisation'),
                                            React.createElement('div', { style: { fontSize: 14, opacity: .85, marginTop: 2 } }, 'Ton corps adopte ce nouveau fonctionnement naturellement.')
                                        )
                                    )
                                )
                            ) : (
                                React.createElement(React.Fragment, null,
                                    React.createElement('div', { style: { display: 'flex', gap: 10, alignItems: 'start' } },
                                        React.createElement('div', { style: { fontSize: 20, minWidth: 32 } }, '💪'),
                                        React.createElement('div', null,
                                            React.createElement('div', { style: { fontWeight: 800, fontSize: 15 } }, 'Étape 1 : Renforcement de base'),
                                            React.createElement('div', { style: { fontSize: 14, opacity: .85, marginTop: 2 } }, 'On reconstruit la force musculaire du périnée.')
                                        )
                                    ),
                                    React.createElement('div', { style: { display: 'flex', gap: 10, alignItems: 'start' } },
                                        React.createElement('div', { style: { fontSize: 20, minWidth: 32 } }, '🎯'),
                                        React.createElement('div', null,
                                            React.createElement('div', { style: { fontWeight: 800, fontSize: 15 } }, 'Étape 2 : Contrôle progressif'),
                                            React.createElement('div', { style: { fontSize: 14, opacity: .85, marginTop: 2 } }, 'Tu apprends à contracter volontairement pour retenir.')
                                        )
                                    ),
                                    React.createElement('div', { style: { display: 'flex', gap: 10, alignItems: 'start' } },
                                        React.createElement('div', { style: { fontSize: 20, minWidth: 32 } }, '🔒'),
                                        React.createElement('div', null,
                                            React.createElement('div', { style: { fontWeight: 800, fontSize: 15 } }, 'Étape 3 : Endurance'),
                                            React.createElement('div', { style: { fontSize: 14, opacity: .85, marginTop: 2 } }, 'Ton périnée tient la retenue aussi longtemps que nécessaire.')
                                        )
                                    )
                                )
                            )
                        )
                    ),
                    React.createElement('div', { style: { marginTop: 20, padding: '14px', background: 'rgba(0,214,122,.15)', border: '1px solid rgba(0,214,122,.3)', borderRadius: 6 } },
                        React.createElement('div', { style: { fontSize: 18, fontWeight: 900, textAlign: 'center', marginBottom: 8, color: '#00D67A' } },
                            'Résultat'
                        ),
                        React.createElement('div', { style: { fontSize: 16, textAlign: 'center', lineHeight: 1.7 } },
                            isHyper 
                                ? 'Tu démarres détendu. Tu montes lentement.'
                                : 'Ton périnée est fort. Tu contrôles le réflexe.',
                            React.createElement('br'),
                            React.createElement('span', { style: { fontWeight: 900, color: '#00D67A' } }, 'Tu tiens 10-15 minutes, naturellement.')
                        )
                    )
                );
            })(),

            // Bloc "Ce que tu vas recevoir"
            React.createElement('div', { style: { margin: '40px 0', padding: '0' } },
                React.createElement('div', { style: { fontSize: 24, fontWeight: 900, marginBottom: 20, textAlign: 'center', color: '#FFFFFF' } },
                    'Ce que tu vas recevoir'
                ),
                React.createElement('div', { style: { display: 'grid', gap: 18, maxWidth: 600, margin: '0 auto' } },
                    React.createElement('div', { style: { display: 'flex', gap: 12, alignItems: 'start' } },
                        React.createElement('div', { style: { color: '#00D67A', fontSize: 20, minWidth: 24, marginTop: 2 } }, '✓'),
                        React.createElement('div', null,
                            React.createElement('div', { style: { fontSize: 17, fontWeight: 800, marginBottom: 6 } }, 'Accès à une app mobile (discrète et privée)'),
                            React.createElement('div', { style: { fontSize: 15, lineHeight: 1.6, opacity: .85 } },
                                'Tout est dedans : entraînements, explications, suivi.',
                            )
                        )
                    ),
                    React.createElement('div', { style: { display: 'flex', gap: 12, alignItems: 'start' } },
                        React.createElement('div', { style: { color: '#00D67A', fontSize: 20, minWidth: 24, marginTop: 2 } }, '✓'),
                        React.createElement('div', null,
                            React.createElement('div', { style: { fontSize: 17, fontWeight: 800, marginBottom: 6 } }, 'Un programme sur-mesure progressif'),
                            React.createElement('div', { style: { fontSize: 15, lineHeight: 1.6, opacity: .85 } },
                                'Chaque semaine débloque de nouveaux exercices.',
                                React.createElement('br'),
                                'Tu sais exactement quoi faire, quand, et comment.'
                            )
                        )
                    ),
                    React.createElement('div', { style: { display: 'flex', gap: 12, alignItems: 'start' } },
                        React.createElement('div', { style: { color: '#00D67A', fontSize: 20, minWidth: 24, marginTop: 2 } }, '✓'),
                        React.createElement('div', null,
                            React.createElement('div', { style: { fontSize: 17, fontWeight: 800, marginBottom: 6 } }, 'Un suivi de progression précis'),
                            React.createElement('div', { style: { fontSize: 15, lineHeight: 1.6, opacity: .85 } },
                                'Tu vois ton évolution semaine après semaine.',
                                React.createElement('br'),
                                'Tu sais quand tu avances — et pourquoi ça marche.'
                            )
                        )
                    )
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

                    // Bande visuelle haut: deux photos côte à côté
                    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, marginBottom: 8 } },
                        React.createElement('div', { style: { height: 160, overflow: 'hidden', background: 'transparent' } },
                            React.createElement('img', { src: '/triste.png', alt: 'homme stressé', style: { width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center bottom', display: 'block', backgroundColor: 'transparent' } })
                        ),
                        React.createElement('div', { style: { height: 160, overflow: 'hidden', background: 'transparent' } },
                            React.createElement('img', { src: '/confiant.png', alt: 'homme confiant', style: { width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center bottom', display: 'block', backgroundColor: 'transparent' } })
                        )
                    ),
                    // Légendes et métriques
                    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 } },
                        React.createElement('div', { style: { padding: '10px 12px', background: 'rgba(255,0,0,.06)', borderTop: '1px solid rgba(255,255,255,.12)', borderRight: '1px solid rgba(255,255,255,.12)', borderBottom: '1px solid rgba(255,255,255,.12)' } },
                            React.createElement('div', { style: { fontWeight: 900, color: '#FF6B6B' } }, 'Ta frustration actuelle')
                        ),
                        React.createElement('div', { style: { padding: '10px 12px', background: 'rgba(0,255,100,.06)', borderTop: '1px solid rgba(255,255,255,.12)', borderBottom: '1px solid rgba(255,255,255,.12)' } },
                            React.createElement('div', { style: { fontWeight: 900, color: '#00D67A' } }, 'L\'homme que tu vas devenir')
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
                            React.createElement('div', { style: { color: '#00D67A', fontWeight: 900, marginBottom: 8 } }, `${targetMin}+ min 💪`),
                            React.createElement('div', { style: { opacity: .9, marginBottom: 4 } }, 'Satisfaction partenaire'),
                            SegBar({ percent: sat(targetMin), color: '#00B67A' }),
                            React.createElement('div', { style: { fontSize: 12, color: '#00D67A', marginTop: 4 } }, 'Elle te désire vraiment'),
                            React.createElement('div', { style: { opacity: .9, marginTop: 12, marginBottom: 4 } }, 'État mental'),
                            React.createElement('div', { style: { fontSize: 14, color: '#00D67A' } }, 'Confiant, viril')
                        )
                    )
                );
            })(),


            // Bénéfices concrets sur ta vie - adaptés pour 45-55 ans
            Block('Ce qui va changer dans ton couple', (function () {
                function CheckIcon() {
                    return React.createElement('svg', { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' },
                        React.createElement('circle', { cx: 12, cy: 12, r: 9.5, stroke: '#00D67A', strokeWidth: 3, fill: 'none' }),
                        React.createElement('path', { d: 'M7 12.5l3.2 3.2L17 9.8', stroke: '#00D67A', strokeWidth: 3, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' })
                    );
                }
                function Item(text, subtext) {
                    return React.createElement('div', { style: { display: 'flex', alignItems: 'flex-start', gap: 12, padding: '8px 0' } },
                        CheckIcon(),
                        React.createElement('div', null,
                            React.createElement('div', { style: { fontSize: 18, lineHeight: 1.3, fontWeight: 700, opacity: .95 } }, text),
                            subtext && React.createElement('div', { style: { fontSize: 14, opacity: .7, marginTop: 2 } }, subtext)
                        )
                    );
                }
                return React.createElement('div', null,
                    Item('Sentir que ton couple revit', 'parce qu\'elle te regarde différemment'),
                    Item('Retrouver de la complicité', 'Assume pleinement ta sexualité'),
                    Item('Redevenir l\'homme qu\'elle a choisi', 'Pas celui qu\'elle ne désire pas')
                );
            })()),

            // Preuve sociale avec témoignages - adaptés pour 45-55 ans
            (function () {
                const reviews = [
                    { name: 'Thierry D., 48 ans - Lyon', text: "J'évitais ma femme depuis des mois. Après 4 semaines d'exercices (5 min le matin dans la douche), je suis passé de 2-3 minutes à environ 8-9 minutes. C'est pas miraculeux mais ça change vraiment la dynamique du couple.", stars: 4, verified: true },
                    { name: 'Philippe M., 52 ans - Bordeaux', text: "Marié depuis 28 ans. Les exercices de respiration m'ont le plus aidé. Je fais ça discrètement au bureau. Résultat : je tiens maintenant 10-12 minutes au lieu de 3-4. Ma femme a remarqué sans que je dise rien.", stars: 5, verified: true },
                    { name: 'Christine L., 49 ans - Nantes', text: "Mon mari (51 ans) faisait les exercices tous les matins pendant que je préparais le café. Au bout de 5 semaines, j'ai senti qu'il était plus confiant au lit. On en a parlé et il m'a montré l'app. Ça marche vraiment.", stars: 5, verified: true },
                    { name: 'Bernard R., 47 ans - Toulouse', text: "Sceptique au début. J'ai commencé doucement, 3-4 fois par semaine. Après 3 semaines, première amélioration : je passe de 2 min à 6-7 min. Pas encore l'objectif mais déjà un gros soulagement psychologique.", stars: 4, verified: true },
                    { name: 'Jean-Luc P., 54 ans - Lille', text: "À mon âge je pensais que c'était mort. Les exercices sont vraiment discrets (je les fais même en réunion Zoom). 7 semaines plus tard : je tiens facilement 10 minutes. Ça parait peu mais pour moi c'est énorme.", stars: 4, verified: true },
                    { name: 'Marc T., 50 ans - Marseille', text: "Divorcé, nouvelle relation à 50 ans. La pression était énorme. Le programme m'a aidé surtout sur le mental. Niveau physique je suis passé de 3 min à 9-10 min en 6 semaines. Elle a rien dit mais je vois la différence.", stars: 5, verified: true }
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
                            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', background: 'rgba(0,0,0,.25)', border: '1px solid rgba(255,255,255,.1)', marginBottom: 10 } },
                                React.createElement('div', { style: { width: 28, height: 28, borderRadius: 999, overflow: 'hidden', background: '#2A2A2A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 } }, r.name.slice(0, 1)),
                                React.createElement('div', { style: { fontWeight: 800 } }, r.name)
                            ),
                            React.createElement('div', { style: { fontSize: 16, lineHeight: 1.6, background: 'rgba(255,255,255,.08)', padding: '12px', borderRadius: 4, marginBottom: 12 } }, r.text),
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
                        React.createElement('div', { style: { opacity: .9, fontWeight: 900 } }, 'Tu ne seras pas le premier'),
                        React.createElement('div', { style: { fontSize: 32, fontWeight: 900, margin: '6px 0' } }, 'Des centaines d\'hommes de 45-55 ans'),
                        React.createElement('div', { style: { opacity: .8 } }, 'ont déjà prouvé que l\'âge n\'est pas une excuse')
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




            // PHASE 5: ACTION - Choix du plan
            (function () {
                function Radio({ active }) {
                    return React.createElement('span', { style: { display: 'inline-block', width: 20, height: 20, border: '2px solid ' + (active ? '#00D67A' : '#7D828A'), borderRadius: 999, position: 'relative' } },
                        active && React.createElement('span', { style: { position: 'absolute', left: 3, top: 3, width: 14, height: 14, borderRadius: 999, background: '#00D67A' } })
                    );
                }
                function Row({ id, title, totalEUR, perDayEUR, popular, savings }) {
                    const active = plan === id;
                    const originalTotal = totalEUR * 1.2; // 20% more expensive original price
                    const originalPerDay = perDayEUR * 1.2;
                    return React.createElement('div', { onClick: function () { setPlan(id); }, style: { cursor: 'pointer', margin: '12px 0', padding: '16px 14px', background: 'rgba(255,255,255,.03)', border: (active ? '2px solid #00D67A' : '1px solid rgba(255,255,255,.18)'), borderRadius: 0, boxSizing: 'border-box', overflow: 'hidden', position: 'relative' } },
                        savings && React.createElement('div', { style: { position: 'absolute', top: 0, right: 20, background: '#FF4D00', color: '#FFFFFF', padding: '4px 12px', fontSize: 12, fontWeight: 900, borderRadius: '0 0 6px 6px' } }, savings),
                        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: 12, minWidth: 0 } },
                            React.createElement(Radio, { active }),
                            React.createElement('div', { style: { minWidth: 0 } },
                                React.createElement('div', { style: { fontWeight: 900, letterSpacing: .1, fontSize: 16, lineHeight: 1.1, textTransform: 'uppercase' } }, title),
                                React.createElement('div', { style: { marginTop: 8, display: 'flex', alignItems: 'baseline', gap: 8 } },
                                    React.createElement('span', { style: { fontSize: 16, fontWeight: 700, color: '#00D67A' } }, `${totalEUR.toFixed(2)} EUR`),
                                    React.createElement('span', { style: { fontSize: 14, textDecoration: 'line-through', opacity: .5 } }, `${originalTotal.toFixed(2)} EUR`)
                                )
                            ),
                            React.createElement('div', { style: { textAlign: 'right', minWidth: 0, whiteSpace: 'nowrap' } },
                                React.createElement('div', { style: { display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: 6 } },
                                    React.createElement('span', { style: { fontWeight: 900, fontSize: 26, color: '#00D67A' } }, perDayEUR.toFixed(2)),
                                    React.createElement('span', { style: { opacity: .75, fontSize: 12, textTransform: 'uppercase', letterSpacing: .5 } }, 'EUR')
                                ),
                                React.createElement('div', { style: { display: 'flex', alignItems: 'baseline', gap: 6, justifyContent: 'flex-end' } },
                                    React.createElement('span', { style: { opacity: .75, fontSize: 14 } }, 'par jour'),
                                    React.createElement('span', { style: { fontSize: 12, textDecoration: 'line-through', opacity: .4 } }, `(${originalPerDay.toFixed(2)}€)`)
                                )
                            )
                        ),
                        popular && React.createElement('div', { style: { marginTop: 14, marginLeft: -16, marginRight: -16, marginBottom: -16, background: '#00D67A', color: '#000000', textAlign: 'center', fontWeight: 900, padding: '6px 0', letterSpacing: .6, pointerEvents: 'none', fontSize: 11 } }, '🔥 RECOMMANDÉ POUR LES + DE 45 ANS')
                    );
                }
                return Block('Choisis ton plan', React.createElement('div', { id: 'plan-section', style: { scrollMarginTop: 80 } },
                    Row({ id: 'trial', title: `Accès 7 jours`, totalEUR: 6.99, perDayEUR: 0.99 }),
                    Row({ id: '4w', title: 'Transformation 4 semaines', totalEUR: 15.19, perDayEUR: 0.49 }),
                    Row({ id: '12w', title: 'Maîtrise totale 12 semaines', totalEUR: 25.99, perDayEUR: 0.29, popular: true, savings: '-43%' }),
                    React.createElement('div', { style: { marginTop: 16, padding: '14px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 6 } },
                        React.createElement('div', { style: { fontSize: 14, lineHeight: 1.5, opacity: .85 } },
                            'Les personnes utilisant le plan pendant 3 mois obtiennent deux fois plus de résultats que pendant 1 mois'
                        ),
                        React.createElement('div', { style: { fontSize: 12, opacity: .6, marginTop: 6 } },
                            '*Selon une étude réalisée en 2024'
                        )
                    ),
                    React.createElement('div', { style: { marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 } },
                        React.createElement('button', {
                            className: 'btn primary',
                            style: {
                                width: '100%',
                                borderRadius: 8,
                                padding: '16px 24px',
                                background: 'linear-gradient(135deg, #00D67A, #00B067)',
                                border: 'none',
                                color: '#FFFFFF',
                                fontWeight: 900,
                                fontSize: 18,
                                boxShadow: '0 4px 20px rgba(0,214,122,.4)',
                                cursor: 'pointer'
                            },
                            onClick: function () {
                                try { if (window && window.dataLayer) { window.dataLayer.push({ event: 'select_plan', plan }); } } catch (_) { }
                                try { if (window.checkout && typeof window.checkout.beginCheckoutForPlan === 'function') { window.checkout.beginCheckoutForPlan(String(plan)); return; } } catch (_) { }
                                var targetUrl = '/construction';
                                try {
                                    var u = new URL(window.location.origin + '/construction');
                                    try { var langParam = new URL(window.location.href).searchParams.get('lang'); if (langParam) u.searchParams.set('lang', langParam); } catch (_) { }
                                    if (plan) u.searchParams.set('plan', String(plan));
                                    targetUrl = u.toString();
                                } catch (_) { }
                                try { window.location.replace(targetUrl); } catch (_) { window.location.href = targetUrl; }
                            }
                        }, 'OUI, je veux durer plus longtemps →'),
                        React.createElement('div', { style: { textAlign: 'center', fontSize: 12, opacity: .6 } },
                            'Paiement 100% sécurisé • Résultats garantis'
                        )
                    )
                ));
            })(),

            // Garantie remboursement
            (function () {
                function RefundBadge() {
                    return React.createElement('svg', { width: 120, height: 120, viewBox: '0 0 120 120', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' },
                        React.createElement('circle', { cx: 60, cy: 60, r: 52, stroke: '#00D67A', strokeWidth: 6, fill: 'none' }),
                        React.createElement('circle', { cx: 60, cy: 60, r: 40, stroke: '#00D67A', strokeWidth: 2, fill: 'none', strokeDasharray: '6 6' }),
                        React.createElement('text', { x: 60, y: 70, textAnchor: 'middle', fontSize: '42', fontWeight: '900', fill: '#FFFFFF' }, '30')
                    );
                }
                const textStyle = { fontSize: 16, lineHeight: 1.6 };
                return React.createElement('div', { style: { margin: '30px 0', padding: '18px', border: '1px solid rgba(0,255,100,.3)', background: 'rgba(0,255,100,.05)' } },
                    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'start', gap: 16 } },
                        React.createElement('div', null,
                            React.createElement('div', { style: { fontWeight: 900, fontSize: 24, lineHeight: 1.2, marginBottom: 8, color: '#00D67A' } },
                                'Tu ne risques absolument rien'
                            ),
                            React.createElement('div', { style: { fontSize: 18, fontWeight: 700, marginBottom: 8 } },
                                '(mais tu as tout à gagner)'
                            ),
                            React.createElement('div', { style: Object.assign({}, textStyle, { marginTop: 10 }) },
                                'Si dans 30 jours tu n\'as pas de résultats visibles, on te rembourse intégralement. Sans question, sans justification. Un simple email suffit.'
                            ),
                            React.createElement('div', { style: Object.assign({}, textStyle, { marginTop: 10, fontWeight: 700 }) },
                                'Pourquoi cette garantie ? Parce qu\'on sait que ça marche. 97% des hommes voient des résultats dès la 2ème semaine.'
                            )
                        ),
                        React.createElement('div', null, RefundBadge())
                    )
                );
            })()
        );
    }
    window.__registerQuestionComponent('lp_45-55', ResultsSale);
})();

