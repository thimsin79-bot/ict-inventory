"use client";

import { useState } from "react";

import { Field } from "@/components/Field";
import { ASSET_CODE_PREFIX, CURRENCIES, DATE_FORMATS, ORGANIZATION_NAME } from "@/lib/data";

export function SettingsForm() {
  const [saved, setSaved] = useState(false);

  return (
    <form
      className="formgrid"
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(true);
      }}
    >
      <Field label="Organization Name" htmlFor="organization-name">
        <input id="organization-name" name="organizationName" defaultValue={ORGANIZATION_NAME} />
      </Field>
      <Field label="Asset Code Prefix" htmlFor="code-prefix">
        <input id="code-prefix" name="assetCodePrefix" defaultValue={ASSET_CODE_PREFIX} />
      </Field>
      <Field label="Default Currency" htmlFor="currency">
        <select id="currency" name="currency" defaultValue={CURRENCIES[0]}>
          {CURRENCIES.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </Field>
      <Field label="Date Format" htmlFor="date-format">
        <select id="date-format" name="dateFormat" defaultValue={DATE_FORMATS[0]}>
          {DATE_FORMATS.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </Field>
      <div className="full">
        {saved ? (
          <p className="notice" role="status">
            Demo UI: settings saved.
          </p>
        ) : null}
        <div className="spacer" />
        <button className="btn btn-primary" type="submit">
          Save Settings
        </button>
      </div>
    </form>
  );
}
