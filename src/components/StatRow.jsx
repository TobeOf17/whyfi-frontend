import { formatCurrency } from '../services/formatters.js';

export default function StatRow({ lines }) {
    if (!lines.length) return null;

    return (
        <div className="stat-row fade-in">
            {lines.map((line, index) => {
                const finalPoint = line.points[line.points.length - 1];
                const other = lines[index === 0 ? 1 : 0];
                const otherFinal = other ? other.points[other.points.length - 1].value : null;
                const delta = otherFinal !== null ? finalPoint.value - otherFinal : null;
                const percent = otherFinal ? (delta / Math.abs(otherFinal)) * 100 : null;

                return (
                    <div className="stat" key={line.id} style={{ borderLeftColor: line.colorVar }}>
                        <p className="stat__label">{line.label}</p>
                        <p className="stat__value">{formatCurrency(finalPoint.value)}</p>
                        {line.showDelta !== false && delta !== null && Math.abs(delta) > 0.5 && (
                            <p className={`stat__delta ${delta >= 0 ? 'stat__delta--positive' : 'stat__delta--negative'}`}>
                                {delta >= 0 ? '+' : '-'}
                                {formatCurrency(Math.abs(delta))} ({delta >= 0 ? '+' : '-'}
                                {Math.abs(percent).toFixed(0)}%) vs. {other.label}
                            </p>
                        )}
                    </div>
                );
            })}
        </div>
    );
}