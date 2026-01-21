(function () {
    function StudyFact({ question, lang }) {
        const [anim, setAnim] = React.useState(0);

        // Animation: wait 500ms then grow to 100% over 1.2s
        React.useEffect(() => {
            const t1 = setTimeout(() => {
                setAnim(1);
            }, 500);
            return () => clearTimeout(t1);
        }, []);

        const t = (k) => {
            if (!question[k]) return '';
            if (typeof question[k] === 'string') return question[k];
            return question[k][lang] || question[k].en || '';
        };

        const title = t('title') || "Kegel Exercises strengthen PF muscles, which significantly increases ejaculation control";

        // Highlight pattern for colored text
        const highlightPattern = /(ejaculation control|contrôle de l'éjaculation|Kegel Exercises|exercices de Kegel)/gi;
        const parts = title.split(highlightPattern);

        return React.createElement(React.Fragment, null,
            React.createElement('div', { style: { padding: '24px 16px', paddingBottom: 140, background: '#000', color: 'white', minHeight: '100vh' } },

                // Title - Following Viril typography (Inter, weight 800)
                React.createElement('h2', { style: { textAlign: 'center', fontSize: 22, lineHeight: 1.35, marginBottom: 40, color: 'white', fontWeight: 800 } },
                    parts.map((part, i) => {
                        const isKegel = /kegel/i.test(part);
                        const isControl = /control|contrôle/i.test(part);
                        if (isKegel) {
                            return React.createElement('span', { key: i, style: { textDecoration: 'underline', textDecorationColor: '#00B67A', textUnderlineOffset: 4 } }, part);
                        }
                        if (isControl) {
                            return React.createElement('span', { key: i, style: { color: '#00B67A' } }, part);
                        }
                        return part;
                    })
                ),

                // Chart Area
                React.createElement('div', { style: { position: 'relative', background: 'rgba(255,255,255,0.03)', padding: '20px 16px', marginBottom: 24 } },

                    // Y Axis Label
                    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, color: '#9CA3AF', marginBottom: 16 } },
                        React.createElement('span', null, '⏱️'),
                        React.createElement('span', null, lang === 'fr' ? 'Durée du rapport' : 'Sex duration')
                    ),

                    // Chart Container
                    React.createElement('div', { style: { position: 'relative', height: 200 } },

                        // Grid lines (Dotted)
                        React.createElement('div', { style: { position: 'absolute', top: 0, left: 0, right: 0, borderTop: '2px dashed rgba(255,255,255,0.15)' } }),
                        React.createElement('div', { style: { position: 'absolute', bottom: 0, left: 0, right: 0, borderTop: '2px dashed rgba(255,255,255,0.15)' } }),

                        // Bars Container
                        React.createElement('div', { style: { display: 'flex', justifyContent: 'center', alignItems: 'flex-end', height: '100%', gap: 32, paddingTop: 10, paddingBottom: 10 } },

                            // Red Bar (Fixed - small)
                            React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: 70 } },
                                // "Now" bubble
                                React.createElement('div', { style: { background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 0, marginBottom: 8 } },
                                    lang === 'fr' ? 'Maintenant' : 'Now'
                                ),
                                React.createElement('div', { style: { height: 50, width: '100%', background: '#EF4444', borderRadius: 0 } })
                            ),

                            // Green Bar (Animated - tall)
                            React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: 70, height: '100%' } },
                                React.createElement('div', { style: { width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end' } },
                                    React.createElement('div', {
                                        style: {
                                            width: '100%',
                                            height: (anim * 100) + '%',
                                            background: '#00B67A',
                                            borderRadius: 0,
                                            transition: 'height 1.2s cubic-bezier(0.25, 1, 0.5, 1)'
                                        }
                                    })
                                )
                            ),

                            // 7x Arrow indicator
                            React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 30 } },
                                React.createElement('div', { style: { fontSize: 32, fontWeight: 300, color: 'white', lineHeight: 1 } }, '↑'),
                                React.createElement('div', { style: { fontSize: 24, fontWeight: 800, color: 'white' } }, '7x')
                            )
                        )
                    )
                ),

                // Legend
                React.createElement('div', { style: { display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 32 } },
                    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
                        React.createElement('div', { style: { width: 14, height: 14, background: '#EF4444', borderRadius: 0 } }),
                        React.createElement('span', { style: { fontSize: 14, fontWeight: 600, color: '#D1D5DB' } }, lang === 'fr' ? 'Sans Kegels' : 'No Kegels')
                    ),
                    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
                        React.createElement('div', { style: { width: 14, height: 14, background: '#00B67A', borderRadius: 0 } }),
                        React.createElement('span', { style: { fontSize: 14, fontWeight: 600, color: '#D1D5DB' } }, lang === 'fr' ? 'Avec Kegels' : 'With Kegels')
                    )
                ),

                // Source Footer
                React.createElement('div', { style: { background: 'rgba(255,255,255,0.05)', padding: '16px', display: 'flex', alignItems: 'center', gap: 12 } },
                    React.createElement('div', { style: { width: 40, height: 40, background: 'white', borderRadius: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } },
                        // University Icon
                        React.createElement('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: '#000' },
                            React.createElement('path', { d: 'M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z' })
                        )
                    ),
                    React.createElement('div', null,
                        React.createElement('div', { style: { fontSize: 12, color: '#9CA3AF', marginBottom: 2 } }, 'Source:'),
                        React.createElement('div', { style: { fontSize: 14, color: 'white', fontWeight: 700 } }, 'Sapienza University')
                    )
                )
            ),

            // Sticky Footer Button
            window.StickyFooterButton && React.createElement(window.StickyFooterButton, { text: lang === 'fr' ? "J'ai compris" : "I got it" })
        );
    }

    window.__registerQuestionComponent('StudyFact', StudyFact);
})();
