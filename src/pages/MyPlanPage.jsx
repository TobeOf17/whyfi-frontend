import SliderField from '../components/SliderField.jsx';

export default function MyPlanPage({ profile, onChange }) {
    function updateField(field, value) {
        onChange({ ...profile, [field]: value });
    }

    const yearsToRetirement = Math.max(0, profile.retirementAge - profile.currentAge);

    return (
        <div>
            <p className="section-label">My plan</p>

            <div className="card">
                <SliderField
                    label="Your current age"
                    value={profile.currentAge}
                    min={16}
                    max={80}
                    step={1}
                    unit=""
                    onChange={(v) => updateField('currentAge', v)}
                />
                <SliderField
                    label="Target retirement age"
                    value={profile.retirementAge}
                    min={profile.currentAge + 1}
                    max={85}
                    step={1}
                    unit=""
                    onChange={(v) => updateField('retirementAge', v)}
                />
            </div>

            <div className="highlight-section">
                <p className="section-label">Your timeline</p>
                <h3 className="highlight-section__title">
                    {yearsToRetirement} years until your target retirement age
                </h3>
                <p>
                    This age is now used across Explore &mdash; the chart's timeline shows your actual age at
                    each point instead of just a year count, so "year 15" reads as "age {profile.currentAge + 15}."
                </p>
            </div>
        </div>
    );
}