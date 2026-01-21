(function () {
  function InfoSlide({ question, onChange, lang }) {
    const t = (k) => {
      const src = question && question[k];
      if (!src) return '';
      if (typeof src === 'string') return src;
      const v = src[lang] || src.en;
      return typeof v === 'string' ? v : '';
    };
    const title = t('title');
    const subtitle = t('subtitle');
    const bullets = question && question.bullets || [];
    const cta = t('cta') || (lang === 'fr' ? 'Je comprends' : 'Got it');
    const img = question && question.imageUrl;
    const columns = question && question.columns || [];

    function formatDatePlusDays(days, lang) {
      if (typeof window === 'undefined') return '';
      const d = new Date(); d.setDate(d.getDate() + days);
      return d.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { day: '2-digit', month: 'long', year: 'numeric' });
    }

    const useGraph = question && question.useGraph;
    const graphWeeks = (question && question.weeks) || 4;
    // Calculate defaults if graph used
    const chartEta = useGraph ? formatDatePlusDays(graphWeeks * 7, lang) : null;

    // no extra decorative icon; emojis live in titles from data
    return React.createElement(React.Fragment, null,
      React.createElement('div', { className: 'card', style: { marginTop: 0, paddingTop: 16 } },
        title && React.createElement('h2', { style: { marginTop: 0 } }, title),
        subtitle && React.createElement('p', null, subtitle),
        (useGraph && window.ProjectionGraph)
          ? React.createElement(window.ProjectionGraph, {
            lang: lang,
            weeks: graphWeeks,
            eta: chartEta,
            badge: question.badge && (question.badge[lang] || question.badge.en || question.badge)
          })
          : ((question.useImprovementGraph && window.ImprovementGraph)
            ? React.createElement(window.ImprovementGraph, { lang: lang })
            : (img && React.createElement('div', { className: 'card-image-wrapper' },
              React.createElement('img', { key: img, src: img, alt: 'illustration', className: 'card-image' })
            ))
          ),
        (columns.length > 0 ? (
          React.createElement('div', { className: 'card-columns' },
            columns.map(function (col, i) {
              const titleCol = (col.title && (col.title[lang] || col.title.en)) || col.title || '';
              const points = col.points || [];
              return React.createElement('div', { key: i, className: 'card-column' },
                React.createElement('div', { className: 'card-column-title' }, titleCol || ''),
                React.createElement('div', { className: 'card-column-content' },
                  points.map(function (p, j) { return React.createElement('p', { key: j }, (p[lang] || p.en || p)); })
                )
              );
            })
          )
        ) : (
          bullets.length > 0 && React.createElement('ul', { className: `card-bullets ${question.bulletType || 'muscle'}` },
            bullets.map(function (b, i) { return React.createElement('li', { key: i }, (typeof b === 'string' ? b : (b[lang] || b.en || ''))); })
          )
        )),
        question.review && React.createElement('div', { className: 'card-review' },
          React.createElement('div', { className: 'card-review-stars' },
            Array.from({ length: 5 }).map(function (_, i) {
              return React.createElement('div', { key: i, className: 'card-review-star' },
                React.createElement('svg', { width: 10, height: 10, viewBox: '0 0 24 24', fill: 'white' },
                  React.createElement('path', { d: 'M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.908-7.417 3.908 1.481-8.279-6.064-5.828 8.332-1.151z' })
                )
              );
            })
          ),
          React.createElement('div', { className: 'card-review-author' }, (question.review.author || (lang === 'fr' ? 'Utilisateur vérifié' : 'Verified User'))),
          React.createElement('div', { className: 'card-review-text' }, (question.review.text && (question.review.text[lang] || question.review.text.en || '')))
        )
      ),

      // Details section (copied from PlanProjection style)
      question.showDetails && React.createElement('div', { style: { padding: '0 24px', marginBottom: 24 } },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 } },
          React.createElement('span', { style: { fontSize: 18, opacity: 0.7 } }, '🏋️'),
          React.createElement('span', { style: { color: '#fff' } },
            React.createElement('span', { style: { fontWeight: 700 } }, lang === 'fr' ? 'Équipement: ' : 'Equipment: '),
            lang === 'fr' ? 'pas nécessaire' : 'not needed'
          )
        ),
        React.createElement('div', { style: { paddingLeft: 12, borderLeft: '2px solid #5865F2' } },
          React.createElement('p', { style: { fontStyle: 'italic', fontSize: 14, lineHeight: 1.5, color: '#D1D5DB', margin: 0 } },
            React.createElement('strong', { style: { color: '#fff' } }, 'Note: '),
            lang === 'fr'
              ? "Tous les exercices du Plan Kegel sont discrets. Tu peux donc les faire n'importe où et n'importe quand."
              : "All exercises from the Kegel Plan are discreet to other people. Therefore, you can do them anywhere and at any time"
          )
        )
      ),

      window.StickyFooterButton && React.createElement(window.StickyFooterButton, { text: cta })
    );
  }
  window.__registerQuestionComponent('InfoSlide', InfoSlide);
})();
