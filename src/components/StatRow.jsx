import { formatCurrency } from '../services/formatters.js';

export default function StatRow({ lines }) {
    if (!lines.length) return null;

    return (
        <div className="stat-row">
            {lines.map((line) => {
                const finalPoint = line.points[line.points.length - 1];
                return (
                    <div className="stat" key={line.id}>
                        <p className="stat__label">{line.label}</p>
                        <p className="stat__value">{formatCurrency(finalPoint.value)}</p>
                    </div>
                );
            })}
        </div>
    );
}