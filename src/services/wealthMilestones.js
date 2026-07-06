export function findWealthMilestones(points, thresholds = [100000, 1000000]) {
    const hits = [];
    for (const threshold of thresholds) {
        for (let i = 1; i < points.length; i++) {
            if (points[i - 1].value < threshold && points[i].value >= threshold) {
                hits.push({ year: points[i].year, threshold });
                break;
            }
        }
    }
    return hits;
}

export function formatThreshold(threshold) {
    if (threshold >= 1000000) return `$${threshold / 1000000}M`;
    return `$${threshold / 1000}K`;
}