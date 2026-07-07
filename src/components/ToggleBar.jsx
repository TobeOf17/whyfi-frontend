const MODES = [
    { id: 'securities', label: '01 Securities vs Savings' },
    { id: 'breakeven', label: '02 Compare' },
    { id: 'timing', label: '03 Start now vs. wait' }
];

export default function ToggleBar({ mode, onModeChange, dollarMode, onDollarModeChange }) {
    return (
        <div className="toggle-row">
            <div className="toggle-group">
                {MODES.map((m) => (
                    <button
                        key={m.id}
                        className={mode === m.id ? 'toggle toggle--active' : 'toggle'}
                        onClick={() => onModeChange(m.id)}
                    >
                        {m.label}
                    </button>
                ))}
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