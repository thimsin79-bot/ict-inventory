export const EM_DASH = "—";

export function formatCurrency(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

export function formatOptionalCurrency(
  value: number | undefined,
  currency = "USD",
): string {
  return value === undefined ? EM_DASH : formatCurrency(value, currency);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Renders a yyyy-mm-dd string in the pattern configured in Settings. */
export function formatDate(value: string, pattern = "dd-mmm-yyyy"): string {
  if (value === "") {
    return EM_DASH;
  }

  const parts = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);

  if (!parts) {
    return value;
  }

  const [, year, month, day] = parts;
  const monthName = MONTHS[Number(month) - 1] ?? month;

  if (pattern === "yyyy-mm-dd") {
    return value.slice(0, 10);
  }

  if (pattern === "dd/mm/yyyy") {
    return `${day}/${month}/${year}`;
  }

  if (pattern === "mm-dd-yyyy") {
    return `${month}-${day}-${year}`;
  }

  return `${day}-${monthName}-${year}`;
}

export function formatOptionalDate(
  value: string | undefined,
  pattern = "dd-mmm-yyyy",
): string {
  return value === undefined || value === "" ? EM_DASH : formatDate(value, pattern);
}

export function formatPercent(value: number, total: number): string {
  if (total === 0) {
    return "0%";
  }
  return `${Math.round((value / total) * 1000) / 10}%`;
}
