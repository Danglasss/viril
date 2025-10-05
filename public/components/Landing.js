// Landing: headline + subtitle + first question embedded
(function(){
  function Landing({ question, value, onChange, lang }) {
    const theme = React.useContext(ThemeContext) || {};
    const headline = (question.headline && question.headline[lang]) || '';
    const subtitle = (question.subtitle && question.subtitle[lang]) || '';
    return React.createElement('div', null,
      theme.logoUrl && React.createElement('div', { style: { marginTop: 0, marginBottom: 16, display: 'flex', justifyContent: 'center' } },
        React.createElement('img', { src: theme.logoUrl, alt: 'logo', style: { height: 48 } })
      ),
      React.createElement('div', { style: { minHeight: 'calc(100vh - 520px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'stretch' } },
        React.createElement('div', { style: { marginBottom: 12, textAlign: 'center' } },
          React.createElement('div', { style: { fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 700, lineHeight: 1.2 } }, headline),
          React.createElement('div', { style: { opacity: .8, marginTop: 6 } }, subtitle)
        ),
        (window.__renderQuestionElement && window.__renderQuestionElement(question.first, value, onChange, lang))
      )
    );
  }
  window.__registerQuestionComponent('Landing', Landing);
})(); 