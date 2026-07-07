import { formatCurrency } from '../services/formatters.js';

export default function FeeImpact({ impact }) {
    if (!impact || !impact.length) return null;

    return (
        <div className="plain-section">
            <p className="section-label">Lost to fees</p>
            <div className="fee-impact-row">
                {impact.map((item) => (
                    <div className="fee-impact-item" key={item.label} style={{ borderLeftColor: item.colorVar }}>
                        <span className="fee-impact-item__label">{item.label}</span>
                        <span className="fee-impact-item__value">{formatCurrency(item.lost)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}