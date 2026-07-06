import SliderField from './SliderField.jsx';

function OptionBlock({ title, option, onChange }) {
    function updateField(field, value) {
        onChange({ ...option, [field]: value });
    }

    return (
        <div className="option-block">
            <p className="option-block__title">{title}</p>

            <SliderField
                label="Starting amount"
                value={option.startingPrincipal}
                min={0}
                max={50000}
                step={500}
                unit="$"
                onChange={(v) => updateField('startingPrincipal', v)}
            />

            <SliderField
                label="Monthly contribution"
                value={option.monthlyContribution}
                min={0}
                max={2000}
                step={25}
                unit="$"
                onChange={(v) => updateField('monthlyContribution', v)}
            />

            <SliderField
                label="Annual rate"
                value={option.annualRatePercent}
                min={-5}
                max={15}
                step={0.5}
                unit="%"
                onChange={(v) => updateField('annualRatePercent', v)}
            />
        </div>
    );
}

export default function BreakEvenControls({ sharedInput, onSharedInputChange, optionA, optionB, onChangeA, onChangeB }) {
    function updateShared(field, value) {
        onSharedInputChange({ ...sharedInput, [field]: value });
    }

    return (
        <div className="card">
            <p className="section-label">Compare two plans</p>

            <SliderField
                label="Years"
                value={sharedInput.years}
                min={1}
                max={40}
                step={1}
                unit=""
                onChange={(v) => updateShared('years', v)}
            />
            <SliderField
                label="Inflation"
                value={sharedInput.annualInflationPercent}
                min={0}
                max={10}
                step={0.5}
                unit="%"
                onChange={(v) => updateShared('annualInflationPercent', v)}
            />

            <div className="option-divider" />
            <OptionBlock title="Option A" option={optionA} onChange={onChangeA} />
            <div className="option-divider" />
            <OptionBlock title="Option B" option={optionB} onChange={onChangeB} />
        </div>
    );
}