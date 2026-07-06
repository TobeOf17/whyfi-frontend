export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
}

export function formatYearLabel(year) {
  return year === 0 ? 'Now' : `Yr ${year}`;
}
