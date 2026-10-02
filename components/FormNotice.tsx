import type { FormState } from "@/lib/types";

/** Success / error banner shown above a form's submit row. */
export function FormNotice({ state }: { state: FormState }) {
  if (state.status === "idle") {
    return null;
  }

  return (
    <p
      className={state.status === "error" ? "notice notice-error" : "notice"}
      role={state.status === "error" ? "alert" : "status"}
    >
      {state.message}
    </p>
  );
}
