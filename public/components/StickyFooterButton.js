// StickyFooterButton: Centralized sticky footer button component
(function () {
    function StickyFooterButton({ text, onClick }) {
        const lang = (new URL(location.href)).searchParams.get('lang') || 'fr';
        const defaultText = lang === 'fr' ? 'CONTINUER' : 'CONTINUE';
        const buttonText = text ? text.toUpperCase() : defaultText;

        return React.createElement('div', { className: 'sticky-footer' },
            React.createElement('button', {
                className: 'btn primary',
                onClick: onClick || function () { if (window.__goNext) window.__goNext(); }
            },
                buttonText,
                React.createElement('span', { className: 'btn-chevron' }, ' ›')
            )
        );
    }

    // Expose globally for use in other components
    window.StickyFooterButton = StickyFooterButton;
})();
