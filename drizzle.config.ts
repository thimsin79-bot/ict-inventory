import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Read lazily so the config loads even when .env.local is absent; drizzle-kit
    // is only ever run on a machine that has the real credentials.
    url:
      process.env.DATABASE_URL ??
      "postgresql://postgres:postgres@localhost:5432/ict_inventory",
  },
  strict: true,
  verbose: true,
});
