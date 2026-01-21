// Consent: GDPR consent with dark theme (Viril design system)
(function () {
    function Consent({ question, lang }) {
        const [checked, setChecked] = React.useState(false);
        const [loading, setLoading] = React.useState(false);

        const t = (k) => {
            if (!question[k]) return '';
            if (typeof question[k] === 'string') return question[k];
            return question[k][lang] || question[k].en || '';
        };

        const title = t('text') || (lang === 'fr' ? 'Création de ton plan' : 'Creating your plan');
        const consentText = t('subtitle') || (lang === 'fr'
            ? "Je consens à ce que Viril App traite mes données de santé pour fournir des services et améliorer mon expérience utilisateur."
            : "I consent to Viril App processing my health onboarding data to provide services and enhance my user experience.");

        const handleContinue = () => {
            if (!checked) return;
            setLoading(true);
            setTimeout(() => {
                if (window.__goNext) window.__goNext();
            }, 1500);
        };

        // Hide header/progress bar
        React.useEffect(() => {
            const header = document.querySelector('.header');
            if (header) header.style.display = 'none';
            return () => {
                if (header) header.style.display = '';
            };
        }, []);

        return React.createElement('div', {
            style: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: '#000',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: 16,
                zIndex: 100
            }
        },
            // Logo VIRIL at top-left (same position as normal header)
            React.createElement('div', {
                style: {
                    alignSelf: 'flex-start',
                    border: '2px solid #FF6A00',
                    padding: '8px 16px',
                    marginBottom: 40
                }
            },
                React.createElement('span', {
                    style: {
                        fontWeight: 800,
                        fontSize: 16,
                        color: '#FF6A00',
                        letterSpacing: 1
                    }
                }, 'VIRIL')
            ),

            // Title
            React.createElement('h2', {
                style: {
                    textAlign: 'center',
                    fontSize: 28,
                    fontWeight: 800,
                    marginBottom: 40,
                    color: 'white'
                }
            }, title),

            // Loader spinner (always visible in background)
            React.createElement('div', {
                style: {
                    marginBottom: 30
                }
            },
                React.createElement('div', {
                    style: {
                        width: 48,
                        height: 48,
                        border: '3px solid rgba(255,255,255,0.1)',
                        borderTop: '3px solid #FF6A00',
                        borderRadius: '50%',
                        animation: 'consent-spin 1s linear infinite'
                    }
                }),
                React.createElement('style', null, `
                    @keyframes consent-spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `)
            ),

            // Dark popup card (moved up)
            !loading && React.createElement('div', {
                style: {
                    background: '#111',
                    padding: 20,
                    maxWidth: 360,
                    width: '100%',
                    border: '1px solid rgba(255,255,255,0.1)',
                    marginTop: 20
                }
            },
                // Checkbox row
                React.createElement('div', {
                    style: { display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 20, cursor: 'pointer' },
                    onClick: () => setChecked(!checked)
                },
                    // Checkbox
                    React.createElement('div', {
                        style: {
                            width: 24,
                            height: 24,
                            minWidth: 24,
                            border: '2px solid rgba(255,255,255,0.3)',
                            borderRadius: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: checked ? 'var(--color-primary, #FDB913)' : 'transparent',
                            transition: 'all 0.2s'
                        }
                    },
                        checked && React.createElement('span', { style: { color: '#000', fontSize: 14, fontWeight: 700 } }, '✓')
                    ),
                    // Text
                    React.createElement('div', { style: { fontSize: 14, color: '#D1D5DB', lineHeight: 1.5 } },
                        consentText,
                        ' ',
                        React.createElement('a', {
                            href: '/privacy',
                            target: '_blank',
                            style: { color: 'var(--color-primary, #FDB913)', textDecoration: 'underline' },
                            onClick: (e) => e.stopPropagation()
                        }, lang === 'fr' ? 'Politique de confidentialité' : 'Privacy Policy'),
                        '.'
                    )
                ),

                // Continue button
                React.createElement('button', {
                    onClick: handleContinue,
                    disabled: !checked,
                    style: {
                        width: '100%',
                        padding: '14px 20px',
                        background: checked ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                        color: checked ? '#fff' : 'rgba(255,255,255,0.3)',
                        border: checked ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 0,
                        fontSize: 16,
                        fontWeight: 700,
                        cursor: checked ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        transition: 'all 0.2s'
                    }
                },
                    lang === 'fr' ? 'Continuer' : 'Continue',
                    React.createElement('span', null, '→')
                )
            ),

            // Spacer
            React.createElement('div', { style: { flex: 1 } }),

            // Loading state message
            loading && React.createElement('div', {
                style: { color: 'rgba(255,255,255,0.6)', fontSize: 14 }
            }, lang === 'fr' ? 'Chargement...' : 'Loading...')
        );
    }

    window.__registerQuestionComponent('Consent', Consent);
})();
