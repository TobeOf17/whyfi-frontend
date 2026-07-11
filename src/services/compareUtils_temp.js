/**
 * Finds the year at which lineB overtakes lineA, relative to where they
 * started. Returns null if they never cross within the horizon.
 * Both inputs are arrays of { year, value }, same length, same years.
 */
export function findCrossoverYear(lineA, lineB) {
    if (!lineA.length || !lineB.length) return null;

    const initialDiff = lineA[0].value - lineB[0].value;
    if (initialDiff === 0) return lineA[0].year;

    for (let i = 1; i < lineA.length; i++) {
        const diff = lineA[i].value - lineB[i].value;
        if (diff === 0 || Math.sign(diff) !== Math.sign(initialDiff)) {
            return lineA[i].year;
        }
    }
    return null;
}

/** Converts a raw ScenarioResult series into a simple {year, value} line for charting. */
export function toLinePoints(series, dollarMode) {
    return series.map((point) => ({
        year: point.year,
        value: dollarMode === 'real' ? point.balanceReal : point.balanceNominal
    }));
}

/**
 * Takes a line that was computed as if it started at year 0, and shifts it to
 * start at `delayYears` instead — padding the front with zero-balance years.
 * Used for "start now vs. wait N years" comparisons without needing a
 * backend change: we just run the engine for the shorter remaining duration
 * and shift the result down the timeline.
 */
export function delayLine(points, delayYears) {
    const prefix = Array.from({ length: delayYears }, (_, i) => ({ year: i, value: 0 }));
    const shifted = points.map((p) => ({ year: p.year + delayYears, value: p.value }));
    return [...prefix, ...shifted];
}