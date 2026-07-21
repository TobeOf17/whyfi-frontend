import { useEffect, useRef, useState } from 'react';
import { formatCurrency } from '../services/formatters.js';

const WIDTH = 900;
const HEIGHT = 420;
const MARKER_ROW_HEIGHT_BASE = 18;
const MARKER_TOP_Y_BASE = 18;

// Clamp how far the text/stroke compensation factor can swing, so a
// transient 0-width measurement during layout (or an absurdly wide
// monitor) can't produce nonsensical sizing.
const MIN_SCALE = 0.55;
const MAX_SCALE = 3.5;

function xForYear(year, totalYears, plotWidth, padLeft) {
    return padLeft + (year / totalYears) * plotWidth;
}

function yForValue(value, maxValue, plotHeight, padTop) {
    return padTop + plotHeight - (value / maxValue) * plotHeight;
}

function MilestonePill({ marker, x, y, su }) {
    const width = marker.label.length * su(6.4) + su(20);
    const height = su(20);
    const color = marker.colorVar || 'var(--color-accent-strong)';
    return (
        <g>
            <rect x={x - width / 2} y={y - height * 0.7} width={width} height={height} rx={height / 2} fill={color} />
            <text x={x} y={y} textAnchor="middle" fontSize={su(10.5)} fontFamily="var(--font-mono)" fill="#ffffff">
                {marker.label}
            </text>
        </g>
    );
}

function levelForMarker(label) {
    if (label === 'Crossover') return 0;
    if (label.includes('M')) return 2;
    return 1;
}

export default function LedgerChart({ lines, band, markers = [], totalYears, currentAge }) {
    const wrapRef = useRef(null);
    const [renderedWidth, setRenderedWidth] = useState(WIDTH);
    const [hoverYear, setHoverYear] = useState(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    // Text and stroke weight inside the SVG are defined in the chart's fixed
    // internal coordinate system (900 units wide). Without compensation, that
    // system gets uniformly squeezed on a narrow phone screen exactly the way
    // the plotted lines do, and an 11-unit axis label that reads fine at
    // ~860px physical width renders at roughly 4px on a 320px phone,
    // unreadable. `su()` (scaled-unit) computes how many internal units are
    // needed for a given target to stay a constant physical pixel size
    // regardless of how wide the container actually is. Geometry (line
    // paths, gridline positions) is untouched by this — only decorative
    // sizing (font size, stroke width, pill dimensions) runs through it.
    useEffect(() => {
        if (!wrapRef.current) return undefined;
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.contentRect.width > 0) setRenderedWidth(entry.contentRect.width);
            }
        });
        observer.observe(wrapRef.current);
        return () => observer.disconnect();
    }, []);

    const rawScale = WIDTH / Math.max(renderedWidth, 1);
    const scale = Math.min(Math.max(rawScale, MIN_SCALE), MAX_SCALE);
    const su = (px) => px * scale;

    const PAD = { top: su(70), right: su(20), bottom: su(32), left: su(64) };
    const PLOT_WIDTH = WIDTH - PAD.left - PAD.right;
    const PLOT_HEIGHT = HEIGHT - PAD.top - PAD.bottom;
    const MARKER_ROW_HEIGHT = su(MARKER_ROW_HEIGHT_BASE);
    const MARKER_TOP_Y = su(MARKER_TOP_Y_BASE);

    const allValues = [
        ...lines.flatMap((line) => line.points.map((p) => p.value)),
        ...(band ? band.points.flatMap((p) => [p.low, p.high]) : [])
    ];
    const maxValue = Math.max(...allValues, 1) * 1.08;

    const gridLevels = [0, 0.25, 0.5, 0.75, 1];
    // Fewer x-axis labels on a narrow phone screen so they don't collide.
    const isNarrow = renderedWidth < 420;
    const yearTickStep = Math.max(1, Math.round(totalYears / (isNarrow ? 4 : 6)));
    const yearTicks = (lines[0]?.points ?? [])
        .map((p) => p.year)
        .filter((year) => year % yearTickStep === 0 || year === totalYears);

    const visibleMarkers = markers.filter((m) => m.year >= 0 && m.year <= totalYears);

    function updateHoverFromClientPoint(clientX, clientY, svgEl) {
        const rect = svgEl.getBoundingClientRect();
        const scaleX = WIDTH / rect.width;
        const localX = (clientX - rect.left) * scaleX;
        const rawYear = ((localX - PAD.left) / PLOT_WIDTH) * totalYears;
        const year = Math.round(Math.min(Math.max(rawYear, 0), totalYears));
        setHoverYear(year);

        const wrapRect = wrapRef.current.getBoundingClientRect();
        setTooltipPos({ x: clientX - wrapRect.left, y: clientY - wrapRect.top });
    }

    function handleMouseMove(e) {
        updateHoverFromClientPoint(e.clientX, e.clientY, e.currentTarget);
    }

    function handleMouseLeave() {
        setHoverYear(null);
    }

    function handleTouchMove(e) {
        if (e.touches.length === 0) return;
        const touch = e.touches[0];
        updateHoverFromClientPoint(touch.clientX, touch.clientY, e.currentTarget);
    }

    function handleTouchEnd() {
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
                aria-label="Comparison chart of projected account values over time, with milestone markers. Touch or hover to see exact values."
                className="chart-svg"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
            >
                {gridLevels.map((level) => {
                    const y = PAD.top + PLOT_HEIGHT - level * PLOT_HEIGHT;
                    return (
                        <g key={level}>
                            <line x1={PAD.left} x2={WIDTH - PAD.right} y1={y} y2={y} stroke="var(--color-border)" strokeWidth={su(1)} />
                            <text x={PAD.left - su(8)} y={y + su(3)} textAnchor="end" fontSize={su(11)} fill="var(--color-ink-faint)" fontFamily="var(--font-mono)">
                                {formatCurrency(maxValue * level)}
                            </text>
                        </g>
                    );
                })}

                {yearTicks.map((year) => (
                    <text
                        key={year}
                        x={xForYear(year, totalYears, PLOT_WIDTH, PAD.left)}
                        y={HEIGHT - su(10)}
                        textAnchor="middle"
                        fontSize={su(11)}
                        fill="var(--color-ink-faint)"
                        fontFamily="var(--font-mono)"
                    >
                        {currentAge != null ? currentAge + year : year}
                    </text>
                ))}

                {band && (
                    <path
                        d={(() => {
                            const top = band.points
                                .map((p, i) => {
                                    const x = xForYear(p.year, totalYears, PLOT_WIDTH, PAD.left);
                                    const y = yForValue(p.high, maxValue, PLOT_HEIGHT, PAD.top);
                                    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`;
                                })
                                .join(' ');
                            const bottom = [...band.points]
                                .reverse()
                                .map((p) => {
                                    const x = xForYear(p.year, totalYears, PLOT_WIDTH, PAD.left);
                                    const y = yForValue(p.low, maxValue, PLOT_HEIGHT, PAD.top);
                                    return `L ${x.toFixed(1)},${y.toFixed(1)}`;
                                })
                                .join(' ');
                            return `${top} ${bottom} Z`;
                        })()}
                        fill="var(--color-accent-light)"
                        opacity="0.22"
                    />
                )}

                {lines.map((line) => (
                    <path
                        key={line.id}
                        d={line.points
                            .map((point, index) => {
                                const x = xForYear(point.year, totalYears, PLOT_WIDTH, PAD.left);
                                const y = yForValue(point.value, maxValue, PLOT_HEIGHT, PAD.top);
                                return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`;
                            })
                            .join(' ')}
                        fill="none"
                        stroke={line.colorVar}
                        strokeWidth={su(2.5)}
                        strokeDasharray={line.dashed ? `${su(6)},${su(4)}` : undefined}
                    />
                ))}

                {visibleMarkers.map((marker, index) => {
                    const x = xForYear(marker.year, totalYears, PLOT_WIDTH, PAD.left);
                    const y = MARKER_TOP_Y + levelForMarker(marker.label) * MARKER_ROW_HEIGHT;
                    const tickColor = marker.colorVar || 'var(--color-accent-strong)';
                    const displayLabel = currentAge != null ? `${marker.label} \u00b7 Age ${currentAge + marker.year}` : marker.label;
                    return (
                        <g key={`${marker.label}-${index}`}>
                            <line
                                x1={x}
                                x2={x}
                                y1={PAD.top}
                                y2={PAD.top + PLOT_HEIGHT}
                                stroke={tickColor}
                                strokeWidth={su(1.5)}
                                strokeDasharray={`${su(3)},${su(3)}`}
                            />
                            <MilestonePill marker={{ ...marker, label: displayLabel }} x={x} y={y} su={su} />
                        </g>
                    );
                })}

                {hoverYear !== null && (
                    <g>
                        <line
                            x1={xForYear(hoverYear, totalYears, PLOT_WIDTH, PAD.left)}
                            x2={xForYear(hoverYear, totalYears, PLOT_WIDTH, PAD.left)}
                            y1={PAD.top}
                            y2={PAD.top + PLOT_HEIGHT}
                            stroke="var(--color-ink-faint)"
                            strokeWidth={su(1)}
                        />
                        {hoverPoints.map((point, i) => (
                            <circle
                                key={i}
                                cx={xForYear(point.year, totalYears, PLOT_WIDTH, PAD.left)}
                                cy={yForValue(point.value, maxValue, PLOT_HEIGHT, PAD.top)}
                                r={su(4)}
                                fill={lines[i].colorVar}
                                stroke="#ffffff"
                                strokeWidth={su(1.5)}
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