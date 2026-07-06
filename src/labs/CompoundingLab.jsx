import { calculateScenario } from '../services/scenarioService.js';
import { formatCurrency } from '../services/formatters.js';
import PredictReveal from './PredictReveal.jsx';

const SCENARIO = {
    startingPrincipal: 0,
    monthlyContribution: 200,
    years: 30,
    annualInflationPercent: 0,
    annualRatePercent: 8,
    compoundingFrequency: 'MONTHLY'
};

export default function CompoundingLab({ onBack }) {
    function reveal() {
        return calculateScenario(SCENARIO).then((result) => {
            const last = result.series[result.series.length - 1];
            return { final: last.balanceNominal, contributions: last.cumulativeContributions, growth: last.cumulativeGrowth };
        });
    }

    return (
        <div>
            <button className="back-link" onClick={onBack}>
                &larr; Back to labs
            </button>
            <h2 className="highlight-section__title lab-title">Lab: Compounding</h2>
            <p className="control-note">
                $200 a month, invested for 30 years at an 8% average annual return, starting from $0.
            </p>

            <PredictReveal question="How much do you think this adds up to?" unitLabel="dollars" onReveal={reveal}>
                {(result, guess) => {
                    const diff = result.final - guess;
                    return (
                        <div className="reveal-result">
                            <div className="reveal-result__row">
                                <span>Your guess</span>
                                <span className="hero-figure">{formatCurrency(guess || 0)}</span>
                            </div>
                            <div className="reveal-result__row">
                                <span>Actual result</span>
                                <span className="hero-figure">{formatCurrency(result.final)}</span>
                            </div>
                            <p className="control-note">
                                {diff > 0
                                    ? `You guessed ${formatCurrency(diff)} too low — most people underestimate compounding.`
                                    : `You guessed ${formatCurrency(Math.abs(diff))} too high — closer than most people get.`}{' '}
                                Of the final balance, {formatCurrency(result.contributions)} came from contributions and{' '}
                                {formatCurrency(result.growth)} from growth alone.
                            </p>
                        </div>
                    );
                }}
            </PredictReveal>
        </div>
    );
}