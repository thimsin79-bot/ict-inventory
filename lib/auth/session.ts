import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, lte, sql } from "drizzle-orm";
import { cookies } from "next/headers";

import { db } from "@/lib/db";
import { departments, sessions, users } from "@/lib/db/schema";
import type { UserRow } from "@/lib/db/schema";

export const SESSION_COOKIE = "ict_session";
const SESSION_TTL_DAYS = 7;

/** The user shape the UI needs - never includes the password hash. */
export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: "Administrator" | "ICT Staff" | "Viewer";
  department: string;
  initials: string;
}

function secret(): string {
  const value = process.env.SESSION_SECRET;

  if (!value || value.trim().length < 16) {
    throw new Error(
      "SESSION_SECRET is missing or too short. Copy .env.example to .env and set a " +
        "long random value (see the comment there for how to generate one).",    );
  }

  return value;
}

/**
 * Sessions are stored as a random token in the cookie, but only a SHA-256 hash
 * of that token is persisted. A leaked database therefore cannot be replayed
 * as a login.
 */
function hashToken(token: string): string {
  return createHash("sha256").update(`${secret()}:${token}`).digest("hex");
}

export function initialsFor(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return "?";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

export async function createSession(userId: number): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

  await db.insert(sessions).values({ id: hashToken(token), userId, expiresAt });

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;

  if (token) {
    await db.delete(sessions).where(eq(sessions.id, hashToken(token)));
  }

  store.delete(SESSION_COOKIE);
}

/** Resolves the signed-in user, or null when there is no valid session. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const [row] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      status: users.status,
      departmentName: departments.name,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .leftJoin(departments, eq(departments.id, users.departmentId))
    .where(and(eq(sessions.id, hashToken(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);

  if (!row || row.status !== "Active") {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    department: row.departmentName ?? "",
    initials: initialsFor(row.name),
  };
}

/** True when the signed-in user may perform destructive or administrative actions. */
export async function isAdministrator(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === "Administrator";
}

export async function findUserByEmail(email: string): Promise<UserRow | undefined> {
  const [row] = await db
    .select()
    .from(users)
    .where(sql`lower(${users.email}) = ${email.trim().toLowerCase()}`)
    .limit(1);
  return row;
}

/** Removes expired sessions. Called opportunistically on login. */
export async function pruneExpiredSessions(): Promise<void> {
  await db.delete(sessions).where(lte(sessions.expiresAt, new Date()));
}
