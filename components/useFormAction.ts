"use client";

import { useActionState } from "react";

import type { FormState } from "@/lib/types";

/** Signature every Server Action in this app follows. */
export type FormAction = (
  previous: FormState,
  formData: FormData,
) => Promise<FormState>;

/**
 * Wraps `useActionState` so forms share one initial state and one pending flag.
 * The action is passed straight through, so the form still works without
 * JavaScript as a plain POST to the same route.
 */
export function useFormAction(action: FormAction) {
  const [state, formAction, pending] = useActionState(action, {
    status: "idle",
    message: "",
    fieldErrors: {},
  } satisfies FormState);

  return { state, formAction, pending } as const;
}

export function errorFor(state: FormState, field: string): string | undefined {
  return state.fieldErrors[field];
}
