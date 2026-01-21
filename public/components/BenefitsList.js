// BenefitsList: List of benefits with icons and arrows
(function () {
    function BenefitsList({ question, lang }) {
        const t = (k) => {
            if (!question[k]) return '';
            if (typeof question[k] === 'string') return question[k];
            return question[k][lang] || question[k].en || '';
        };

        const title = t('title') || (lang === 'fr' ? 'Ton plan Kegel t\'aidera à améliorer :' : 'Your Kegel plan will help you to improve:');

        // Default benefits list
        const defaultBenefits = [
            { icon: '♂', label: { en: 'Erectile function', fr: 'Fonction érectile' } },
            { icon: '💪', label: { en: 'Ejaculation control', fr: 'Contrôle de l\'éjaculation' } },
            { icon: '🩺', label: { en: 'Prostate health', fr: 'Santé de la prostate' } },
            { icon: '👍', label: { en: 'Confidence', fr: 'Confiance' } },
            { icon: '❤️', label: { en: 'Relationship happiness', fr: 'Bonheur relationnel' } }
        ];

        const benefits = question.benefits || defaultBenefits;

        return React.createElement(React.Fragment, null,
            React.createElement('div', { style: { padding: '24px 16px', paddingBottom: 140, background: '#000', color: 'white', minHeight: '100vh' } },

                // Title
                React.createElement('h2', { style: { textAlign: 'center', fontSize: 24, fontWeight: 800, marginBottom: 40, color: 'white', lineHeight: 1.3 } }, title),

                // Benefits list
                React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
                    benefits.map((benefit, i) =>
                        React.createElement('div', {
                            key: i,
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: 16,
                                padding: '12px 16px',
                                background: 'rgba(255,255,255,0.03)'
                            }
                        },
                            // Icon container
                            React.createElement('div', {
                                style: {
                                    width: 48,
                                    height: 48,
                                    minWidth: 48,
                                    background: 'rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 22
                                }
                            }, benefit.icon),

                            // Label
                            React.createElement('span', {
                                style: {
                                    fontSize: 17,
                                    fontWeight: 700,
                                    color: '#fff',
                                    flex: 1
                                }
                            }, benefit.label[lang] || benefit.label.en),

                            // Up arrow (improvement indicator)
                            React.createElement('span', {
                                style: {
                                    color: '#00B67A',
                                    fontSize: 18,
                                    fontWeight: 700
                                }
                            }, '▲')
                        )
                    )
                )
            ),

            // Sticky Footer Button
            window.StickyFooterButton && React.createElement(window.StickyFooterButton, {
                text: t('cta') || (lang === 'fr' ? "J'ai compris" : "I got it")
            })
        );
    }

    window.__registerQuestionComponent('BenefitsList', BenefitsList);
})();
