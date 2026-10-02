import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import type { FormState, SettingsRecord } from "@/lib/types";

const SETTINGS_ID = 1;

const DEFAULTS: SettingsRecord = {
  organizationName: "ICT Inventory Management",
  assetCodePrefix: "ICT-",
  currency: "USD",
  dateFormat: "dd-mmm-yyyy",
};

export const CURRENCY_OPTIONS = ["USD", "KHR", "EUR", "GBP"] as const;

export const DATE_FORMAT_OPTIONS = [
  { value: "dd-mmm-yyyy", label: "01-Oct-2026" },
  { value: "yyyy-mm-dd", label: "2026-10-01" },
  { value: "dd/mm/yyyy", label: "01/10/2026" },
  { value: "mm-dd-yyyy", label: "10-01-2026" },
] as const;

/**
 * Settings live in a single row. The row is created on first read so a fresh
 * database still renders sensible defaults.
 */
export async function getSettings(): Promise<SettingsRecord> {
  const [row] = await db.select().from(settings).where(eq(settings.id, SETTINGS_ID)).limit(1);

  if (!row) {
    await db
      .insert(settings)
      .values({ id: SETTINGS_ID, ...DEFAULTS })
      .onConflictDoNothing();

    return DEFAULTS;
  }

  return {
    organizationName: row.organizationName,
    assetCodePrefix: row.assetCodePrefix,
    currency: row.currency,
    dateFormat: row.dateFormat,
  };
}

export async function updateSettings(input: SettingsRecord): Promise<FormState> {
  const fieldErrors: Record<string, string> = {};
  const prefix = input.assetCodePrefix.trim();

  if (input.organizationName.trim() === "") {
    fieldErrors.organizationName = "Organization name is required.";
  }

  if (prefix === "") {
    fieldErrors.assetCodePrefix = "Asset code prefix is required.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "Please correct the highlighted fields.", fieldErrors };
  }

  await db
    .insert(settings)
    .values({
      id: SETTINGS_ID,
      organizationName: input.organizationName.trim(),
      assetCodePrefix: prefix,
      currency: input.currency,
      dateFormat: input.dateFormat,
    })
    .onConflictDoUpdate({
      target: settings.id,
      set: {
        organizationName: input.organizationName.trim(),
        assetCodePrefix: prefix,
        currency: input.currency,
        dateFormat: input.dateFormat,
      },
    });

  return { status: "success", message: "Settings saved.", fieldErrors: {} };
}
