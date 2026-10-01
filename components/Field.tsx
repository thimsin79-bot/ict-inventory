import type { ReactNode } from "react";

export function Field({
  label,
  htmlFor,
  children,
  full,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? "field full" : "field"}>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
    </div>
  );
}
