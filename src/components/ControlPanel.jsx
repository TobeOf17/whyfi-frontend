export default function ControlPanel({ input, onChange, onRecalculate, isLoading }) {
  function updateField(field, value) {
    onChange({ ...input, [field]: value });
  }

  return (
    <div className="card">
      <p className="section-label">Inputs</p>

      <div className="control-row">
        <div className="control-row__top">
          <span className="control-label">Starting amount</span>
          <span className="control-value">${Number(input.startingPrincipal).toLocaleString()}</span>
        </div>
        <input
          className="slider"
          type="range"
          min="0"
          max="50000"
          step="500"
          value={input.startingPrincipal}
          onChange={(e) => updateField('startingPrincipal', Number(e.target.value))}
        />
      </div>

      <div className="control-row">
        <div className="control-row__top">
          <span className="control-label">Monthly contribution</span>
          <span className="control-value">${Number(input.monthlyContribution).toLocaleString()}</span>
        </div>
        <input
          className="slider"
          type="range"
          min="0"
          max="2000"
          step="25"
          value={input.monthlyContribution}
          onChange={(e) => updateField('monthlyContribution', Number(e.target.value))}
        />
      </div>

      <div className="control-row">
        <div className="control-row__top">
          <span className="control-label">Annual return</span>
          <span className="control-value">{Number(input.annualRatePercent).toFixed(1)}%</span>
        </div>
        <input
          className="slider"
          type="range"
          min="-5"
          max="15"
          step="0.5"
          value={input.annualRatePercent}
          onChange={(e) => updateField('annualRatePercent', Number(e.target.value))}
        />
      </div>

      <div className="control-row">
        <div className="control-row__top">
          <span className="control-label">Inflation</span>
          <span className="control-value">{Number(input.annualInflationPercent).toFixed(1)}%</span>
        </div>
        <input
          className="slider"
          type="range"
          min="0"
          max="10"
          step="0.5"
          value={input.annualInflationPercent}
          onChange={(e) => updateField('annualInflationPercent', Number(e.target.value))}
        />
      </div>

      <div className="control-row">
        <div className="control-row__top">
          <span className="control-label">Years</span>
          <span className="control-value">{input.years}</span>
        </div>
        <input
          className="slider"
          type="range"
          min="1"
          max="40"
          step="1"
          value={input.years}
          onChange={(e) => updateField('years', Number(e.target.value))}
        />
      </div>

      <button className="button button--primary" onClick={onRecalculate} disabled={isLoading}>
        {isLoading ? 'Calculating…' : 'Recalculate'}
      </button>
    </div>
  );
}
