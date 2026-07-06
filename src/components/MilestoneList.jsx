import { formatYearLabel } from '../services/formatters.js';

export default function MilestoneList({ milestones }) {
  if (!milestones || !milestones.length) {
    return <p className="empty-note">No milestones for this range yet.</p>;
  }

  const sorted = [...milestones].sort((a, b) => a.year - b.year);

  return (
      <ul className="milestone-list">
        {sorted.map((milestone, index) => (
            <li className="milestone-item" key={`${milestone.type}-${index}`}>
              <span className="milestone-item__year">{formatYearLabel(milestone.year)}</span>
              <span className="milestone-item__label">{milestone.label}</span>
            </li>
        ))}
      </ul>
  );
}