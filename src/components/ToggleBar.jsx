export default function ToggleBar({ mode, onModeChange, dollarMode, onDollarModeChange }) {
  return (
      <div className="toggle-row">
        <div className="toggle-group">
          <button
              className={mode === 'securities' ? 'toggle toggle--active' : 'toggle'}
              onClick={() => onModeChange('securities')}
          >
            Investing in securities
          </button>
          <button
              className={mode === 'breakeven' ? 'toggle toggle--active' : 'toggle'}
              onClick={() => onModeChange('breakeven')}
          >
            Break-even
          </button>
        </div>

        <div className="toggle-group">
          <button
              className={dollarMode === 'nominal' ? 'toggle toggle--active' : 'toggle'}
              onClick={() => onDollarModeChange('nominal')}
          >
            Nominal
          </button>
          <button
              className={dollarMode === 'real' ? 'toggle toggle--active' : 'toggle'}
              onClick={() => onDollarModeChange('real')}
          >
            Real
          </button>
        </div>
      </div>
  );
}