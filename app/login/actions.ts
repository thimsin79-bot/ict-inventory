"use server";

import { redirect } from "next/navigation";

import { verifyPassword } from "@/lib/auth/password";
import {
  createSession,
  destroySession,
  findUserByEmail,
  pruneExpiredSessions,
} from "@/lib/auth/session";
import type { FormState } from "@/lib/types";

export async function loginAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  const fieldErrors: Record<string, string> = {};

  if (email === "") {
    fieldErrors.email = "Email is required.";
  }

  if (password === "") {
    fieldErrors.password = "Password is required.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "Enter your email and password.", fieldErrors };
  }

  const user = await findUserByEmail(email);

  // Verify against a dummy hash when the account is unknown so that a missing
  // account and a wrong password take a comparable amount of time.
  const valid = user
    ? await verifyPassword(password, user.passwordHash)
    : await verifyPassword(password, "scrypt$64$00$00");

  if (!user || !valid) {
    return {
      status: "error",
      message: "Incorrect email or password.",
      fieldErrors: {},
    };
  }

  if (user.status !== "Active") {
    return {
      status: "error",
      message: "This account has been deactivated. Contact an administrator.",
      fieldErrors: {},
    };
  }

  await pruneExpiredSessions();
  await createSession(user.id);

  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}
