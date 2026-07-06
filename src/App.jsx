import { useEffect, useState } from 'react';
import { getPresets, calculateScenario } from './services/scenarioService.js';
import PresetGrid from './components/PresetGrid.jsx';
import ControlPanel from './components/ControlPanel.jsx';
import ToggleBar from './components/ToggleBar.jsx';
import StatRow from './components/StatRow.jsx';
import LedgerChart from './components/LedgerChart.jsx';
import MilestoneList from './components/MilestoneList.jsx';
import Explainer from './components/Explainer.jsx';

const DEFAULT_INPUT = {
  startingPrincipal: 5000,
  monthlyContribution: 200,
  annualRatePercent: 8,
  years: 20,
  annualInflationPercent: 3,
  compoundingFrequency: 'MONTHLY'
};

export default function App() {
  const [presets, setPresets] = useState([]);
  const [activePresetId, setActivePresetId] = useState(null);
  const [input, setInput] = useState(DEFAULT_INPUT);
  const [result, setResult] = useState(null);
  const [dollarMode, setDollarMode] = useState('nominal');
  const [viewMode, setViewMode] = useState('what');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    getPresets()
      .then(setPresets)
      .catch(() => setErrorMessage('Could not load presets. Is the backend running?'));
    runCalculation(DEFAULT_INPUT);
  }, []);

  function runCalculation(scenarioInput) {
    setIsLoading(true);
    setErrorMessage(null);
    calculateScenario(scenarioInput)
      .then(setResult)
      .catch((err) => setErrorMessage(err.message))
      .finally(() => setIsLoading(false));
  }

  function handleSelectPreset(preset) {
    setActivePresetId(preset.id);
    setInput(preset.input);
    runCalculation(preset.input);
  }

  function handleInputChange(nextInput) {
    setActivePresetId(null);
    setInput(nextInput);
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <p className="wordmark">Why<span>Fi</span></p>
          <p className="tagline">Financial time capsule</p>
        </div>
      </header>

      <div className="layout">
        <div className="panel">
          <div>
            <p className="section-label">Start from a scenario</p>
            <PresetGrid presets={presets} activePresetId={activePresetId} onSelect={handleSelectPreset} />
          </div>

          <ControlPanel
            input={input}
            onChange={handleInputChange}
            onRecalculate={() => runCalculation(input)}
            isLoading={isLoading}
          />

          {errorMessage && <p className="error-note">{errorMessage}</p>}
        </div>

        <div>
          <ToggleBar
            dollarMode={dollarMode}
            onDollarModeChange={setDollarMode}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {result ? (
            <>
              <StatRow result={result} dollarMode={dollarMode} />

              <div className="chart-wrap">
                <LedgerChart result={result} viewMode={viewMode} dollarMode={dollarMode} />
              </div>

              <div className="card card--spaced">
                <p className="section-label">What this means</p>
                <Explainer result={result} input={input} dollarMode={dollarMode} />
              </div>

              <div className="card card--spaced">
                <p className="section-label">Milestones</p>
                <MilestoneList milestones={result.milestones} />
              </div>
            </>
          ) : (
            <p className="empty-note">Calculating…</p>
          )}
        </div>
      </div>
    </div>
  );
}
