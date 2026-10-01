"use client";

import { useState } from "react";

import { Field } from "@/components/Field";
import {
  ASSET_LOCATIONS,
  CATEGORIES,
  CONDITIONS,
  DEPARTMENTS,
  STATUSES,
  SUPPLIERS,
} from "@/lib/data";

export function AddAssetForm({ assetCode }: { assetCode: string }) {
  const [saved, setSaved] = useState(false);

  return (
    <form
      className="formgrid"
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(true);
      }}
    >
      <Field label="Asset Code" htmlFor="asset-code">
        <input id="asset-code" name="assetCode" defaultValue={assetCode} required />
      </Field>
      <Field label="Category" htmlFor="category">
        <select id="category" name="category" defaultValue={CATEGORIES[0]}>
          {CATEGORIES.map((option) => (
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
        <input id="purchase-price" name="purchasePrice" type="number" step="0.01" placeholder="0.00" />
      </Field>
      <Field label="Supplier" htmlFor="supplier">
        <select id="supplier" name="supplier" defaultValue={SUPPLIERS[0]}>
          {SUPPLIERS.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </Field>
      <Field label="Location" htmlFor="location">
        <select id="location" name="location" defaultValue={ASSET_LOCATIONS[0]}>
          {ASSET_LOCATIONS.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </Field>
      <Field label="Department" htmlFor="department">
        <select id="department" name="department" defaultValue={DEPARTMENTS[0]}>
          {DEPARTMENTS.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </Field>
      <Field label="Status" htmlFor="status">
        <select id="status" name="status" defaultValue={STATUSES[0]}>
          {STATUSES.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </Field>
      <Field label="Condition" htmlFor="condition">
        <select id="condition" name="condition" defaultValue={CONDITIONS[0]}>
          {CONDITIONS.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </Field>
      <Field label="Remarks" htmlFor="remarks" full>
        <textarea id="remarks" name="remarks" placeholder="Additional information..." />
      </Field>
      <div className="full">
        {saved ? (
          <p className="notice" role="status">
            Demo UI: asset saved successfully.
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
