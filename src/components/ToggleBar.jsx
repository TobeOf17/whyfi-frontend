export default function ToggleBar({ dollarMode, onDollarModeChange, viewMode, onViewModeChange }) {
  return (
    <div className="toggle-row">
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

      <div className="toggle-group">
        <button
          className={viewMode === 'what' ? 'toggle toggle--active' : 'toggle'}
          onClick={() => onViewModeChange('what')}
        >
          What
        </button>
        <button
          className={viewMode === 'why' ? 'toggle toggle--active' : 'toggle'}
          onClick={() => onViewModeChange('why')}
        >
          Why
        </button>
      </div>
    </div>
  );
}
