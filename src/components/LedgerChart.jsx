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

/**
 * markers: [{ year, label }] — drawn as dashed vertical ticks with a label
 * near the top. Used for crossover points and wealth thresholds ($100K, $1M).
 * currentAge: if provided, x-axis ticks show age instead of a bare year count.
 */
export default function LedgerChart({ lines, band, markers = [], totalYears, currentAge }) {
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

    const visibleMarkers = markers.filter((m) => m.year >= 0 && m.year <= totalYears);

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
            </div>

            <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" role="img" aria-label="Comparison chart of projected account values over time, with milestone markers">
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
                        {currentAge != null ? currentAge + year : year}
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

                {visibleMarkers.map((marker, index) => {
                    const x = xForYear(marker.year, totalYears);
                    return (
                        <g key={`${marker.label}-${index}`}>
                            <line
                                x1={x}
                                x2={x}
                                y1={PAD.top}
                                y2={PAD.top + PLOT_HEIGHT}
                                stroke="var(--color-accent-strong)"
                                strokeWidth="1.5"
                                strokeDasharray="3,3"
                            />
                            <text
                                x={x}
                                y={PAD.top + 12 + (index % 2) * 14}
                                textAnchor="middle"
                                fontSize="10.5"
                                fill="var(--color-accent-strong)"
                                fontFamily="var(--font-mono)"
                            >
                                {marker.label}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}