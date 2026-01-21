// Rating component - Viril Design System
(function () {
    function Rating({ question, value, onChange, lang }) {
        const t = (obj) => (obj && (obj[lang] || obj['en'])) || '';
        const subtitle = t(question.subtitle);
        const minLabel = t(question.minLabel);
        const maxLabel = t(question.maxLabel);

        const handleClick = (val) => {
            onChange(val);
            // Auto-advance after small delay for feedback
            setTimeout(() => {
                if (window.__goNext) window.__goNext();
            }, 250);
        };

        return React.createElement('div', { className: 'rating-container', style: { width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' } },
            subtitle && React.createElement('div', { style: { marginBottom: 24, opacity: 0.7, fontSize: 15, textAlign: 'center', color: '#9CA3AF' } }, subtitle),

            React.createElement('div', { style: { display: 'flex', width: '100%', justifyContent: 'space-between', gap: 10, marginBottom: 12 } },
                question.options.map(opt => {
                    const isSelected = value === opt.value;
                    const label = t(opt.label);
                    return React.createElement('button', {
                        key: opt.value,
                        onClick: () => handleClick(opt.value),
                        style: {
                            flex: 1,
                            aspectRatio: '1/1',
                            border: isSelected ? '2px solid var(--color-primary, #FDB913)' : '2px solid rgba(255,255,255,0.2)',
                            borderRadius: 0, // Viril: no border-radius
                            background: isSelected ? 'var(--color-primary, #FDB913)' : 'rgba(255,255,255,0.05)',
                            color: isSelected ? '#000000' : '#FFFFFF',
                            fontSize: 20,
                            fontWeight: 800, // Viril: font-weight 800
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                        }
                    }, label);
                })
            ),

            React.createElement('div', { style: { display: 'flex', width: '100%', justifyContent: 'space-between', fontSize: 13, color: '#9CA3AF', fontWeight: 500 } },
                React.createElement('span', null, minLabel),
                React.createElement('span', null, maxLabel)
            )
        );
    }

    if (window.__registerQuestionComponent) {
        window.__registerQuestionComponent('Rating', Rating);
    }
})();
