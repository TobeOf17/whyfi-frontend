import { formatCurrency } from './formatters.js';
import { formatThreshold } from './wealthMilestones.js';

/**
 * Each rule checks a condition against the current scenario data and, if it
 * applies, returns a sentence. Rules are intentionally simple and legible —
 * this is meant to be easy to audit and extend, not a black box.
 */
export function buildInsights({ mode, lines, band, crossoverYear, wealthHitsByLine, primaryBreakdown, sharedInput }) {
    const insights = [];
    const [lineA, lineB] = lines;

    if (lineA && lineB) {
        const finalA = lineA.points[lineA.points.length - 1].value;
        const finalB = lineB.points[lineB.points.length - 1].value;
        const leader = finalA >= finalB ? lineA : lineB;
        const trailer = finalA >= finalB ? lineB : lineA;
        const gap = Math.abs(finalA - finalB);

        if (crossoverYear !== null && crossoverYear !== undefined && crossoverYear > 0 && crossoverYear <= sharedInput.years) {
            insights.push(
                `${leader.label} permanently overtakes ${trailer.label} around year ${crossoverYear}.`
            );
        } else {
            insights.push(
                `${leader.label} stays ahead the entire ${sharedInput.years}-year span, and the gap never closes.`
            );
        }

        if (gap > 0) {
            insights.push(`By year ${sharedInput.years}, that difference is worth ${formatCurrency(gap)}.`);
        }
    }

    if (band) {
        const finalLow = band.points[band.points.length - 1].low;
        const finalHigh = band.points[band.points.length - 1].high;
        const spread = finalHigh - finalLow;
        insights.push(
            `Return variability alone creates a ${formatCurrency(spread)} spread in possible outcomes by year ${sharedInput.years}.`
        );
    }

    if (primaryBreakdown && primaryBreakdown.contributions > 0) {
        const growthShare = primaryBreakdown.growth / (primaryBreakdown.contributions + primaryBreakdown.growth || 1);
        if (growthShare > 0.5) {
            insights.push(
                `More than half of the leading plan's final balance came from growth, not money you put in.`
            );
        }
    }

    if (wealthHitsByLine) {
        for (const { label, hits } of wealthHitsByLine) {
            for (const hit of hits) {
                insights.push(`${label} crosses ${formatThreshold(hit.threshold)} in year ${hit.year}.`);
            }
        }
    }

    if (sharedInput.annualInflationPercent > 0) {
        insights.push(
            `At ${sharedInput.annualInflationPercent}% inflation, switch to the Real toggle to see what these numbers are actually worth in today's dollars.`
        );
    }

    return insights;
}