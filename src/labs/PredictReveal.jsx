import { useState } from 'react';

export default function PredictReveal({ question, unitLabel, onReveal, children }) {
    const [guess, setGuess] = useState('');
    const [revealed, setRevealed] = useState(false);
    const [result, setResult] = useState(null);
    const [isLoadingReveal, setIsLoadingReveal] = useState(false);

    function runReveal() {
        setIsLoadingReveal(true);
        Promise.resolve(onReveal())
            .then((value) => {
                setResult(value);
                setRevealed(true);
            })
            .finally(() => setIsLoadingReveal(false));
    }

    return (
        <div className="card">
            <p className="section-label">Challenge your intuition</p>
            <p className="lab-question">{question}</p>

            {!revealed ? (
                <div className="predict-row">
                    <input
                        className="control-textbox control-textbox--wide"
                        type="number"
                        placeholder="Your guess"
                        value={guess}
                        onChange={(e) => setGuess(e.target.value)}
                    />
                    <span className="control-label">{unitLabel}</span>
                    <button className="button button--inline" onClick={runReveal} disabled={isLoadingReveal}>
                        {isLoadingReveal ? 'Calculating…' : 'Reveal'}
                    </button>
                </div>
            ) : (
                children(result, Number(guess))
            )}
        </div>
    );
}