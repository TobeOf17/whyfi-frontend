const ENTRIES = [
    {
        term: 'Compoound interest',
        def: 'Interest earned on both your original money and on the interest it already earned. Small early amounts matter disproportionately because they have the most time to compound on top of themselves.'
    },
    {
        term: 'Real vs. nominal returns',
        def: 'Nominal is the number on the statement. Real is that number after inflation, i.e. what it can actually buy. A 7% return with 3% inflation is a 4% real return.'
    },
    {
        term: 'Rule of 72',
        def: 'A quick estimate for how long money takes to double: divide 72 by the annual rate. At 8%, that\u2019s roughly 9 years.'
    },
    {
        term: 'Sequence-of-returns risk',
        def: 'The same average return can produce very different outcomes depending on the order the gains and losses arrive in \u2014 especially dangerous in the years just before or after retirement.'
    },
    {
        term: 'Break-even point',
        def: 'The moment one financial path overtakes another. Before it, the "better" choice can look worse; the break-even point is when the math actually flips.'
    },
    {
        term: 'Opportunity cost',
        def: 'What you give up by choosing one option instead of another \u2014 for example, the growth that money not invested elsewhere could have earned.'
    }
];

export default function LearnPage() {
    return (
        <div>
            <p className="page-title">Learn</p>
            <p className="page-description">
                Core financial concepts, explained plainly. The vocabulary behind everything you'll see
                in Explore.
            </p>
            <div>
                {ENTRIES.map((entry) => (
                    <div className="glossary-entry" key={entry.term}>
                        <p className="glossary-entry__term">{entry.term}</p>
                        <p className="glossary-entry__def">{entry.def}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}