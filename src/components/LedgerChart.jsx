import { formatCurrency } from '../services/formatters.js';

const WIDTH = 640;
const HEIGHT = 260;
const PAD = { top: 20, right: 16, bottom: 28, left: 54 };
const PLOT_WIDTH = WIDTH - PAD.left - PAD.right;
const PLOT_HEIGHT = HEIGHT - PAD.top - PAD.bottom;

function xForYear(year, totalYears) {
  return PAD.left + (year / totalYears) * PLOT_WIDTH;
}

function yForValue(value, maxValue) {
  return PAD.top + PLOT_HEIGHT - (value / maxValue) * PLOT_HEIGHT;
}

function linePath(series, totalYears, maxValue, accessor) {
  return series
    .map((point, index) => {
      const x = xForYear(point.year, totalYears);
      const y = yForValue(accessor(point), maxValue);
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

function stackedAreaPath(series, totalYears, maxValue, topAccessor, bottomAccessor) {
  const topPoints = series.map((point) => ({
    x: xForYear(point.year, totalYears),
    y: yForValue(topAccessor(point), maxValue)
  }));
  const bottomPoints = series
    .map((point) => ({
      x: xForYear(point.year, totalYears),
      y: yForValue(bottomAccessor(point), maxValue)
    }))
    .reverse();

  const top = topPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const bottom = bottomPoints.map((p) => `L ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  return `${top} ${bottom} Z`;
}

export default function LedgerChart({ result, viewMode, dollarMode }) {
  const { series, milestones } = result;
  const totalYears = series[series.length - 1].year;

  const balanceAccessor = (point) =>
    dollarMode === 'real' ? point.balanceReal : point.balanceNominal;

  const maxValue =
    viewMode === 'why'
      ? Math.max(...series.map((p) => p.cumulativeContributions + p.cumulativeGrowth)) * 1.08
      : Math.max(...series.map(balanceAccessor)) * 1.08;

  const gridLevels = [0, 0.25, 0.5, 0.75, 1];
  const yearTickStep = Math.max(1, Math.round(totalYears / 6));
  const yearTicks = series
    .map((p) => p.year)
    .filter((year) => year % yearTickStep === 0 || year === totalYears);

  return (
    <div>
      <div className="chart-legend">
        {viewMode === 'what' ? (
          <span className="chart-legend__item">
            <span className="chart-legend__swatch chart-legend__swatch--solid" />
            Balance ({dollarMode})
          </span>
        ) : (
          <>
            <span className="chart-legend__item">
              <span className="chart-legend__swatch chart-legend__swatch--muted" />
              Your contributions
            </span>
            <span className="chart-legend__item">
              <span className="chart-legend__swatch chart-legend__swatch--fill" />
              Growth
            </span>
          </>
        )}
        {milestones.length > 0 && (
          <span className="chart-legend__item">
            <span className="chart-legend__swatch chart-legend__swatch--dashed" />
            Milestone
          </span>
        )}
      </div>

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" role="img" aria-label="Balance projection chart">
        {gridLevels.map((level) => {
          const y = PAD.top + PLOT_HEIGHT - level * PLOT_HEIGHT;
          return (
            <g key={level}>
              <line
                x1={PAD.left}
                x2={WIDTH - PAD.right}
                y1={y}
                y2={y}
                stroke="var(--color-border)"
                strokeWidth="1"
              />
              <text x={PAD.left - 8} y={y + 3} textAnchor="end" fontSize="10" fill="var(--color-ink-faint)" fontFamily="var(--font-mono)">
                {formatCurrency(maxValue * level)}
              </text>
            </g>
          );
        })}

        {yearTicks.map((year) => (
          <text
            key={year}
            x={xForYear(year, totalYears)}
            y={HEIGHT - 8}
            textAnchor="middle"
            fontSize="10"
            fill="var(--color-ink-faint)"
            fontFamily="var(--font-mono)"
          >
            {year}
          </text>
        ))}

        {viewMode === 'why' ? (
          <>
            <path
              d={stackedAreaPath(series, totalYears, maxValue, (p) => p.cumulativeContributions, () => 0)}
              fill="var(--color-ink-faint)"
              opacity="0.25"
            />
            <path
              d={stackedAreaPath(
                series,
                totalYears,
                maxValue,
                (p) => p.cumulativeContributions + p.cumulativeGrowth,
                (p) => p.cumulativeContributions
              )}
              fill="var(--color-accent-light)"
              opacity="0.35"
            />
          </>
        ) : (
          <path
            d={linePath(series, totalYears, maxValue, balanceAccessor)}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="2"
          />
        )}

        {milestones.map((milestone, index) => {
          if (milestone.year > totalYears) return null;
          const x = xForYear(milestone.year, totalYears);
          return (
            <line
              key={index}
              x1={x}
              x2={x}
              y1={PAD.top}
              y2={PAD.top + PLOT_HEIGHT}
              stroke="var(--color-accent-light)"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
          );
        })}
      </svg>
    </div>
  );
}
