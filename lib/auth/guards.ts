import { redirect } from "next/navigation";

import { canWriteArea, isAdministratorRole } from "@/lib/permissions";

import { getCurrentUser, type SessionUser } from "./session";

/** Every protected page calls this first; it never returns null. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

/** For pages that render create/edit controls. */
export async function requireWrite(href: string): Promise<SessionUser> {
  const user = await requireUser();

  if (!canWriteArea(user.role, href)) {
    redirect("/forbidden");
  }

  return user;
}

export async function requireAdministrator(): Promise<SessionUser> {
  const user = await requireUser();

  if (!isAdministratorRole(user.role)) {
    redirect("/forbidden");
  }

  return user;
}
