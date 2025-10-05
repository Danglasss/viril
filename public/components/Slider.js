// Slider: range input from min to max; updates numeric value on change
(function(){
  function Slider({ question, value, onChange }) {
    const min = question.min ?? 0, max = question.max ?? 10, step = question.step ?? 1;
    const v = typeof value === 'number' ? value : min;
    return React.createElement('div', null,
      React.createElement('input', {
        type: 'range', min, max, step, value: v,
        onChange: (e) => onChange(parseFloat(e.target.value))
      }),
      React.createElement('div', { style: { marginTop: 10, fontWeight: 600, display: 'inline-block', background: 'var(--color-card)', padding: '6px 10px', borderRadius: 999 } }, v)
    );
  }
  window.__registerQuestionComponent('Slider', Slider);
})(); 