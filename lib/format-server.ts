import { cache } from "react";

import { formatCurrency, formatDate, formatOptionalCurrency, formatOptionalDate } from "@/lib/format";
import { getSettings } from "@/lib/store/settings";

/**
 * Settings-aware wrappers around the pure formatters. `cache` collapses the
 * repeat lookups within a single render pass into one query.
 */
export const getCurrency = cache(async (): Promise<string> => (await getSettings()).currency);

export const getDateFormat = cache(
  async (): Promise<string> => (await getSettings()).dateFormat,
);

export const money = cache(async (value: number): Promise<string> =>
  formatCurrency(value, await getCurrency()),
);

export const optionalMoney = cache(async (value: number | undefined): Promise<string> =>
  formatOptionalCurrency(value, await getCurrency()),
);

export const day = cache(async (value: string): Promise<string> =>
  formatDate(value, await getDateFormat()),
);

export const optionalDay = cache(async (value: string | undefined): Promise<string> =>
  formatOptionalDate(value, await getDateFormat()),
);
