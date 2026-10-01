"use client";

import { useState } from "react";

import { Field } from "@/components/Field";
import {
  AVAILABILITY_OPTIONS,
  CATEGORY_OPTIONS,
  CONDITION_OPTIONS,
  DEPARTMENT_OPTIONS,
  LOCATION_OPTIONS,
  SUPPLIER_OPTIONS,
} from "@/lib/navigation";

export function AddAssetForm({ assetCode }: { assetCode: string }) {
  const [message, setMessage] = useState("");

  return (
    <form
      className="formgrid"
      onSubmit={(event) => {
        event.preventDefault();
        setMessage("Not saved: this app has no data source connected yet.");
      }}
    >
      <Field label="Asset Code" htmlFor="asset-code">
        <input id="asset-code" name="assetCode" defaultValue={assetCode} />
      </Field>
      <Field label="Category" htmlFor="category">
        <select id="category" name="category" defaultValue={CATEGORY_OPTIONS[0]}>
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </Field>
      <Field label="Brand" htmlFor="brand">
        <input id="brand" name="brand" placeholder="e.g. Dell" />
      </Field>
      <Field label="Model" htmlFor="model">
        <input id="model" name="model" placeholder="Model number" />
      </Field>
      <Field label="Serial Number" htmlFor="serial">
        <input id="serial" name="serial" placeholder="Serial number" />
      </Field>
      <Field label="Purchase Date" htmlFor="purchase-date">
        <input id="purchase-date" name="purchaseDate" type="date" />
      </Field>
      <Field label="Purchase Price" htmlFor="purchase-price">
        <input
          id="purchase-price"
          name="purchasePrice"
          type="number"
          step="0.01"
          placeholder="0.00"
        />
      </Field>
      <Field label="Supplier" htmlFor="supplier">
        <select id="supplier" name="supplier" defaultValue="">
          <option value="">No suppliers available</option>
          {SUPPLIER_OPTIONS.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </Field>
      <Field label="Location" htmlFor="location">
        <select id="location" name="location" defaultValue="">
          <option value="">No locations available</option>
          {LOCATION_OPTIONS.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </Field>
      <Field label="Department" htmlFor="department">
        <select id="department" name="department" defaultValue="">
          <option value="">No departments available</option>
          {DEPARTMENT_OPTIONS.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </Field>
      <Field label="Status" htmlFor="status">
        <select id="status" name="status" defaultValue={AVAILABILITY_OPTIONS[0]}>
          {AVAILABILITY_OPTIONS.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </Field>
      <Field label="Condition" htmlFor="condition">
        <select id="condition" name="condition" defaultValue={CONDITION_OPTIONS[0]}>
          {CONDITION_OPTIONS.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </Field>
      <Field label="Remarks" htmlFor="remarks" full>
        <textarea id="remarks" name="remarks" placeholder="Additional information..." />
      </Field>
      <div className="full">
        {message ? (
          <p className="notice" role="status">
            {message}
          </p>
        ) : null}
        <div className="spacer" />
        <button className="btn btn-primary" type="submit">
          Save Asset
        </button>{" "}
        <button className="btn btn-light" type="reset">
          Cancel
        </button>
      </div>
    </form>
  );
}
