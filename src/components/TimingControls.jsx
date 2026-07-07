import SliderField from './SliderField.jsx';

export default function TimingControls({ config, onChange, maxWait }) {
    function updateField(field, value) {
        onChange({ ...config, [field]: value });
    }

    return (
        <div className="card">
            <p className="section-label">Start now vs. wait</p>

            <SliderField
                label="Years to wait"
                value={config.waitYears}
                min={1}
                max={maxWait}
                step={1}
                unit=""
                onChange={(v) => updateField('waitYears', v)}
            />

            <SliderField
                label="Annual return"
                value={config.annualRatePercent}
                min={0}
                max={15}
                step={0.5}
                unit="%"
                onChange={(v) => updateField('annualRatePercent', v)}
            />

            <p className="control-note">
                Both paths use the same rate and contribution. The only difference is when they start.
                The "wait" path is modeled by running the same math for a shorter remaining duration and
                shifting it down the timeline.
            </p>
        </div>
    );
}