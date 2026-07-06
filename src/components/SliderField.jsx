export default function SliderField({ label, value, min, max, step, unit, onChange }) {
    function handleTextChange(e) {
        const raw = e.target.value;
        if (raw === '') return;
        const next = Number(raw);
        if (!Number.isNaN(next)) {
            onChange(next);
        }
    }

    return (
        <div className="control-row">
            <div className="control-row__top">
                <span className="control-label">{label}</span>
                <span className="control-value-group">
          {unit === '$' && <span className="control-value-prefix">$</span>}
                    <input className="control-textbox" type="number" value={value} step={step} onChange={handleTextChange} />
                    {unit === '%' && <span className="control-value-suffix">%</span>}
        </span>
            </div>
            <input
                className="slider"
                type="range"
                min={min}
                max={max}
                step={step}
                value={Math.min(Math.max(value, min), max)}
                onChange={(e) => onChange(Number(e.target.value))}
            />
        </div>
    );
}