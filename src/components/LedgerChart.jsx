import { formatCurrency } from '../services/formatters.js';

const WIDTH = 900;
const HEIGHT = 340;
const PAD = { top: 24, right: 20, bottom: 32, left: 64 };
const PLOT_WIDTH = WIDTH - PAD.left - PAD.right;
const PLOT_HEIGHT = HEIGHT - PAD.top - PAD.bottom;

function xForYear(year, totalYears) {
    return PAD.left + (year / totalYears) * PLOT_WIDTH;
}

function yForValue(value, maxValue) {
    return PAD.top + PLOT_HEIGHT - (value / maxValue) * PLOT_HEIGHT;
}

function linePath(points, totalYears, maxValue) {
    return points
        .map((point, index) => {
            const x = xForYear(point.year, totalYears);
            const y = yForValue(point.value, maxValue);
            return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(' ');
}

function bandPath(bandPoints, totalYears, maxValue) {
    const top = bandPoints
        .map((p, i) => {
            const x = xForYear(p.year, totalYears);
            const y = yForValue(p.high, maxValue);
            return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(' ');
    const bottom = [...bandPoints]
        .reverse()
        .map((p) => {
            const x = xForYear(p.year, totalYears);
            const y = yForValue(p.low, maxValue);
            return `L ${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(' ');
    return `${top} ${bottom} Z`;
}

export default function LedgerChart({ lines, band, crossoverYear, crossoverLabel, totalYears }) {
    const allValues = [
        ...lines.flatMap((line) => line.points.map((p) => p.value)),
        ...(band ? band.points.flatMap((p) => [p.low, p.high]) : [])
    ];
    const maxValue = Math.max(...allValues, 1) * 1.08;

    const gridLevels = [0, 0.25, 0.5, 0.75, 1];
    const yearTickStep = Math.max(1, Math.round(totalYears / 6));
    const yearTicks = (lines[0]?.points ?? [])
        .map((p) => p.year)
        .filter((year) => year % yearTickStep === 0 || year === totalYears);

    return (
        <div>
            <div className="chart-legend">
                {lines.map((line) => (
                    <span className="chart-legend__item" key={line.id}>
            <span
                className={
                    line.dashed
                        ? 'chart-legend__swatch chart-legend__swatch--dashed-line'
                        : 'chart-legend__swatch chart-legend__swatch--solid'
                }
            />
                        {line.label}
          </span>
                ))}
                {band && (
                    <span className="chart-legend__item">
            <span className="chart-legend__swatch chart-legend__swatch--fill" />
            Range (low&ndash;high)
          </span>
                )}
                {crossoverYear !== null && crossoverYear !== undefined && (
                    <span className="chart-legend__item">
            <span className="chart-legend__swatch chart-legend__swatch--dashed" />
                        {crossoverLabel}
          </span>
                )}
            </div>

            <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" role="img" aria-label="Comparison chart of projected account values over time">
                {gridLevels.map((level) => {
                    const y = PAD.top + PLOT_HEIGHT - level * PLOT_HEIGHT;
                    return (
                        <g key={level}>
                            <line x1={PAD.left} x2={WIDTH - PAD.right} y1={y} y2={y} stroke="var(--color-border)" strokeWidth="1" />
                            <text x={PAD.left - 8} y={y + 3} textAnchor="end" fontSize="11" fill="var(--color-ink-faint)" fontFamily="var(--font-mono)">
                                {formatCurrency(maxValue * level)}
                            </text>
                        </g>
                    );
                })}

                {yearTicks.map((year) => (
                    <text
                        key={year}
                        x={xForYear(year, totalYears)}
                        y={HEIGHT - 10}
                        textAnchor="middle"
                        fontSize="11"
                        fill="var(--color-ink-faint)"
                        fontFamily="var(--font-mono)"
                    >
                        {year}
                    </text>
                ))}

                {band && (
                    <path d={bandPath(band.points, totalYears, maxValue)} fill="var(--color-accent-light)" opacity="0.22" />
                )}

                {lines.map((line) => (
                    <path
                        key={line.id}
                        d={linePath(line.points, totalYears, maxValue)}
                        fill="none"
                        stroke={line.colorVar}
                        strokeWidth="2.5"
                        strokeDasharray={line.dashed ? '6,4' : undefined}
                    />
                ))}

                {crossoverYear !== null && crossoverYear !== undefined && crossoverYear <= totalYears && (
                    <line
                        x1={xForYear(crossoverYear, totalYears)}
                        x2={xForYear(crossoverYear, totalYears)}
                        y1={PAD.top}
                        y2={PAD.top + PLOT_HEIGHT}
                        stroke="var(--color-accent-strong)"
                        strokeWidth="1.5"
                        strokeDasharray="3,3"
                    />
                )}
            </svg>
        </div>
    );
}