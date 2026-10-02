"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV } from "@/lib/navigation";
import { canManage } from "@/lib/permissions";
import type { UserRole } from "@/lib/types";

export function Sidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="brand">
        ICT <span>INVENTORY</span>
      </div>
      <nav className="nav" aria-label="Main">
        {NAV.map((section) => (
          <Fragment key={section.title}>
            <div className="section">{section.title}</div>
            {section.items
              .filter((item) => canManage(role, item.href))
              .map((item) => {
                const exact = pathname === item.href;
                const active = exact || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={active ? "active" : undefined}
                    aria-current={exact ? "page" : undefined}
                  >
                    <span aria-hidden="true">{item.icon}</span> {item.label}
                  </Link>
                );
              })}
          </Fragment>
        ))}
      </nav>
    </aside>
  );
}
