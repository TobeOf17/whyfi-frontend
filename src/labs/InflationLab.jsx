import { formatCurrency } from '../services/formatters.js';
import PredictReveal from './PredictReveal.jsx';

const STARTING_AMOUNT = 100;
const INFLATION_RATE = 0.03;
const YEARS = 20;

export default function InflationLab({ onBack }) {
    function reveal() {
        const futureValue = STARTING_AMOUNT / Math.pow(1 + INFLATION_RATE, YEARS);
        return Promise.resolve({ futureValue });
    }

    return (
        <div>
            <button className="back-link" onClick={onBack}>
                &larr; Back to labs
            </button>
            <h2 className="highlight-section__title lab-title">Lab: Inflation</h2>
            <p className="control-note">
                Prices rise 3% a year, every year, for 20 years straight.
            </p>

            <PredictReveal
                question={`If prices rise 3% a year, what will today's $${STARTING_AMOUNT} be worth in ${YEARS} years, in today's purchasing power?`}
                unitLabel="dollars"
                onReveal={reveal}
            >
                {(result, guess) => {
                    const diff = result.futureValue - guess;
                    return (
                        <div className="reveal-result">
                            <div className="reveal-result__row">
                                <span>Your guess</span>
                                <span className="hero-figure">{formatCurrency(guess || 0)}</span>
                            </div>
                            <div className="reveal-result__row">
                                <span>Actual purchasing power</span>
                                <span className="hero-figure">{formatCurrency(result.futureValue)}</span>
                            </div>
                            <p className="control-note">
                                {diff > 0
                                    ? `You guessed ${formatCurrency(diff)} too low — inflation erodes purchasing power faster than most people expect.`
                                    : `You guessed ${formatCurrency(Math.abs(diff))} too high — inflation ate more of it than that.`}{' '}
                                At 3% a year, prices roughly double every 24 years, which means the same dollar amount buys
                                less and less even if you never spend it.
                            </p>
                        </div>
                    );
                }}
            </PredictReveal>
        </div>
    );
}