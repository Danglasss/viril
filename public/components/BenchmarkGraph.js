// BenchmarkGraph - Visual component showing where user stands compared to average
// Used for SLIDE 8 (Le Choc - Benchmarking) in the quiz
(function () {
    function BenchmarkGraph({ question, value, onChange, lang }) {
        const t = (obj) => (obj && (obj[lang] || obj['en'])) || '';
        const title = t(question.title);
        const subtitle = t(question.subtitle);
        const cta = t(question.cta) || (lang === 'fr' ? 'Compris' : 'Got it');

        // Get user's duration from answers
        const answers = (typeof window !== 'undefined' && window.__getAnswers && window.__getAnswers()) || {};
        const durationAnswer = answers['diag_duration'] || '<1';

        // Map duration bucket to minutes for positioning
        const durationMap = { '<1': 0.5, '1-2': 1.5, '3-5': 4, '5+': 6 };
        const userMinutes = durationMap[durationAnswer] || 1;

        // Calculate position (0-100%) on a 0-15 min scale
        const maxScale = 15;
        const userPosition = Math.min(100, (userMinutes / maxScale) * 100);

        // Red zone is 0-7min (46.67%), green zone is 7-15min
        const redZoneWidth = (7 / maxScale) * 100;

        // Animation state
        const [anim, setAnim] = React.useState(false);
        React.useEffect(() => {
            const timer = setTimeout(() => setAnim(true), 300);
            return () => clearTimeout(timer);
        }, []);

        return React.createElement('div', { style: { padding: '0 0 100px 0' } },
            // Title
            title && React.createElement('h2', {
                style: {
                    fontSize: 24,
                    fontWeight: 900,
                    marginBottom: 16,
                    textAlign: 'center',
                    lineHeight: 1.3
                }
            }, title),

            // Subtitle
            subtitle && React.createElement('p', {
                style: {
                    fontSize: 16,
                    opacity: 0.85,
                    marginBottom: 32,
                    textAlign: 'center',
                    lineHeight: 1.5
                }
            }, subtitle),

            // Graph container
            React.createElement('div', {
                style: {
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '40px 20px 24px 20px'
                }
            },
                // Main bar container
                React.createElement('div', { style: { position: 'relative', marginBottom: 8 } },
                    // Background bar with gradient (red to green)
                    React.createElement('div', {
                        style: {
                            height: 48,
                            background: 'linear-gradient(90deg, #EF4444 0%, #EF4444 ' + redZoneWidth + '%, #22C55E ' + redZoneWidth + '%, #22C55E 100%)',
                            position: 'relative',
                            overflow: 'visible'
                        }
                    },
                        // 85% marker line
                        React.createElement('div', {
                            style: {
                                position: 'absolute',
                                left: redZoneWidth + '%',
                                top: -8,
                                bottom: -8,
                                width: 3,
                                background: '#FFFFFF',
                                zIndex: 2
                            }
                        }),
                        // 85% label above  
                        React.createElement('div', {
                            style: {
                                position: 'absolute',
                                left: redZoneWidth + '%',
                                top: -32,
                                transform: 'translateX(-50%)',
                                fontSize: 13,
                                fontWeight: 800,
                                color: '#FFFFFF',
                                whiteSpace: 'nowrap'
                            }
                        }, '85%'),

                        // User marker (animated)
                        React.createElement('div', {
                            style: {
                                position: 'absolute',
                                left: anim ? userPosition + '%' : '0%',
                                top: '50%',
                                transform: 'translate(-50%, -50%)',
                                transition: 'left 1s cubic-bezier(0.25, 1, 0.5, 1)',
                                zIndex: 5
                            }
                        },
                            // Marker triangle pointing down
                            React.createElement('div', {
                                style: {
                                    width: 0,
                                    height: 0,
                                    borderLeft: '12px solid transparent',
                                    borderRight: '12px solid transparent',
                                    borderTop: '16px solid #FFFFFF',
                                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                                }
                            }),
                            // "Toi" label
                            React.createElement('div', {
                                style: {
                                    position: 'absolute',
                                    top: -28,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    fontSize: 14,
                                    fontWeight: 900,
                                    color: '#FFFFFF',
                                    background: 'rgba(0,0,0,0.8)',
                                    padding: '4px 10px',
                                    whiteSpace: 'nowrap'
                                }
                            }, lang === 'fr' ? 'Toi' : 'You')
                        )
                    ),

                    // X-axis labels
                    React.createElement('div', {
                        style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginTop: 12,
                            fontSize: 12,
                            opacity: 0.8
                        }
                    },
                        React.createElement('span', null, '0 min'),
                        React.createElement('span', null, '7 min'),
                        React.createElement('span', null, '15 min')
                    )
                )
            ),

            // CTA Button
            window.StickyFooterButton && React.createElement(window.StickyFooterButton, {
                label: cta,
                onClick: () => { if (window.__goNext) window.__goNext(); }
            })
        );
    }

    if (window.__registerQuestionComponent) {
        window.__registerQuestionComponent('BenchmarkGraph', BenchmarkGraph);
    }
})();
