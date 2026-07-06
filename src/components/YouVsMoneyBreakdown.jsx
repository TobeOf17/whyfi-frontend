import { formatCurrency } from '../services/formatters.js';

export default function YouVsMoneyBreakdown({ breakdown, lineLabel }) {
    if (!breakdown) return null;

    const total = breakdown.contributions + breakdown.growth;
    if (total <= 0) return null;

    const contribPct = (breakdown.contributions / total) * 100;
    const growthPct = 100 - contribPct;

    return (
        <div className="highlight-section">
            <p className="section-label">You vs. your money — {lineLabel}</p>
            <h3 className="highlight-section__title">
                {Math.round(growthPct)}% of this balance is growth, not money you put in
            </h3>
            <div className="split-bar">
                <div className="split-bar__segment--contrib" style={{ width: `${contribPct}%` }} />
                <div className="split-bar__segment--growth" style={{ width: `${growthPct}%` }} />
            </div>
            <div className="split-legend">
        <span className="split-legend__item">
          <span className="split-legend__swatch split-legend__swatch--contrib" />
          You contributed {formatCurrency(breakdown.contributions)}
        </span>
                <span className="split-legend__item">
          <span className="split-legend__swatch split-legend__swatch--growth" />
          Growth added {formatCurrency(breakdown.growth)}
        </span>
            </div>
        </div>
    );
}