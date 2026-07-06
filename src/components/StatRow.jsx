import { formatCurrency } from '../services/formatters.js';

export default function StatRow({ result, dollarMode }) {
  if (!result) {
    return null;
  }

  const finalBalance = dollarMode === 'real' ? result.finalBalanceReal : result.finalBalanceNominal;
  const lastPoint = result.series[result.series.length - 1];

  return (
    <div className="stat-row">
      <div className="stat">
        <p className="stat__label">Final balance</p>
        <p className="stat__value stat__value--accent">{formatCurrency(finalBalance)}</p>
      </div>
      <div className="stat">
        <p className="stat__label">Total contributed</p>
        <p className="stat__value">{formatCurrency(lastPoint.cumulativeContributions)}</p>
      </div>
      <div className="stat">
        <p className="stat__label">Total growth</p>
        <p className="stat__value">{formatCurrency(lastPoint.cumulativeGrowth)}</p>
      </div>
    </div>
  );
}
