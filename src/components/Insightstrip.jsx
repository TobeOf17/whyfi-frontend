export default function Insightstrip({ insights }) {
    if (!insights || !insights.length) return null;

    return (
        <div className="insight-strip fade-in">
            <span className="insight-strip__label">Key outcome</span>
            <span className="insight-strip__text">{insights[0]}</span>
        </div>
    );
}