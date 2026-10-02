"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { getCurrentUser, destroySession, type SessionUser } from "@/lib/auth/session";

export async function logoutAction(): Promise<void> {
  await destroySession();
  revalidatePath("/", "layout");
  redirect("/login");
}

/**
 * Guards write Server Actions. Server Actions are public endpoints, so the
 * permission check has to happen here as well as in the page that renders the
 * form - hiding a button is not an authorisation control.
 */
export async function assertCanWrite(): Promise<SessionUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role === "Viewer") {
    throw new Error("Your role does not allow changes to the inventory.");
  }

  return user;
}

export async function assertAdministrator(): Promise<SessionUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "Administrator") {
    throw new Error("Only administrators can perform this action.");
  }

  return user;
}
