"use client";

import { useFormStatus } from "react-dom";

/** Submit button that reflects the enclosing form's pending state. */
export function SubmitButton({
  children,
  className = "btn btn-primary",
  disabled = false,
}: {
  children: string;
  className?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button className={className} type="submit" disabled={pending || disabled}>
      {pending ? "Saving…" : children}
    </button>
  );
}
