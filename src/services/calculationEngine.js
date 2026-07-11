/**
 * Client-side port of the original Spring Boot CompoundInterestEngine.
 *
 * What changed moving from Java to JS, and why it's fine:
 * - The Java version used BigDecimal deliberately, since binary floating
 *   point can't represent every decimal exactly. JS only has doubles.
 *   For a projection tool that rounds to cents for display over a few
 *   hundred compounding periods, the error this introduces is far smaller
 *   than the uncertainty in the input assumptions themselves (nobody's
 *   return rate is accurate to the 10th decimal place), so it's a real,
 *   acknowledged trade-off rather than a silent one, but not a practical
 *   problem for this use case.
 * - The backend's @Min/@Max validation on ScenarioInput is gone along with
 *   the backend itself, and textbox inputs have no upper limit by design.
 *   Without a server to reject an absurd input, this file has to guard
 *   against one itself (e.g. someone typing 999999 into "years"), or a
 *   single bad input could lock up the browser tab in a giant synchronous
 *   loop. The clamps below exist for that reason, not as arbitrary limits.
 */

const PERIODS_PER_YEAR = { MONTHLY: 12, DAILY: 365, ANNUALLY: 1 };

// Safety bounds — generous enough to never get in a real user's way, tight
// enough that a stray huge textbox value can't hang the tab.
const MAX_YEARS = 100;
const MAX_MAGNITUDE = 1_000_000_000; // starting principal / monthly contribution
const MIN_RATE = -50;
const MAX_RATE = 50;

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function round2(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}

function yearPoint(year, balance, cumulativeContributions, annualInflation) {
    const cumulativeGrowth = Math.max(balance - cumulativeContributions, 0);
    const deflator = Math.pow(1 + annualInflation, Math.max(year, 0));
    const balanceReal = balance / deflator;
    return {
        year,
        balanceNominal: round2(balance),
        balanceReal: round2(balanceReal),
        cumulativeContributions: round2(cumulativeContributions),
        cumulativeGrowth: round2(cumulativeGrowth)
    };
}

function detectMilestones(series, annualRatePercent) {
    const milestones = [];

    for (const point of series) {
        if (point.year > 0 && point.cumulativeGrowth > point.cumulativeContributions) {
            milestones.push({
                year: point.year,
                type: 'GROWTH_OVERTAKES_CONTRIBUTIONS',
                label: `Year ${point.year}: growth now makes up more of the balance than what was put in`
            });
            break;
        }
    }

    const startingBalance = series[0].balanceNominal;
    if (startingBalance > 0) {
        const doubleTarget = startingBalance * 2;
        for (const point of series) {
            if (point.year > 0 && point.balanceNominal >= doubleTarget) {
                milestones.push({
                    year: point.year,
                    type: 'BALANCE_DOUBLES',
                    label: `Year ${point.year}: the starting balance has doubled`
                });
                break;
            }
        }
    }

    if (annualRatePercent > 0) {
        const ruleOf72Year = Math.round(72 / annualRatePercent);
        milestones.push({
            year: ruleOf72Year,
            type: 'RULE_OF_72_ESTIMATE',
            label: `Rule of 72 estimate: money doubles roughly every ${ruleOf72Year} years at this rate`
        });
    }

    return milestones;
}

export function calculate(input) {
    const years = Math.round(clamp(input.years, 1, MAX_YEARS));
    const startingPrincipal = clamp(input.startingPrincipal, 0, MAX_MAGNITUDE);
    const monthlyContribution = clamp(input.monthlyContribution, 0, MAX_MAGNITUDE);
    const annualRatePercent = clamp(input.annualRatePercent, MIN_RATE, MAX_RATE);
    const annualInflationPercent = clamp(input.annualInflationPercent ?? 0, 0, 20);
    const compoundingFrequency = input.compoundingFrequency || 'MONTHLY';

    const periodsPerYear = PERIODS_PER_YEAR[compoundingFrequency] || 12;
    const periodRate = annualRatePercent / 100 / periodsPerYear;
    const periodContribution = (monthlyContribution * 12) / periodsPerYear;
    const annualInflation = annualInflationPercent / 100;

    const series = [];
    let balance = startingPrincipal;
    let cumulativeContributions = startingPrincipal;

    series.push(yearPoint(0, balance, cumulativeContributions, annualInflation));

    const totalPeriods = years * periodsPerYear;
    for (let period = 1; period <= totalPeriods; period++) {
        balance = balance * (1 + periodRate) + periodContribution;
        cumulativeContributions += periodContribution;

        if (period % periodsPerYear === 0) {
            const year = period / periodsPerYear;
            series.push(yearPoint(year, balance, cumulativeContributions, annualInflation));
        }
    }

    const milestones = detectMilestones(series, annualRatePercent);
    const last = series[series.length - 1];

    return {
        series,
        milestones,
        finalBalanceNominal: last.balanceNominal,
        finalBalanceReal: last.balanceReal
    };
}