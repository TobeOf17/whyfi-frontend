const PRESETS = [
    { id: 'more-contribution', label: '+$100/mo', apply: (shared) => ({ ...shared, monthlyContribution: shared.monthlyContribution + 100 }) },
    { id: 'less-contribution', label: 'Skip a year', apply: (shared) => ({ ...shared, monthlyContribution: 0 }) },
    { id: 'higher-inflation', label: '+2% inflation', apply: (shared) => ({ ...shared, annualInflationPercent: shared.annualInflationPercent + 2 }) },
    { id: 'reset', label: 'Reset', apply: null }
];

export default function WhatIfPanel({ sharedInput, onChange, baselineInput }) {
    function handleClick(preset) {
        if (preset.apply === null) {
            onChange(baselineInput);
            return;
        }
        onChange(preset.apply(sharedInput));
    }

    return (
        <div className="plain-section">
            <p className="section-label">What if?</p>
            <div className="whatif-row">
                {PRESETS.map((preset) => (
                    <button key={preset.id} className="whatif-chip" onClick={() => handleClick(preset)}>
                        {preset.label}
                    </button>
                ))}
            </div>
        </div>
    );
}