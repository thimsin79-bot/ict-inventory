import type { ReactNode } from "react";

import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <div className="app">
        <Sidebar />
        <div className="main">
          <Topbar />
          <main className="content" id="main-content">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
