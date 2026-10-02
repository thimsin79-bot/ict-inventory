import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "@/lib/db/schema";

const MISSING_URL_MESSAGE =
  "DATABASE_URL is not set. Copy .env.example to .env and fill in your " +
  "PostgreSQL connection string, then restart the dev server.";

function connectionString(): string {
  const value = process.env.DATABASE_URL;

  if (!value || value.trim() === "") {
    throw new Error(MISSING_URL_MESSAGE);
  }

  return value;
}

// Reuse one Pool across hot reloads in development, otherwise every reload would
// open a fresh set of connections and exhaust PostgreSQL's connection limit.
const globalForDb = globalThis as unknown as { ictPool?: Pool };

export const pool: Pool =
  globalForDb.ictPool ??
  new Pool({
    connectionString: connectionString(),
    max: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.ictPool = pool;
}

export const db = drizzle(pool, { schema });

export type Database = typeof db;
