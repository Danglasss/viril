// Landing: headline + subtitle + first question embedded
(function () {
  function Landing({ question, value, onChange, lang }) {
    const theme = React.useContext(ThemeContext) || {};
    const headline = (question.headline && question.headline[lang]) || '';
    const subtitle = (question.subtitle && question.subtitle[lang]) || '';

    // Create a wrapper onChange that saves to the actual question ID (e.g., demo_age), not __landing
    const wrappedOnChange = React.useCallback((val) => {
      // Save under the first question's real ID
      const realId = question.first && question.first.id;
      if (realId && window.__setAnswer) {
        window.__setAnswer(realId, val);
      }
      // Also call original onChange for __landing (in case needed for state tracking)
      onChange(val);
    }, [question, onChange]);
    const privacy = (question.privacy && question.privacy[lang]) || '';

    return React.createElement('div', null,
      theme.logoUrl && React.createElement('div', { className: 'landing-logo' },
        React.createElement('img', { src: theme.logoUrl, alt: 'logo' })
      ),
      React.createElement('div', { className: 'landing-content' },
        React.createElement('div', { className: 'landing-header' },
          React.createElement('div', { className: 'landing-headline' }, headline),
          React.createElement('div', { className: 'landing-subtitle' }, subtitle),
          privacy && React.createElement('div', { className: 'landing-privacy' }, privacy)
        ),
        (window.__renderQuestionElement && window.__renderQuestionElement(question.first, value, wrappedOnChange, lang))
      )
    );
  }
  window.__registerQuestionComponent('Landing', Landing);
})(); 