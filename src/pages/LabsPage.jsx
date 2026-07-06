import { useState } from 'react';
import CompoundingLab from '../labs/CompoundingLab.jsx';
import InflationLab from '../labs/InflationLab.jsx';

const LABS = [
    { id: 'compounding', title: 'Compounding', desc: 'Why small, steady contributions grow into large numbers.', ready: true },
    { id: 'inflation', title: 'Inflation', desc: 'What today\u2019s money will actually be worth later.', ready: true },
    { id: 'fees', title: 'Fees', desc: 'How a 1% expense ratio compounds against you too.', ready: false },
    { id: 'debt-vs-investing', title: 'Debt vs. investing', desc: 'When to pay down debt versus invest the difference.', ready: false },
    { id: 'buy-vs-rent', title: 'Buy vs. rent', desc: 'The real breakeven point behind a mortgage decision.', ready: false },
    { id: 'retirement', title: 'Retirement', desc: 'Working backward from a retirement number to a savings rate.', ready: false }
];

export default function LabsPage() {
    const [activeLab, setActiveLab] = useState(null);

    if (activeLab === 'compounding') return <CompoundingLab onBack={() => setActiveLab(null)} />;
    if (activeLab === 'inflation') return <InflationLab onBack={() => setActiveLab(null)} />;

    return (
        <div>
            <p className="section-label">Financial labs</p>
            <p className="control-note">
                Short, focused experiments. Each one asks you to predict an outcome before showing you the real result.
            </p>

            <div className="lab-list">
                {LABS.map((lab) => (
                    <button
                        key={lab.id}
                        className="lab-entry"
                        disabled={!lab.ready}
                        onClick={() => lab.ready && setActiveLab(lab.id)}
                    >
                        <div>
                            <p className="lab-entry__title">{lab.title}</p>
                            <p className="lab-entry__desc">{lab.desc}</p>
                        </div>
                        <span className="lab-entry__tag">{lab.ready ? 'Open' : 'In development'}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}