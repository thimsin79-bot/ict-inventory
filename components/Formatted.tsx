import { formatCurrency, formatDate } from "@/lib/format";
import { getCurrency, getDateFormat } from "@/lib/format-server";

/**
 * Async server components let deeply nested rows use the configured currency
 * and date pattern without threading settings through every prop.
 */
export async function Money({ value }: { value: number }) {
  return <>{formatCurrency(value, await getCurrency())}</>;
}

export async function Day({ value }: { value: string }) {
  return <>{formatDate(value, await getDateFormat())}</>;
}
