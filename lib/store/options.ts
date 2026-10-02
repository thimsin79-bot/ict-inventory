import { asc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { assets, users } from "@/lib/db/schema";

/** Asset choices for the assignment / transfer / maintenance pickers. */
export async function listAssetOptions(): Promise<
  { id: number; label: string; status: string }[]
> {
  const rows = await db
    .select({
      id: assets.id,
      code: assets.code,
      brand: assets.brand,
      model: assets.model,
      status: assets.status,
    })
    .from(assets)
    .orderBy(asc(assets.code));

  return rows.map((row) => ({
    id: row.id,
    label: `${row.code} · ${`${row.brand} ${row.model}`.trim()}`.trim(),
    status: row.status,
  }));
}

/** Active users, for the "assigned to" picker. */
export async function listUserOptions(): Promise<{ id: number; name: string }[]> {
  return db
    .select({ id: users.id, name: users.name })
    .from(users)
    .where(eq(users.status, "Active"))
    .orderBy(asc(users.name));
}
