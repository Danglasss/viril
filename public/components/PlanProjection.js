(function () {
  function mapDurationAnswer(ans) {
    if (ans === '<1') return 1;
    if (ans === '1-2' || ans === '1_2') return 2;
    if (ans === '3-5' || ans === '3_5') return 4;
    if (ans === '6-10' || ans === '6_10') return 8;
    if (ans === '10-15' || ans === '10_15') return 12;
    // dr_kegel values
    if (ans === '<2') return 1.5;
    if (ans === '2-7') return 4.5;
    if (ans === '7-15') return 11;
    if (ans === '15+') return 15;

    if (typeof ans === 'number') return ans;
    return 3;
  }

  function computeProfile(a) {
    var hyper = 0, hypo = 0;
    if (a.hx_sport_core === 'often') hyper++; else if (a.hx_sport_core === 'never') hypo++;
    if (a.hx_ejac_precoce_always === 'yes') hyper++;
    if (a.hx_erection_difficulty === 'yes' || a.hx_erection_difficulty === 'sometimes') hypo++;
    if (a.hx_urine_leak === 'yes') hypo++;
    if (a.hx_post_act_feel === 'fatigue') hyper++; else if (a.hx_post_act_feel === 'relaxed') hypo++;
    if (a.hx_tension_pattern === 'tense') hyper++; else if (a.hx_tension_pattern === 'relaxed') hypo++;
    if (a.hx_penetration_sensation === 'yes') hypo++;
    return hyper >= hypo ? 'hyper' : 'hypo';
  }

  function formatDatePlusDays(days, lang) {
    var d = new Date(); d.setDate(d.getDate() + days);
    return d.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  function PlanProjection({ question }) {
    var lang = (new URL(location.href)).searchParams.get('lang') || 'fr';
    var answers = (window.__getAnswers && window.__getAnswers()) || {};
    var currentMin = mapDurationAnswer(answers['diag_duration'] || answers['dr_kegel_duration']);
    var goalRaw = answers['goal_duration'] || answers['proj_goal_minutes'] || answers['dr_kegel_goal_duration'] || '';
    var goal = parseInt(goalRaw, 10);
    if (!goal || isNaN(goal)) goal = 15;
    if (goalRaw === '15-20') goal = 18;
    if (goalRaw === '20-25') goal = 22;
    if (goalRaw === '25+') goal = 30;
    if (goalRaw === 'as_long_as_wanted') goal = 20;

    // Time available per day
    var timeRaw = answers['time_available'] || '5';
    var timeMin = parseInt(timeRaw, 10) || 5;

    // Customization from question prop
    var weeks = (question && question.weeks) || 4;
    var eta = formatDatePlusDays(weeks * 7, lang);
    var profile = computeProfile(answers);
    var badge = question && question.badge && (question.badge[lang] || question.badge.en || question.badge);
    var showGauge = question && question.showGauge;
    var showCompatibilityScore = question && question.showCompatibilityScore;
    var showDetails = question && question.showDetails;
    var showReview = question && question.showReview;
    var customTitle = question && ((question.title && (question.title[lang] || question.title.en)) || null);
    var customSubtitle = question && ((question.subtitle && (question.subtitle[lang] || question.subtitle.en)) || null);

    // simple chart dimensions
    var W = 320, H = 180, LEFT = 30, RIGHT = 20, TOP = 20, BOTTOM = 30;
    var innerW = W - LEFT - RIGHT, innerH = H - TOP - BOTTOM;

    // Updated curve: Flat start -> Rise -> Continue rising slightly after 0.75
    function getCurvePoint(t) {
      if (t < 0.15) return 0.05; // Flat start (Week 1)
      if (t < 0.75) {
        // S-curve from 0.15 to 0.75
        var it = (t - 0.15) / 0.6;
        return 0.05 + 0.75 * (it < 0.5 ? 2 * it * it : -1 + (4 - 2 * it) * it);
      }
      // After 0.75: continue rising gently (sustained progress)
      var base = 0.80; // Value at t=0.75
      var extra = (t - 0.75) * 0.4; // Gentle rise
      return base + extra;
    }

    function X(t) { return LEFT + t * innerW; }
    function Y(v) { return TOP + (1 - v) * innerH; }

    var dPath = (function () {
      var steps = 30;
      var d = 'M ' + X(0) + ' ' + Y(getCurvePoint(0));
      for (var i = 1; i <= steps; i++) {
        var t = i / steps;
        d += ' L ' + X(t) + ' ' + Y(getCurvePoint(t));
      }
      return d;
    })();

    var defaultTitle = (lang === 'fr'
      ? 'Selon tes objectifs personnels, tu peux'
      : 'Based on your personal goals you can');

    // Replace all template variables
    function replaceVars(str) {
      if (!str) return str;
      return str
        .replace(/\{\{goal\}\}/g, goal)
        .replace(/\{\{time\}\}/g, timeMin)
        .replace(/\{\{baseline\}\}/g, currentMin);
    }

    var title = replaceVars(customTitle || defaultTitle);
    var subtitle = replaceVars(customSubtitle);

    return React.createElement(React.Fragment, null,
      React.createElement('div', { style: { padding: '24px 16px', paddingBottom: 140, background: '#000', minHeight: '100vh' } },
        React.createElement('h2', { style: { textAlign: 'center', marginBottom: 4, padding: '0 10px', color: '#fff', fontWeight: 800 } }, title),
        subtitle && React.createElement('div', { style: { textAlign: 'center', marginBottom: 4, color: '#9CA3AF' } }, subtitle),

        React.createElement('div', { style: { textAlign: 'center', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 } },
          React.createElement('span', { style: { fontWeight: 800, color: '#5865F2', fontSize: 18 } }, eta),
          // Dynamic badge: calculate improvement percentage
          (function () {
            if (!badge) return null;
            var improvementPercent = currentMin > 0 ? Math.round(((goal - currentMin) / currentMin) * 100) : 0;
            var badgeText = badge === true
              ? (lang === 'fr' ? '+' + improvementPercent + '%' : '+' + improvementPercent + '%')
              : badge;
            return React.createElement('span', { style: { background: '#2EB774', color: 'white', fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 0 } }, badgeText);
          })()
        ),

        // Chart
        React.createElement('div', { style: { display: 'flex', justifyContent: 'center', position: 'relative', background: '#111', padding: '16px 8px' } },
          React.createElement('svg', { width: W, height: H, viewBox: '0 0 ' + W + ' ' + H },
            // Background shaded area for "Sustained Progress"
            React.createElement('rect', { x: X(0.75), y: TOP, width: innerW * 0.25 + RIGHT, height: innerH, fill: 'rgba(88, 101, 242, 0.1)' }),
            React.createElement('defs', null,
              React.createElement('linearGradient', { id: 'gradientLine', x1: '0', y1: '0', x2: '1', y2: '0' },
                React.createElement('stop', { offset: '0%', stopColor: '#F94144' }),
                React.createElement('stop', { offset: '50%', stopColor: '#F9C74F' }),
                React.createElement('stop', { offset: '100%', stopColor: '#00B67A' })
              )
            ),

            // Y-axis Label
            React.createElement('text', {
              fill: '#666', fontSize: 9,
              transform: 'rotate(-90)',
              x: -H / 2, y: 12,
              textAnchor: 'middle'
            }, lang === 'fr' ? 'Effet du Plan Kegel' : 'Kegel Plan Effect'),

            // Grid lines
            React.createElement('g', { stroke: 'rgba(255,255,255,.1)' },
              React.createElement('line', { x1: LEFT, y1: TOP + innerH * 0.25, x2: W, y2: TOP + innerH * 0.25 }),
              React.createElement('line', { x1: LEFT, y1: TOP + innerH * 0.5, x2: W, y2: TOP + innerH * 0.5 }),
              React.createElement('line', { x1: LEFT, y1: TOP + innerH * 0.75, x2: W, y2: TOP + innerH * 0.75 }),
              React.createElement('line', { x1: LEFT, y1: TOP, x2: LEFT, y2: TOP + innerH, stroke: '#444', strokeWidth: 1.5 }),
              React.createElement('line', { x1: LEFT, y1: TOP + innerH, x2: W, y2: TOP + innerH, stroke: '#444', strokeWidth: 1.5 })
            ),

            // X-axis Labels
            Array.from({ length: weeks }).map((_, i) => {
              if (weeks > 8 && i % 2 !== 0) return null;
              const isLast = i === weeks - 1;
              const xPos = X(i / (weeks - 1));
              return React.createElement('text', {
                key: i,
                x: xPos, y: H - 10,
                fontSize: isLast ? 11 : 9,
                fill: isLast ? '#fff' : '#666',
                fontWeight: isLast ? 'bold' : 'normal',
                textAnchor: 'middle'
              }, (lang === 'fr' ? 'Sem. ' : 'Week ') + (i + 1));
            }),

            // "Sustained Progress" Text
            React.createElement('text', { x: X(0.88), y: Y(0.5), fontSize: 10, fill: '#9CA3AF', textAnchor: 'middle' },
              React.createElement('tspan', { x: X(0.88), dy: 0 }, lang === 'fr' ? 'Progrès' : 'Sustained'),
              React.createElement('tspan', { x: X(0.88), dy: 12 }, lang === 'fr' ? 'Durables' : 'Progress')
            ),

            // The Curve
            React.createElement('path', { d: dPath, fill: 'none', stroke: 'url(#gradientLine)', strokeWidth: 5, strokeLinecap: 'round', strokeLinejoin: 'round' }),

            // Dotted vertical line at "Noticeable Improvements"
            React.createElement('line', { x1: X(0.75), y1: Y(getCurvePoint(0.75)), x2: X(0.75), y2: TOP + innerH, stroke: '#5865F2', strokeWidth: 1.5, strokeDasharray: '3 3' }),

            // Points
            React.createElement('circle', { cx: X(0), cy: Y(getCurvePoint(0)), r: 5, fill: '#000', stroke: '#F94144', strokeWidth: 3 }),
            React.createElement('circle', { cx: X(0.75), cy: Y(getCurvePoint(0.75)), r: 5, fill: '#000', stroke: '#5865F2', strokeWidth: 3 }),

            // Callouts
            // Now
            React.createElement('g', { transform: 'translate(' + (X(0) + 12) + ',' + (Y(getCurvePoint(0)) - 35) + ')' },
              React.createElement('rect', { x: 0, y: 0, width: lang === 'fr' ? 70 : 44, height: 24, fill: '#666', rx: 0 }),
              React.createElement('text', { x: lang === 'fr' ? 35 : 22, y: 16, textAnchor: 'middle', fill: 'white', fontSize: 11, fontWeight: 600 }, lang === 'fr' ? 'Maintenant' : 'Now')
            ),
            // Noticeable Improvements
            React.createElement('g', { transform: 'translate(' + (X(0.75) - 105) + ',' + (Y(getCurvePoint(0.75)) - 40) + ')' },
              React.createElement('rect', { x: 0, y: 0, width: 106, height: 32, fill: '#5865F2', rx: 0 }),
              React.createElement('text', { x: 53, y: 14, textAnchor: 'middle', fill: 'white', fontSize: 10 }, lang === 'fr' ? 'Améliorations' : 'Noticeable'),
              React.createElement('text', { x: 53, y: 26, textAnchor: 'middle', fill: 'white', fontSize: 10 }, lang === 'fr' ? 'Notables' : 'Improvements')
            )
          )
        ),


        // Certainty Score Section
        (showCompatibilityScore ? (
          React.createElement('div', { style: { marginTop: 32, padding: '0 16px', textAlign: 'center' } },
            React.createElement('h3', { style: { color: '#fff', fontSize: 18, marginBottom: 24, fontWeight: 700 } },
              lang === 'fr' ? 'Score de certitude : ' : 'Certainty Score: ',
              React.createElement('span', { style: { color: '#00B67A' } }, lang === 'fr' ? 'Élevé' : 'High')
            ),

            // Gauge SVG
            React.createElement('div', { style: { position: 'relative', width: 200, height: 100, margin: '0 auto 24px' } },
              React.createElement('svg', { width: 200, height: 100, viewBox: '0 0 200 100' },
                // Background Arc (Red -> Yellow -> Green)
                React.createElement('path', { d: 'M 20 100 A 80 80 0 0 1 180 100', fill: 'none', stroke: '#333', strokeWidth: 12, strokeLinecap: 'round' }),
                React.createElement('path', { d: 'M 20 100 A 80 80 0 0 1 70 38', fill: 'none', stroke: '#EF4444', strokeWidth: 12, strokeLinecap: 'round' }), // Red
                React.createElement('path', { d: 'M 74 34 A 80 80 0 0 1 126 34', fill: 'none', stroke: '#EAB308', strokeWidth: 12, strokeLinecap: 'round' }), // Yellow
                React.createElement('path', { d: 'M 130 38 A 80 80 0 0 1 180 100', fill: 'none', stroke: '#22C55E', strokeWidth: 12, strokeLinecap: 'round' }), // Green

                // Needle
                React.createElement('line', { x1: 100, y1: 100, x2: 160, y2: 45, stroke: '#fff', strokeWidth: 4, strokeLinecap: 'round' }),
                React.createElement('circle', { cx: 100, cy: 100, r: 8, fill: '#fff' })
              ),
              // Score pill
              React.createElement('div', {
                style: {
                  position: 'absolute', bottom: -15, left: '50%', transform: 'translateX(-50%)',
                  background: '#fff', padding: '4px 12px', borderRadius: 8,
                  border: '1px solid #22C55E', color: '#22C55E', fontWeight: 800, fontSize: 16
                }
              }, '87.1%')
            ),

            // Dynamic Text
            React.createElement('p', { style: { color: '#fff', fontSize: 13, lineHeight: 1.5, opacity: 0.9, marginTop: 32 } },
              lang === 'fr'
                ? React.createElement(React.Fragment, null,
                  React.createElement('strong', null, '87.1%'), ' des hommes de la même tranche d\'âge que toi ',
                  React.createElement('strong', null, '(' + (answers['dr_kegel_age'] || '35-45') + ' ans)'),
                  ' rapportent des améliorations notables en suivant le Plan Kegel.'
                )
                : React.createElement(React.Fragment, null,
                  React.createElement('strong', null, '87.1%'), ' of men from the same age group as you ',
                  React.createElement('strong', null, '(' + (answers['dr_kegel_age'] || '35-45') + ' years)'),
                  ' report noticeable improvements by following Kegel Plan.'
                )
            ),
            React.createElement('p', { style: { color: '#6B7280', fontSize: 10, marginTop: 8 } },
              lang === 'fr' ? '*statistiques issues d\'une enquête interne' : '*statistics from internal survey'
            )
          )
        ) : null),

        // Trustpilot Review (using reusable component)
        showReview && window.TrustpilotReview && React.createElement('div', { style: { marginTop: 24 } },
          React.createElement(window.TrustpilotReview, {
            title: lang === 'fr' ? 'Génial!' : 'Awesome!',
            author: 'Brown',
            text: lang === 'fr' ? '2 semaines et je ressens déjà des améliorations 💪' : '2 weeks and I can already feel improvements 💪',
            rating: 5,
            lang: lang
          })
        ),

        // Details section (Duration, Equipment, Note)
        showDetails && React.createElement('div', { style: { marginTop: 24, padding: '0 8px' } },
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 } },
            React.createElement('span', { style: { fontSize: 18, opacity: 0.7 } }, '⏱️'),
            React.createElement('span', { style: { color: '#fff' } },
              React.createElement('span', { style: { fontWeight: 700 } }, lang === 'fr' ? 'Durée: ' : 'Duration: '),
              lang === 'fr' ? '5 min/jour' : '5 min/day'
            )
          ),
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 } },
            React.createElement('span', { style: { fontSize: 18, opacity: 0.7 } }, '🏋️'),
            React.createElement('span', { style: { color: '#fff' } },
              React.createElement('span', { style: { fontWeight: 700 } }, lang === 'fr' ? 'Équipement: ' : 'Equipment: '),
              lang === 'fr' ? 'pas nécessaire' : 'not needed'
            )
          ),
          React.createElement('div', { style: { fontSize: 13, fontStyle: 'italic', color: '#9CA3AF', lineHeight: 1.5 } },
            lang === 'fr'
              ? 'Note: Tous les exercices du Plan Kegel sont discrets. Tu peux les faire n\'importe où.'
              : 'Note: All exercises from the Kegel Plan are discreet. You can do them anywhere.'
          )
        )
      ),

      // Sticky Footer Button (centralized component with black background)
      window.StickyFooterButton && React.createElement(window.StickyFooterButton, {
        text: (question && question.cta && (question.cta[lang] || question.cta.en)) || (lang === 'fr' ? 'Continuer' : 'Continue')
      })
    );
  }

  window.__registerQuestionComponent('PlanProjection', PlanProjection);
})();
