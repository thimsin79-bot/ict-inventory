import type { BadgeTone } from "./types";

const TONE_BY_STATUS: Record<string, BadgeTone> = {
  Active: "active",
  Completed: "active",
  Assigned: "assigned",
  Maintenance: "maint",
  "In Progress": "maint",
  Repairing: "maint",
  Open: "maint",
  Broken: "broken",
  Inactive: "broken",
};

export function toneFor(status: string): BadgeTone {
  return TONE_BY_STATUS[status] ?? "active";
}
