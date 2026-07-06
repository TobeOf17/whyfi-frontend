export default function LiveInsights({ insights }) {
    if (!insights || !insights.length) return null;

    return (
        <div className="highlight-section">
            <p className="section-label">Live insights</p>
            <ul className="highlight-list">
                {insights.map((text, index) => (
                    <li key={index}>{text}</li>
                ))}
            </ul>
        </div>
    );
}