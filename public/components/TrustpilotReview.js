// TrustpilotReview: Reusable Trustpilot-style review component
(function () {
    function TrustpilotReview({ title, author, text, rating, lang }) {
        const stars = rating || 5;
        const displayLang = lang || ((new URL(location.href)).searchParams.get('lang') || 'fr');
        const reviewTitle = title || (displayLang === 'fr' ? 'Excellent!' : 'Excellent!');
        const reviewAuthor = author || (displayLang === 'fr' ? 'Utilisateur vérifié' : 'Verified User');
        const reviewText = text || '';

        // Trustpilot green color
        const trustpilotGreen = '#00B67A';

        return React.createElement('div', {
            style: {
                background: '#111111', // Dark background for Viril
                padding: 16,
                borderRadius: 0 // Viril: no border-radius
            }
        },
            // Header: "Customer reviews"
            React.createElement('div', {
                style: {
                    fontSize: 12,
                    color: '#9CA3AF',
                    marginBottom: 12,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5
                }
            }, displayLang === 'fr' ? 'Avis client' : 'Customer review'),

            // Stars row + Author
            React.createElement('div', {
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 12
                }
            },
                // Trustpilot-style stars (green boxes)
                React.createElement('div', { style: { display: 'flex', gap: 3 } },
                    Array.from({ length: 5 }).map((_, i) =>
                        React.createElement('div', {
                            key: i,
                            style: {
                                width: 22,
                                height: 22,
                                background: i < stars ? trustpilotGreen : 'rgba(255,255,255,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }
                        },
                            React.createElement('span', {
                                style: {
                                    color: i < stars ? 'white' : '#666',
                                    fontSize: 14
                                }
                            }, '★')
                        )
                    )
                ),
                // Author
                React.createElement('span', {
                    style: {
                        fontSize: 13,
                        color: '#9CA3AF'
                    }
                }, reviewAuthor)
            ),

            // Review title
            React.createElement('div', {
                style: {
                    fontSize: 16,
                    fontWeight: 800,
                    color: '#FFFFFF',
                    marginBottom: 8
                }
            }, reviewTitle),

            // Review text
            reviewText && React.createElement('div', {
                style: {
                    fontSize: 14,
                    color: '#D1D5DB',
                    lineHeight: 1.5
                }
            }, reviewText)
        );
    }

    // Expose globally for use in other components
    window.TrustpilotReview = TrustpilotReview;

    // Also register as a component if needed
    if (window.__registerQuestionComponent) {
        window.__registerQuestionComponent('TrustpilotReview', TrustpilotReview);
    }
})();
