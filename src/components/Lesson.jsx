import { formatCurrency } from '../services/formatters.js';

const PRINCIPLES = {
    securities: 'Risk and return move together, but time shrinks the gap',
    breakeven: 'Every plan has a break-even point, find it before you commit',
    timing: 'Time in the market usually beats timing the market'
};

export default function Lesson({ mode, lines, crossoverYear, totalYears, waitYears }) {
    if (lines.length < 2) return null;

    const [lineA, lineB] = lines;
    const finalA = lineA.points[lineA.points.length - 1].value;
    const finalB = lineB.points[lineB.points.length - 1].value;
    const leader = finalA >= finalB ? lineA : lineB;
    const trailer = finalA >= finalB ? lineB : lineA;
    const gap = Math.abs(finalA - finalB);

    return (
        <div className="highlight-section">
            <p className="section-label">The lesson</p>
            <h3 className="highlight-section__title">{PRINCIPLES[mode] ?? 'What this comparison shows'}</h3>

            {mode === 'timing' ? (
                <p>
                    Waiting <strong>{waitYears} years</strong> to start costs <strong>{formatCurrency(gap)}</strong> by
                    year {totalYears}, not because the delayed plan performs worse, but because it has fewer years
                    for growth to compound on top of growth. The lost years at the start are worth more than the
                    same years at the end.
                </p>
            ) : crossoverYear !== null && crossoverYear !== undefined && crossoverYear > 0 && crossoverYear <= totalYears ? (
                <p>
                    <strong>{leader.label}</strong> overtakes <strong>{trailer.label}</strong> around{' '}
                    <strong>year {crossoverYear}</strong>, and the gap between them keeps widening after that,
                    reaching <strong>{formatCurrency(gap)}</strong> by year {totalYears}. The crossover point is
                    the moment the decision actually pays off, not the moment it was made.
                </p>
            ) : (
                <p>
                    <strong>{leader.label}</strong> stays ahead of <strong>{trailer.label}</strong> for the entire{' '}
                    {totalYears}-year span, ending {formatCurrency(gap)} higher. Within this horizon, the two never
                    converge, so extending the timeline further is the only thing that could change that.
                </p>
            )}
        </div>
    );
}