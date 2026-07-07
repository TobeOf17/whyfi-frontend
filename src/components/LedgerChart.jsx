import { useRef, useState } from 'react';
import { formatCurrency } from '../services/formatters.js';

const WIDTH = 900;
const HEIGHT = 420;
const PAD = { top: 70, right: 20, bottom: 32, left: 64 };
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

function MilestonePill({ marker, x, y }) {
    const width = marker.label.length * 6.4 + 20;
    return (
        <g>
            <rect x={x - width / 2} y={y - 14} width={width} height={20} rx={10} fill="var(--color-accent-strong)" />
            <text x={x} y={y} textAnchor="middle" fontSize="10.5" fontFamily="var(--font-mono)" fill="#ffffff">
                {marker.label}
            </text>
        </g>
    );
}

/**
 * Markers get a fixed row by type, not by their position in the array —
 * otherwise two "$100K" pills for two different lines could land on
 * different rows just because of insertion order, which reads as random
 * rather than consistent.
 */
function levelForMarker(label) {
    if (label === 'Crossover') return 0;
    if (label.includes('M')) return 2;
    return 1;
}

const MARKER_ROW_HEIGHT = 18;
const MARKER_TOP_Y = 18;

export default function LedgerChart({ lines, band, markers = [], totalYears, currentAge }) {
    const wrapRef = useRef(null);
    const [hoverYear, setHoverYear] = useState(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

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

    function handleMouseMove(e) {
        const svg = e.currentTarget;
        const rect = svg.getBoundingClientRect();
        const scaleX = WIDTH / rect.width;
        const localX = (e.clientX - rect.left) * scaleX;
        const rawYear = ((localX - PAD.left) / PLOT_WIDTH) * totalYears;
        const year = Math.round(Math.min(Math.max(rawYear, 0), totalYears));
        setHoverYear(year);

        const wrapRect = wrapRef.current.getBoundingClientRect();
        setTooltipPos({ x: e.clientX - wrapRect.left, y: e.clientY - wrapRect.top });
    }

    function handleMouseLeave() {
        setHoverYear(null);
    }

    const hoverPoints = hoverYear === null ? [] : lines.map((line) => line.points[hoverYear]).filter(Boolean);

    return (
        <div className="chart-svg-wrap fade-in" ref={wrapRef}>
            <div className="chart-legend">
                {lines.map((line) => (
                    <span className="chart-legend__item" key={line.id}>
            <span
                className={
                    line.dashed
                        ? 'chart-legend__swatch chart-legend__swatch--dashed-line'
                        : 'chart-legend__swatch'
                }
                style={{ background: line.dashed ? undefined : line.colorVar }}
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

            <svg
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                width="100%"
                role="img"
                aria-label="Comparison chart of projected account values over time, with milestone markers. Hover to see exact values."
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
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
                    const y = MARKER_TOP_Y + levelForMarker(marker.label) * MARKER_ROW_HEIGHT;
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
                            <MilestonePill marker={marker} x={x} y={y} />
                        </g>
                    );
                })}

                {hoverYear !== null && (
                    <g>
                        <line
                            x1={xForYear(hoverYear, totalYears)}
                            x2={xForYear(hoverYear, totalYears)}
                            y1={PAD.top}
                            y2={PAD.top + PLOT_HEIGHT}
                            stroke="var(--color-ink-faint)"
                            strokeWidth="1"
                        />
                        {hoverPoints.map((point, i) => (
                            <circle
                                key={i}
                                cx={xForYear(point.year, totalYears)}
                                cy={yForValue(point.value, maxValue)}
                                r="4"
                                fill={lines[i].colorVar}
                                stroke="#ffffff"
                                strokeWidth="1.5"
                            />
                        ))}
                    </g>
                )}
            </svg>

            {hoverYear !== null && hoverPoints.length > 0 && (
                <div className="chart-tooltip" style={{ left: `${tooltipPos.x + 14}px`, top: `${tooltipPos.y - 10}px` }}>
                    <div className="chart-tooltip__year">
                        {currentAge != null ? `Age ${currentAge + hoverYear}` : `Year ${hoverYear}`}
                    </div>
                    {lines.map((line, i) => (
                        <div key={line.id}>
                            {line.label}: {hoverPoints[i] ? formatCurrency(hoverPoints[i].value) : 'n/a'}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}