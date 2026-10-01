export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number, total: number): string {
  if (total === 0) {
    return "0%";
  }
  return `${Math.round((value / total) * 1000) / 10}%`;
}
