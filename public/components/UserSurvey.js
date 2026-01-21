// UserSurvey: 84% donut chart with person icons and review
(function () {
    function UserSurvey({ question, lang }) {
        const [progress, setProgress] = React.useState(0);

        // Animate the donut chart
        React.useEffect(() => {
            const timer = setTimeout(() => setProgress(84), 300);
            return () => clearTimeout(timer);
        }, []);

        const t = (k) => {
            if (!question[k]) return '';
            if (typeof question[k] === 'string') return question[k];
            return question[k][lang] || question[k].en || '';
        };

        const title = t('title') || "84% of men significantly improved erection by following the Kegel Plan";
        const percent = question.percent || 84;

        // Person icon component
        const Person = ({ filled }) => React.createElement('svg', {
            width: 24,
            height: 24,
            viewBox: '0 0 24 24',
            fill: filled ? '#00B67A' : 'rgba(255,255,255,0.2)',
            style: { margin: 2 }
        },
            React.createElement('circle', { cx: 12, cy: 6, r: 4 }),
            React.createElement('path', { d: 'M12 12c-4 0-7 2-7 5v3h14v-3c0-3-3-5-7-5z' })
        );

        // Donut chart SVG
        const circumference = 2 * Math.PI * 45;
        const strokeDashoffset = circumference - (progress / 100) * circumference;

        return React.createElement(React.Fragment, null,
            React.createElement('div', { style: { padding: '24px 16px', paddingBottom: 140, background: '#000', color: 'white', minHeight: '100vh' } },

                // Title with highlighted text
                React.createElement('h2', { style: { textAlign: 'center', fontSize: 22, lineHeight: 1.35, marginBottom: 32, color: 'white', fontWeight: 800 } },
                    React.createElement('span', { style: { color: '#00B67A' } }, lang === 'fr' ? '84% des hommes' : '84% of men'),
                    ' ',
                    lang === 'fr' ? "ont considérablement amélioré leur érection en suivant " : "significantly improved erection by following ",
                    React.createElement('span', { style: { textDecoration: 'underline', textDecorationColor: '#00B67A', textUnderlineOffset: 4 } }, lang === 'fr' ? 'le Plan Kegel' : 'the Kegel Plan')
                ),

                // Stats container with persons and donut
                React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: 32, padding: '20px 16px', background: 'rgba(255,255,255,0.03)' } },

                    // Left side: Person icons
                    React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start' } },
                        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8, fontSize: 13, color: '#9CA3AF', fontWeight: 600 } },
                            React.createElement('span', null, '♂'),
                            lang === 'fr' ? 'Érection' : 'Erection'
                        ),
                        // Grid of 10 persons (8 green, 2 gray)
                        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 2 } },
                            Array.from({ length: 10 }).map((_, i) =>
                                React.createElement(Person, { key: i, filled: i < 8 })
                            )
                        )
                    ),

                    // Right side: Donut chart
                    React.createElement('div', { style: { position: 'relative', width: 120, height: 120 } },
                        React.createElement('svg', { width: 120, height: 120, viewBox: '0 0 100 100' },
                            // Background circle
                            React.createElement('circle', {
                                cx: 50, cy: 50, r: 45,
                                fill: 'none',
                                stroke: 'rgba(255,255,255,0.1)',
                                strokeWidth: 10
                            }),
                            // Progress circle
                            React.createElement('circle', {
                                cx: 50, cy: 50, r: 45,
                                fill: 'none',
                                stroke: '#00B67A',
                                strokeWidth: 10,
                                strokeLinecap: 'round',
                                strokeDasharray: circumference,
                                strokeDashoffset: strokeDashoffset,
                                transform: 'rotate(-90 50 50)',
                                style: { transition: 'stroke-dashoffset 1.2s ease-out' }
                            })
                        ),
                        // Center text
                        React.createElement('div', { style: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' } },
                            React.createElement('div', { style: { fontSize: 28, fontWeight: 800, color: 'white' } }, percent + '%'),
                            React.createElement('div', { style: { fontSize: 11, color: '#9CA3AF' } }, lang === 'fr' ? 'des hommes' : 'of men')
                        )
                    )
                ),

                // Review section
                question.review && React.createElement('div', { style: { background: 'rgba(255,255,255,0.03)', padding: 16, marginBottom: 24 } },
                    // Trustpilot stars
                    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 } },
                        React.createElement('div', { style: { display: 'flex', gap: 3 } },
                            Array.from({ length: 5 }).map((_, i) =>
                                React.createElement('div', { key: i, style: { width: 20, height: 20, background: '#00B67A', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
                                    React.createElement('span', { style: { color: 'white', fontSize: 12 } }, '★')
                                )
                            )
                        ),
                        React.createElement('span', { style: { fontSize: 13, color: '#9CA3AF' } }, question.review.author || 'Verified User')
                    ),
                    React.createElement('div', { style: { fontSize: 15, fontWeight: 700, marginBottom: 8, color: 'white' } },
                        lang === 'fr' ? "L'effet est génial" : "The effect is great"
                    ),
                    React.createElement('div', { style: { fontSize: 14, color: '#D1D5DB', lineHeight: 1.5 } },
                        (question.review.text && (question.review.text[lang] || question.review.text.en)) || ''
                    )
                )
            ),

            // Sticky Footer Button
            window.StickyFooterButton && React.createElement(window.StickyFooterButton, { text: t('cta') || (lang === 'fr' ? "J'ai compris" : "I got it") })
        );
    }

    window.__registerQuestionComponent('UserSurvey', UserSurvey);
})();
