import type { UserRole } from "./types";

/** Areas that change data or configuration, and who is allowed to reach them. */
const WRITE_AREAS: readonly string[] = [
  "/assets/new",
  "/assignments",
  "/transfers",
  "/maintenance",
  "/broken",
  "/audit",
  "/locations",
  "/departments",
  "/suppliers",
  "/purchases",
  "/users",
  "/settings",
];

const ADMIN_ONLY_AREAS: readonly string[] = ["/users", "/settings"];

function matches(areas: readonly string[], href: string): boolean {
  return areas.some((area) => href === area || href.startsWith(`${area}/`));
}

export function isViewer(role: UserRole): boolean {
  return role === "Viewer";
}

export function isAdministratorRole(role: UserRole): boolean {
  return role === "Administrator";
}

/** Viewers get a read-only sidebar; staff and administrators get everything. */
export function canManage(role: UserRole, href: string): boolean {
  return !isViewer(role) || !matches(WRITE_AREAS, href);
}

export function canWrite(role: UserRole): boolean {
  return !isViewer(role);
}

export function canWriteArea(role: UserRole, href: string): boolean {
  return canWrite(role) && (!matches(ADMIN_ONLY_AREAS, href) || isAdministratorRole(role));
}

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  Administrator: "Full access, including users and system settings.",
  "ICT Staff": "Can add, edit, and move assets but not change settings.",
  Viewer: "Read-only access to reports and the asset register.",
};
