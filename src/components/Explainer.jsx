import { formatCurrency } from '../services/formatters.js';

export default function Explainer({ result, input, dollarMode }) {
  if (!result) return null;

  const finalBalance = dollarMode === 'real' ? result.finalBalanceReal : result.finalBalanceNominal;
  const lastPoint = result.series[result.series.length - 1];
  const growthShare = lastPoint.cumulativeGrowth / (finalBalance || 1);

  return (
    <p className="explainer">
      Over <strong>{input.years} years</strong>, this plan grows to{' '}
      <strong>{formatCurrency(finalBalance)}</strong>
      {dollarMode === 'real' ? ' in today\'s purchasing power' : ''}. About{' '}
      <strong>{Math.round(growthShare * 100)}%</strong> of that final balance came from growth,
      not from money put in directly — the rest was contributed along the way.
    </p>
  );
}
