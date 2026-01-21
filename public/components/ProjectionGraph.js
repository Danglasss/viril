(function () {
    function ProjectionGraph({ lang, weeks = 4, eta, badge }) {
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

        return React.createElement(React.Fragment, null,
            // ETA Badge if provided
            (eta || badge) && React.createElement('div', { style: { textAlign: 'center', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 } },
                eta && React.createElement('span', { style: { fontWeight: 800, color: '#5865F2', fontSize: 18 } }, eta),
                badge && React.createElement('span', { style: { background: '#2EB774', color: 'white', fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 0 } }, badge)
            ),

            // Chart Container
            React.createElement('div', { style: { display: 'flex', justifyContent: 'center', position: 'relative', background: '#111', padding: '16px 8px', borderRadius: 8 } },
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
                        if (weeks > 8 && i % 2 !== 0) return null; // Skip some labels if too many weeks
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
            )
        );
    }
    window.ProjectionGraph = ProjectionGraph;
})();
