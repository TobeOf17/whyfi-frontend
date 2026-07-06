import SliderField from './SliderField.jsx';

export default function ControlPanel({ input, onChange }) {
    function updateField(field, value) {
        onChange({ ...input, [field]: value });
    }

    return (
        <div className="card">
            <p className="section-label">Shared inputs</p>

            <SliderField
                label="Starting amount"
                value={input.startingPrincipal}
                min={0}
                max={50000}
                step={500}
                unit="$"
                onChange={(v) => updateField('startingPrincipal', v)}
            />

            <SliderField
                label="Monthly contribution"
                value={input.monthlyContribution}
                min={0}
                max={2000}
                step={25}
                unit="$"
                onChange={(v) => updateField('monthlyContribution', v)}
            />

            <SliderField
                label="Years"
                value={input.years}
                min={1}
                max={40}
                step={1}
                unit=""
                onChange={(v) => updateField('years', v)}
            />

            <SliderField
                label="Inflation"
                value={input.annualInflationPercent}
                min={0}
                max={10}
                step={0.5}
                unit="%"
                onChange={(v) => updateField('annualInflationPercent', v)}
            />
        </div>
    );
}