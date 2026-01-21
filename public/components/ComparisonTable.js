// ComparisonTable: Pills vs Kegel Plan comparison table
(function () {
    function ComparisonTable({ question, lang }) {
        const t = (k) => {
            if (!question[k]) return '';
            if (typeof question[k] === 'string') return question[k];
            return question[k][lang] || question[k].en || '';
        };

        const title = t('title') || "The Kegel Plan is better than pills";

        // Check and X icons
        const CheckIcon = () => React.createElement('div', {
            style: {
                width: 28,
                height: 28,
                background: '#00B67A',
                borderRadius: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }
        }, React.createElement('span', { style: { color: 'white', fontSize: 16, fontWeight: 700 } }, '✓'));

        const XIcon = () => React.createElement('div', {
            style: {
                width: 28,
                height: 28,
                background: '#EF4444',
                borderRadius: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }
        }, React.createElement('span', { style: { color: 'white', fontSize: 16, fontWeight: 700 } }, '✕'));

        // Table data
        const rows = [
            {
                label: { en: 'Erection improvement', fr: 'Amélioration de l\'érection' },
                pills: true,
                kegel: true
            },
            {
                label: { en: 'Sexual stamina improvement', fr: 'Amélioration de l\'endurance sexuelle' },
                pills: true,
                kegel: true
            },
            {
                label: { en: 'Long-lasting effect', fr: 'Effet durable' },
                pills: false,
                kegel: true
            },
            {
                label: { en: 'Lack of side effects', fr: 'Pas d\'effets secondaires' },
                pills: false,
                kegel: true
            },
            {
                label: { en: 'Confidence improvement', fr: 'Amélioration de la confiance' },
                pills: false,
                kegel: true
            }
        ];

        return React.createElement(React.Fragment, null,
            React.createElement('div', { style: { padding: '24px 16px', paddingBottom: 140, background: '#000', color: 'white', minHeight: '100vh' } },

                // Title
                React.createElement('h2', { style: { textAlign: 'center', fontSize: 22, lineHeight: 1.35, marginBottom: 32, color: 'white', fontWeight: 800 } },
                    title
                ),

                // Table
                React.createElement('div', { style: { background: 'rgba(255,255,255,0.03)', overflow: 'hidden' } },

                    // Header row
                    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 80px 80px', borderBottom: '1px solid rgba(255,255,255,0.1)' } },
                        React.createElement('div', { style: { padding: 16 } }), // Empty cell
                        React.createElement('div', { style: { padding: 16, textAlign: 'center', fontWeight: 700, fontSize: 14, color: 'white', borderLeft: '1px solid rgba(255,255,255,0.1)' } },
                            lang === 'fr' ? 'Pilules' : 'Pills'
                        ),
                        React.createElement('div', { style: { padding: 16, textAlign: 'center', fontWeight: 700, fontSize: 14, color: 'white', borderLeft: '1px solid rgba(255,255,255,0.1)' } },
                            'Kegel Plan'
                        )
                    ),

                    // Data rows
                    rows.map((row, i) =>
                        React.createElement('div', {
                            key: i,
                            style: {
                                display: 'grid',
                                gridTemplateColumns: '1fr 80px 80px',
                                borderBottom: i < rows.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none'
                            }
                        },
                            React.createElement('div', { style: { padding: '14px 16px', fontSize: 14, color: '#D1D5DB', display: 'flex', alignItems: 'center' } },
                                row.label[lang] || row.label.en
                            ),
                            React.createElement('div', { style: { padding: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid rgba(255,255,255,0.05)' } },
                                row.pills ? React.createElement(CheckIcon) : React.createElement(XIcon)
                            ),
                            React.createElement('div', { style: { padding: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid rgba(255,255,255,0.05)' } },
                                row.kegel ? React.createElement(CheckIcon) : React.createElement(XIcon)
                            )
                        )
                    )
                ),

                // Source Footer
                React.createElement('div', { style: { marginTop: 24, display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: 'rgba(255,255,255,0.03)' } },
                    React.createElement('div', { style: { width: 40, height: 40, background: 'white', borderRadius: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } },
                        // NCBI logo placeholder
                        React.createElement('span', { style: { fontSize: 10, fontWeight: 800, color: '#000' } }, 'NCBI')
                    ),
                    React.createElement('div', null,
                        React.createElement('div', { style: { fontSize: 12, color: '#9CA3AF', marginBottom: 2 } }, 'Source:'),
                        React.createElement('div', { style: { fontSize: 14, color: 'white', fontWeight: 700 } }, 'National Center for Biotechnology Info.')
                    )
                )
            ),

            // Sticky Footer Button
            window.StickyFooterButton && React.createElement(window.StickyFooterButton, { text: t('cta') || (lang === 'fr' ? "J'ai compris" : "I got it") })
        );
    }

    window.__registerQuestionComponent('ComparisonTable', ComparisonTable);
})();
