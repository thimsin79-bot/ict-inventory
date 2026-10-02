import type { ReactNode } from "react";

export function Field({
  label,
  htmlFor,
  children,
  full,
  error,
  hint,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
  full?: boolean;
  error?: string;
  hint?: string;
}) {
  return (
    <div className={full ? "field full" : "field"}>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {hint ? <small className="hint">{hint}</small> : null}
      {error ? (
        <small className="field-error" role="alert">
          {error}
        </small>
      ) : null}
    </div>
  );
}
