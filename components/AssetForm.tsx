"use client";

import { FormNotice } from "@/components/FormNotice";
import { SubmitButton } from "@/components/SubmitButton";
import { errorFor, useFormAction, type FormAction } from "@/components/useFormAction";
import type { AssetFormOptions, FormState } from "@/lib/types";

const STATUSES = ["Active", "Assigned", "Maintenance", "Broken"] as const;
const CONDITIONS = ["Good", "Fair", "Poor"] as const;
const AVAILABILITIES = ["Available", "Assigned", "Spare"] as const;

export interface AssetFormValues {
  code: string;
  category: string;
  brand: string;
  model: string;
  serial: string;
  locationId: number | null;
  departmentId: number | null;
  supplierId: number | null;
  status: string;
  condition: string;
  availability: string;
  purchasePrice: number | null;
  purchaseDate: string | null;
  remarks: string;
}

const EMPTY: AssetFormValues = {
  code: "",
  category: "",
  brand: "",
  model: "",
  serial: "",
  locationId: null,
  departmentId: null,
  supplierId: null,
  status: "Active",
  condition: "Good",
  availability: "Available",
  purchasePrice: null,
  purchaseDate: null,
  remarks: "",
};

export function AssetForm({
  action,
  options,
  values = EMPTY,
  submitLabel,
  /** Create forms offer a fresh code; edit forms keep the asset's own. */
  codeLocked = false,
  extra,
}: {
  action: FormAction;
  options: AssetFormOptions;
  values?: AssetFormValues;
  submitLabel: string;
  codeLocked?: boolean;
  extra?: React.ReactNode;
}) {
  const { state, formAction } = useFormAction(action);
  const err = (field: string): string | undefined => errorFor(state, field);
  const invalid = (field: string): boolean | undefined =>
    state.status === "error" && err(field) !== undefined ? true : undefined;

  return (
    <form action={formAction} className="formgrid">
      <div className="full">
        <FormNotice state={state} />
      </div>

      <div className="field">
        <label htmlFor="code">Asset Code</label>
        <input
          id="code"
          name="code"
          defaultValue={values.code}
          readOnly={codeLocked}
          required
          aria-invalid={invalid("code")}
        />
        {err("code") ? (
          <small className="field-error">{err("code")}</small>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="category">Category</label>
        <input
          id="category"
          name="category"
          defaultValue={values.category}
          list="category-options"
          required
          aria-invalid={invalid("category")}
        />
        <datalist id="category-options">
          {options.categories.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
        {err("category") ? (
          <small className="field-error">{err("category")}</small>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="brand">Brand</label>
        <input id="brand" name="brand" defaultValue={values.brand} />
      </div>

      <div className="field">
        <label htmlFor="model">Model</label>
        <input id="model" name="model" defaultValue={values.model} />
      </div>

      <div className="field">
        <label htmlFor="serial">Serial Number</label>
        <input id="serial" name="serial" defaultValue={values.serial} />
      </div>

      <div className="field">
        <label htmlFor="locationId">Location</label>
        <select
          id="locationId"
          name="locationId"
          defaultValue={values.locationId ?? ""}
        >
          <option value="">— Not set —</option>
          {options.locations.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="departmentId">Department</label>
        <select
          id="departmentId"
          name="departmentId"
          defaultValue={values.departmentId ?? ""}
        >
          <option value="">— Not set —</option>
          {options.departments.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="supplierId">Supplier</label>
        <select
          id="supplierId"
          name="supplierId"
          defaultValue={values.supplierId ?? ""}
        >
          <option value="">— Not set —</option>
          {options.suppliers.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="status">Status</label>
        <select id="status" name="status" defaultValue={values.status}>
          {STATUSES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="condition">Condition</label>
        <select id="condition" name="condition" defaultValue={values.condition}>
          {CONDITIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="availability">Availability</label>
        <select id="availability" name="availability" defaultValue={values.availability}>
          {AVAILABILITIES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="purchasePrice">Purchase Price</label>
        <input
          id="purchasePrice"
          name="purchasePrice"
          type="number"
          step="0.01"
          min="0"
          defaultValue={values.purchasePrice ?? ""}
          aria-invalid={invalid("purchasePrice")}
        />
        {err("purchasePrice") ? (
          <small className="field-error">{err("purchasePrice")}</small>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="purchaseDate">Purchase Date</label>
        <input
          id="purchaseDate"
          name="purchaseDate"
          type="date"
          defaultValue={values.purchaseDate ?? ""}
          aria-invalid={invalid("purchaseDate")}
        />
        {err("purchaseDate") ? (
          <small className="field-error">{err("purchaseDate")}</small>
        ) : null}
      </div>

      <div className="field full">
        <label htmlFor="remarks">Remarks</label>
        <textarea id="remarks" name="remarks" rows={3} defaultValue={values.remarks} />
      </div>

      {extra}

      <div className="full formactions">
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}

export function stateMessage(state: FormState): string {
  return state.status === "idle" ? "" : state.message;
}
