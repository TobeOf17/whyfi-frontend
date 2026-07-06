export default function SliderField({ label, value, min, max, step, unit, onChange }) {
    function handleTextChange(e) {
        const raw = e.target.value;
        if (raw === '') return;
        const next = Number(raw);
        if (!Number.isNaN(next)) {
            onChange(next);
        }
    }

    const clampedValue = Math.min(Math.max(value, min), max);
    const fillPercent = ((clampedValue - min) / (max - min)) * 100;
    // WebKit has no native "filled track" pseudo-element (Firefox does, via
    // ::-moz-range-progress in the stylesheet) — so for Chrome/Safari/Edge the
    // fill has to be painted as a computed gradient background tied to the
    // live value. This is data-driven, not static styling, so it's the one
    // place inline style is the right tool rather than the stylesheet.
    const trackStyle = {
        background: `linear-gradient(to right, var(--color-accent-strong) ${fillPercent}%, var(--color-border-strong) ${fillPercent}%)`
    };

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
                value={clampedValue}
                style={trackStyle}
                onChange={(e) => onChange(Number(e.target.value))}
            />
        </div>
    );
}