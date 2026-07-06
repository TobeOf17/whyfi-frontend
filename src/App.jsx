import { useEffect, useRef, useState } from 'react';
import { calculateScenario } from './services/scenarioService.js';
import { findCrossoverYear, toLinePoints } from './services/compareUtils.js';
import ControlPanel from './components/ControlPanel.jsx';
import SecuritiesControls from './components/SecuritiesControls.jsx';
import BreakEvenControls from './components/BreakEvenControls.jsx';
import ToggleBar from './components/ToggleBar.jsx';
import StatRow from './components/StatRow.jsx';
import LedgerChart from './components/LedgerChart.jsx';
import MilestoneList from './components/MilestoneList.jsx';
import Explainer from './components/Explainer.jsx';

const DEBOUNCE_MS = 300;

const DEFAULT_SHARED_INPUT = {
  startingPrincipal: 5000,
  monthlyContribution: 200,
  years: 20,
  annualInflationPercent: 3
};

const DEFAULT_SECURITIES_CONFIG = {
  savingsRatePercent: 4,
  stockExpectedRatePercent: 8,
  volatilityPercent: 5
};

const DEFAULT_OPTION_A = { startingPrincipal: 5000, monthlyContribution: 300, annualRatePercent: 4 };
const DEFAULT_OPTION_B = { startingPrincipal: 0, monthlyContribution: 300, annualRatePercent: 8 };

function buildInput(shared, overrides) {
  return {
    ...shared,
    annualRatePercent: 0,
    compoundingFrequency: 'MONTHLY',
    ...overrides
  };
}

export default function App() {
  const [sharedInput, setSharedInput] = useState(DEFAULT_SHARED_INPUT);
  const [mode, setMode] = useState('securities');
  const [dollarMode, setDollarMode] = useState('nominal');
  const [securitiesConfig, setSecuritiesConfig] = useState(DEFAULT_SECURITIES_CONFIG);
  const [optionA, setOptionA] = useState(DEFAULT_OPTION_A);
  const [optionB, setOptionB] = useState(DEFAULT_OPTION_B);

  const [lines, setLines] = useState([]);
  const [band, setBand] = useState(null);
  const [crossoverYear, setCrossoverYear] = useState(null);
  const [primaryMilestones, setPrimaryMilestones] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (mode === 'securities') {
        runSecuritiesCalculation();
      } else {
        runBreakEvenCalculation();
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharedInput, mode, dollarMode, securitiesConfig, optionA, optionB]);

  function runSecuritiesCalculation() {
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
          const savingsPoints = toLinePoints(savingsResult.series, dollarMode);
          const expectedPoints = toLinePoints(expectedResult.series, dollarMode);
          const lowPoints = toLinePoints(lowResult.series, dollarMode);
          const highPoints = toLinePoints(highResult.series, dollarMode);

          setLines([
            { id: 'savings', label: 'Savings account', colorVar: 'var(--color-ink-muted)', points: savingsPoints },
            { id: 'stocks', label: 'Securities (expected)', colorVar: 'var(--color-accent-strong)', points: expectedPoints }
          ]);
          setBand({
            points: lowPoints.map((p, i) => ({ year: p.year, low: p.value, high: highPoints[i].value }))
          });
          setCrossoverYear(findCrossoverYear(savingsPoints, expectedPoints));
          setPrimaryMilestones(expectedResult.milestones);
        })
        .catch((err) => setErrorMessage(err.message))
        .finally(() => setIsLoading(false));
  }

  function runBreakEvenCalculation() {
    setIsLoading(true);
    setErrorMessage(null);

    Promise.all([
      calculateScenario(buildInput(sharedInput, optionA)),
      calculateScenario(buildInput(sharedInput, optionB))
    ])
        .then(([resultA, resultB]) => {
          const pointsA = toLinePoints(resultA.series, dollarMode);
          const pointsB = toLinePoints(resultB.series, dollarMode);

          setLines([
            { id: 'optionA', label: 'Option A', colorVar: 'var(--color-ink-muted)', points: pointsA },
            { id: 'optionB', label: 'Option B', colorVar: 'var(--color-accent-strong)', points: pointsB }
          ]);
          setBand(null);
          setCrossoverYear(findCrossoverYear(pointsA, pointsB));
          setPrimaryMilestones(resultA.milestones);
        })
        .catch((err) => setErrorMessage(err.message))
        .finally(() => setIsLoading(false));
  }

  const crossoverLabel =
      mode === 'securities' ? 'Securities overtake savings' : 'Option B overtakes Option A';

  return (
      <div className="app">
        <header className="header">
          <div>
            <p className="wordmark">Why<span>Fi</span></p>
            <p className="tagline">Financial time capsule</p>
          </div>
        </header>

        <ToggleBar mode={mode} onModeChange={setMode} dollarMode={dollarMode} onDollarModeChange={setDollarMode} />

        <div className="layout">
          <div className="panel">
            <ControlPanel input={sharedInput} onChange={setSharedInput} />

            {mode === 'securities' ? (
                <SecuritiesControls config={securitiesConfig} onChange={setSecuritiesConfig} />
            ) : (
                <BreakEvenControls optionA={optionA} optionB={optionB} onChangeA={setOptionA} onChangeB={setOptionB} />
            )}

            {errorMessage && <p className="error-note">{errorMessage}</p>}
          </div>

          <div>
            {lines.length > 0 ? (
                <>
                  <StatRow lines={lines} />

                  <div className="chart-wrap">
                    <LedgerChart
                        lines={lines}
                        band={band}
                        crossoverYear={crossoverYear}
                        crossoverLabel={crossoverLabel}
                        totalYears={sharedInput.years}
                    />
                  </div>

                  <div className="card card--spaced">
                    <p className="section-label">What this means</p>
                    <Explainer mode={mode} lines={lines} crossoverYear={crossoverYear} totalYears={sharedInput.years} />
                  </div>

                  <div className="card card--spaced">
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