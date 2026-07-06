import SliderField from './SliderField.jsx';

export default function SecuritiesControls({ config, onChange }) {
    function updateField(field, value) {
        onChange({ ...config, [field]: value });
    }

    return (
        <div className="card">
            <p className="section-label">Securities vs. savings</p>

            <SliderField
                label="Savings account rate"
                value={config.savingsRatePercent}
                min={0.5}
                max={6}
                step={0.25}
                unit="%"
                onChange={(v) => updateField('savingsRatePercent', v)}
            />

            <SliderField
                label="Expected market return"
                value={config.stockExpectedRatePercent}
                min={0}
                max={15}
                step={0.5}
                unit="%"
                onChange={(v) => updateField('stockExpectedRatePercent', v)}
            />

            <SliderField
                label="Volatility (± range)"
                value={config.volatilityPercent}
                min={1}
                max={12}
                step={0.5}
                unit="%"
                onChange={(v) => updateField('volatilityPercent', v)}
            />

            <p className="control-note">
                The shaded band shows a low/high rate range, not a true simulated distribution of
                market paths — treat it as a rough sense of variability, not a statistical forecast.
            </p>
        </div>
    );
}