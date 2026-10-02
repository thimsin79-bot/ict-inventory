import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { getCurrentUser } from "@/lib/auth/session";

export default async function AppLayout({ children }: { children: ReactNode }) {
  // cookies() makes this layout dynamic, so the guard re-runs on every
  // navigation rather than being captured once at build time.
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <div className="app">
        <Sidebar role={user.role} />
        <div className="main">
          <Topbar
            name={user.name}
            role={user.role}
            initials={user.initials}
          />
          <main className="content" id="main-content">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
