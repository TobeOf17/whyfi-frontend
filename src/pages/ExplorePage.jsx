import { useEffect, useRef, useState } from 'react';
import { calculateScenario } from '../services/scenarioService.js';
import { findCrossoverYear, toLinePoints, delayLine } from '../services/compareUtils.js';
import { findWealthMilestones, formatThreshold } from '../services/wealthMilestones.js';
import { buildInsights } from '../services/insightRules.js';
import ControlPanel from '../components/ControlPanel.jsx';
import SecuritiesControls from '../components/SecuritiesControls.jsx';
import BreakEvenControls from '../components/BreakEvenControls.jsx';
import TimingControls from '../components/TimingControls.jsx';
import ToggleBar from '../components/ToggleBar.jsx';
import WhatIfPanel from '../components/WhatIfPanel.jsx';
import StatRow from '../components/StatRow.jsx';
import LedgerChart from '../components/LedgerChart.jsx';
import MilestoneList from '../components/MilestoneList.jsx';
import YouVsMoneyBreakdown from '../components/YouVsMoneyBreakdown.jsx';
import LiveInsights from '../components/LiveInsights.jsx';
import Lesson from '../components/Lesson.jsx';

const DEBOUNCE_MS = 300;

const DEFAULT_SHARED_INPUT = {
    startingPrincipal: 5000,
    monthlyContribution: 200,
    years: 20,
    annualInflationPercent: 3
};

const DEFAULT_SECURITIES_CONFIG = { savingsRatePercent: 4, stockExpectedRatePercent: 8, volatilityPercent: 5 };
const DEFAULT_OPTION_A = { startingPrincipal: 5000, monthlyContribution: 300, annualRatePercent: 4 };
const DEFAULT_OPTION_B = { startingPrincipal: 0, monthlyContribution: 300, annualRatePercent: 8 };
const DEFAULT_TIMING_CONFIG = { waitYears: 5, annualRatePercent: 8 };

function buildInput(shared, overrides) {
    return { ...shared, annualRatePercent: 0, compoundingFrequency: 'MONTHLY', ...overrides };
}

export default function ExplorePage({ currentAge }) {
    const [sharedInput, setSharedInput] = useState(DEFAULT_SHARED_INPUT);
    const [mode, setMode] = useState('securities');
    const [dollarMode, setDollarMode] = useState('nominal');
    const [securitiesConfig, setSecuritiesConfig] = useState(DEFAULT_SECURITIES_CONFIG);
    const [optionA, setOptionA] = useState(DEFAULT_OPTION_A);
    const [optionB, setOptionB] = useState(DEFAULT_OPTION_B);
    const [timingConfig, setTimingConfig] = useState(DEFAULT_TIMING_CONFIG);

    const [lines, setLines] = useState([]);
    const [band, setBand] = useState(null);
    const [crossoverYear, setCrossoverYear] = useState(null);
    const [primaryMilestones, setPrimaryMilestones] = useState([]);
    const [primaryBreakdown, setPrimaryBreakdown] = useState(null);
    const [wealthHitsByLine, setWealthHitsByLine] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [resultVersion, setResultVersion] = useState(0);

    const debounceRef = useRef(null);
    const requestIdRef = useRef(0);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            if (mode === 'securities') runSecuritiesCalculation();
            else if (mode === 'breakeven') runBreakEvenCalculation();
            else runTimingCalculation();
        }, DEBOUNCE_MS);
        return () => clearTimeout(debounceRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sharedInput, mode, dollarMode, securitiesConfig, optionA, optionB, timingConfig]);

    function finishWithLines(builtLines, primaryResult) {
        const wealthHits = builtLines.map((line) => ({
            label: line.label,
            colorVar: line.colorVar,
            hits: findWealthMilestones(line.points)
        }));
        setWealthHitsByLine(wealthHits);
        setPrimaryMilestones(primaryResult.milestones);
        const lastPoint = primaryResult.series[primaryResult.series.length - 1];
        setPrimaryBreakdown({ contributions: lastPoint.cumulativeContributions, growth: lastPoint.cumulativeGrowth });
        setResultVersion((v) => v + 1);
    }

    function runSecuritiesCalculation() {
        const thisRequestId = ++requestIdRef.current;
        setIsLoading(true);
        setErrorMessage(null);
        const { savingsRatePercent, stockExpectedRatePercent, volatilityPercent } = securitiesConfig;

        Promise.all([
            calculateScenario(buildInput(sharedInput, { annualRatePercent: savingsRatePercent })),
            calculateScenario(buildInput(sharedInput, { annualRatePercent: stockExpectedRatePercent - volatilityPercent })),
            calculateScenario(buildInput(sharedInput, { annualRatePercent: stockExpectedRatePercent })),
            calculateScenario(buildInput(sharedInput, { annualRatePercent: stockExpectedRatePercent + volatilityPercent }))
        ])
            .then(([savingsResult, lowResult, expectedResult, highResult]) => {
                if (thisRequestId !== requestIdRef.current) return;

                const savingsPoints = toLinePoints(savingsResult.series, dollarMode);
                const expectedPoints = toLinePoints(expectedResult.series, dollarMode);
                const lowPoints = toLinePoints(lowResult.series, dollarMode);
                const highPoints = toLinePoints(highResult.series, dollarMode);

                const builtLines = [
                    { id: 'savings', label: 'Savings account', colorVar: 'var(--color-line-a)', points: savingsPoints, showDelta: false },
                    { id: 'stocks', label: 'Securities (expected)', colorVar: 'var(--color-line-b)', points: expectedPoints }
                ];
                setLines(builtLines);
                setBand({ points: lowPoints.map((p, i) => ({ year: p.year, low: p.value, high: highPoints[i].value })) });
                setCrossoverYear(findCrossoverYear(savingsPoints, expectedPoints));
                finishWithLines(builtLines, expectedResult);
            })
            .catch((err) => {
                if (thisRequestId === requestIdRef.current) setErrorMessage(err.message);
            })
            .finally(() => {
                if (thisRequestId === requestIdRef.current) setIsLoading(false);
            });
    }

    function runBreakEvenCalculation() {
        const thisRequestId = ++requestIdRef.current;
        setIsLoading(true);
        setErrorMessage(null);

        Promise.all([calculateScenario(buildInput(sharedInput, optionA)), calculateScenario(buildInput(sharedInput, optionB))])
            .then(([resultA, resultB]) => {
                if (thisRequestId !== requestIdRef.current) return;

                const pointsA = toLinePoints(resultA.series, dollarMode);
                const pointsB = toLinePoints(resultB.series, dollarMode);

                const builtLines = [
                    { id: 'optionA', label: 'Option A', colorVar: 'var(--color-line-a)', points: pointsA },
                    { id: 'optionB', label: 'Option B', colorVar: 'var(--color-line-b)', points: pointsB }
                ];
                setLines(builtLines);
                setBand(null);
                setCrossoverYear(findCrossoverYear(pointsA, pointsB));
                finishWithLines(builtLines, resultA);
            })
            .catch((err) => {
                if (thisRequestId === requestIdRef.current) setErrorMessage(err.message);
            })
            .finally(() => {
                if (thisRequestId === requestIdRef.current) setIsLoading(false);
            });
    }

    function runTimingCalculation() {
        const thisRequestId = ++requestIdRef.current;
        setIsLoading(true);
        setErrorMessage(null);
        const { waitYears, annualRatePercent } = timingConfig;
        const remainingYears = Math.max(1, sharedInput.years - waitYears);

        Promise.all([
            calculateScenario(buildInput(sharedInput, { annualRatePercent })),
            calculateScenario(buildInput({ ...sharedInput, years: remainingYears }, { annualRatePercent }))
        ])
            .then(([nowResult, waitResult]) => {
                if (thisRequestId !== requestIdRef.current) return;

                const nowPoints = toLinePoints(nowResult.series, dollarMode);
                const waitPointsRaw = toLinePoints(waitResult.series, dollarMode);
                const waitPoints = delayLine(waitPointsRaw, waitYears);

                const builtLines = [
                    { id: 'startnow', label: 'Start now', colorVar: 'var(--color-line-a)', points: nowPoints },
                    { id: 'wait', label: `Wait ${waitYears} years`, colorVar: 'var(--color-line-b)', dashed: true, points: waitPoints, showDelta: false }
                ];
                setLines(builtLines);
                setBand(null);
                setCrossoverYear(findCrossoverYear(nowPoints, waitPoints));
                finishWithLines(builtLines, nowResult);
            })
            .catch((err) => {
                if (thisRequestId === requestIdRef.current) setErrorMessage(err.message);
            })
            .finally(() => {
                if (thisRequestId === requestIdRef.current) setIsLoading(false);
            });
    }

    const markers = [];
    if (crossoverYear !== null && crossoverYear !== undefined && crossoverYear > 0) {
        markers.push({ year: crossoverYear, label: 'Crossover' });
    }
    for (const { hits, colorVar } of wealthHitsByLine) {
        for (const hit of hits) {
            markers.push({ year: hit.year, label: formatThreshold(hit.threshold), colorVar });
        }
    }

    const insights = lines.length
        ? buildInsights({ mode, lines, band, crossoverYear, wealthHitsByLine, primaryBreakdown, sharedInput })
        : [];

    return (
        <div>
            <p className="page-title">Explore</p>
            <p className="page-description">
                Compare financial paths side by side and see where one overtakes the other.
            </p>

            <ToggleBar mode={mode} onModeChange={setMode} dollarMode={dollarMode} onDollarModeChange={setDollarMode} />

            <div className="layout">
                <div className="panel">
                    {mode !== 'breakeven' && <ControlPanel input={sharedInput} onChange={setSharedInput} />}

                    {mode === 'securities' && <SecuritiesControls config={securitiesConfig} onChange={setSecuritiesConfig} />}
                    {mode === 'breakeven' && (
                        <BreakEvenControls
                            sharedInput={sharedInput}
                            onSharedInputChange={setSharedInput}
                            optionA={optionA}
                            optionB={optionB}
                            onChangeA={setOptionA}
                            onChangeB={setOptionB}
                        />
                    )}
                    {mode === 'timing' && (
                        <TimingControls config={timingConfig} onChange={setTimingConfig} maxWait={Math.max(1, sharedInput.years - 1)} />
                    )}

                    <WhatIfPanel sharedInput={sharedInput} onChange={setSharedInput} baselineInput={DEFAULT_SHARED_INPUT} />

                    {errorMessage && <p className="error-note">{errorMessage}</p>}
                </div>

                <div>
                    {lines.length > 0 ? (
                        <>
                            <div key={`stats-${resultVersion}`}>
                                <StatRow lines={lines} />
                            </div>

                            <div key={`chart-${resultVersion}`} className="chart-wrap">
                                <LedgerChart
                                    lines={lines}
                                    band={band}
                                    markers={markers}
                                    totalYears={sharedInput.years}
                                    currentAge={currentAge}
                                />
                            </div>

                            <div key={`lesson-${resultVersion}`} className="fade-in">
                                <Lesson mode={mode} lines={lines} crossoverYear={crossoverYear} totalYears={sharedInput.years} waitYears={timingConfig.waitYears} />
                            </div>

                            <div key={`breakdown-${resultVersion}`} className="fade-in">
                                <YouVsMoneyBreakdown breakdown={primaryBreakdown} lineLabel={lines[mode === 'timing' ? 0 : mode === 'breakeven' ? 0 : 1].label} />
                            </div>

                            <div key={`insights-${resultVersion}`} className="fade-in">
                                <LiveInsights insights={insights} />
                            </div>

                            <div className="plain-section">
                                <p className="section-label">Milestones</p>
                                <MilestoneList milestones={primaryMilestones} />
                            </div>
                        </>
                    ) : (
                        <p className="empty-note">{isLoading ? 'Calculating…' : 'Adjust an input to begin.'}</p>
                    )}
                </div>
            </div>
        </div>
    );
}