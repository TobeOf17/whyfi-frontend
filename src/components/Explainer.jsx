import { formatCurrency } from '../services/formatters.js';

export default function Explainer({ mode, lines, crossoverYear, totalYears }) {
    if (lines.length < 2) return null;

    const [lineA, lineB] = lines;
    const finalA = lineA.points[lineA.points.length - 1].value;
    const finalB = lineB.points[lineB.points.length - 1].value;
    const leader = finalA >= finalB ? lineA : lineB;
    const trailer = finalA >= finalB ? lineB : lineA;
    const leaderFinal = Math.max(finalA, finalB);
    const trailerFinal = Math.min(finalA, finalB);

    if (crossoverYear === null || crossoverYear === undefined) {
        return (
            <p className="explainer">
                Over <strong>{totalYears} years</strong>, <strong>{leader.label}</strong> stays ahead of{' '}
                <strong>{trailer.label}</strong> the whole way, ending at{' '}
                <strong>{formatCurrency(leaderFinal)}</strong> versus{' '}
                <strong>{formatCurrency(trailerFinal)}</strong>.
            </p>
        );
    }

    return (
        <p className="explainer">
            {mode === 'securities' ? (
                <>
                    Around <strong>year {crossoverYear}</strong>, the expected market return overtakes the
                    savings account. By year {totalYears}, <strong>{leader.label}</strong> reaches{' '}
                    <strong>{formatCurrency(leaderFinal)}</strong> versus{' '}
                    <strong>{formatCurrency(trailerFinal)}</strong> — though the shaded range shows real
                    outcomes could land well above or below that.
                </>
            ) : (
                <>
                    <strong>{leader.label}</strong> overtakes <strong>{trailer.label}</strong> around{' '}
                    <strong>year {crossoverYear}</strong>. By year {totalYears}, that gap grows to{' '}
                    <strong>{formatCurrency(leaderFinal - trailerFinal)}</strong>.
                </>
            )}
        </p>
    );
}