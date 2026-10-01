import type { ReactNode } from "react";

import type { BadgeTone } from "@/lib/types";

const TONE_CLASS: Record<BadgeTone, string> = {
  active: "active-b",
  assigned: "assigned-b",
  maint: "maint-b",
  broken: "broken-b",
};

export function Badge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  return <span className={`badge ${TONE_CLASS[tone]}`}>{children}</span>;
}
