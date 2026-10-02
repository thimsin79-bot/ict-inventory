import { createHash, randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";

import { db, pool } from "@/lib/db";
import { sessions, users } from "@/lib/db/schema";

async function main() {
  const token = randomBytes(32).toString("hex");
  const secret = process.env.SESSION_SECRET ?? "";
  const id = createHash("sha256").update(`${secret}:${token}`).digest("hex");

  const [admin] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, "admin@example.com"))
    .limit(1);

  if (!admin) {
    throw new Error("admin@example.com not found");
  }

  await db.insert(sessions).values({
    id,
    userId: admin.id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  console.log(token);
  await pool.end();
}

main();
