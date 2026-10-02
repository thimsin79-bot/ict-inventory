"use client";

import { useEffect, useRef } from "react";

import { FormNotice } from "@/components/FormNotice";
import { SubmitButton } from "@/components/SubmitButton";
import { errorFor, useFormAction, type FormAction } from "@/components/useFormAction";

export interface FieldDef {
  name: string;
  label: string;
  type?: "text" | "number" | "date" | "select" | "textarea" | "email" | "password";
  options?: readonly { value: string; label: string }[];
  required?: boolean;
  full?: boolean;
  defaultValue?: string | number | null;
  placeholder?: string;
  hint?: string;
  step?: string;
  min?: string;
  readOnly?: boolean;
  autoFocus?: boolean;
}

/**
 * One client form for every simple create/edit panel. Field definitions come
 * from the server, so pages stay declarative and there is a single place that
 * knows how to render, validate and submit a record.
 */
export function RecordForm({
  action,
  fields,
  submitLabel,
  resetAfterSuccess = false,
}: {
  action: FormAction;
  fields: readonly FieldDef[];
  submitLabel: string;
  /** Create forms clear themselves after a successful save. */
  resetAfterSuccess?: boolean;
}) {
  const { state, formAction } = useFormAction(action);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (resetAfterSuccess && state.status === "success") {
      formRef.current?.reset();
    }
  }, [resetAfterSuccess, state]);

  return (
    <form ref={formRef} action={formAction} className="formgrid">
      <div className="full">
        <FormNotice state={state} />
      </div>

      {fields.map((field) => {
        const error = errorFor(state, field.name);
        const invalid = error !== undefined;

        return (
          <div key={field.name} className={field.full ? "field full" : "field"}>
            <label htmlFor={field.name}>{field.label}</label>

            {field.type === "select" ? (
              <select
                id={field.name}
                name={field.name}
                defaultValue={field.defaultValue ?? ""}
                required={field.required}
                aria-invalid={invalid || undefined}
              >
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : field.type === "textarea" ? (
              <textarea
                id={field.name}
                name={field.name}
                rows={3}
                placeholder={field.placeholder}
                defaultValue={field.defaultValue ?? ""}
                required={field.required}
                aria-invalid={invalid || undefined}
              />
            ) : (
              <input
                id={field.name}
                name={field.name}
                type={field.type ?? "text"}
                placeholder={field.placeholder}
                defaultValue={field.defaultValue ?? ""}
                required={field.required}
                step={field.step}
                min={field.min}
                readOnly={field.readOnly}
                autoFocus={field.autoFocus}
                aria-invalid={invalid || undefined}
              />
            )}

            {field.hint && !error ? <small className="hint">{field.hint}</small> : null}
            {error ? (
              <small className="field-error" role="alert">
                {error}
              </small>
            ) : null}
          </div>
        );
      })}

      <div className="full formactions">
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
