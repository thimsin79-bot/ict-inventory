"use client";

import { useState } from "react";

import { Field } from "@/components/Field";
import {
  ASSET_CODE_PREFIX,
  CURRENCY_OPTIONS,
  DATE_FORMAT_OPTIONS,
  ORGANIZATION_NAME,
} from "@/lib/navigation";

export function SettingsForm() {
  const [message, setMessage] = useState("");

  return (
    <form
      className="formgrid"
      onSubmit={(event) => {
        event.preventDefault();
        setMessage("Not saved: this app has no data source connected yet.");
      }}
    >
      <Field label="Organization Name" htmlFor="organization-name">
        <input
          id="organization-name"
          name="organizationName"
          defaultValue={ORGANIZATION_NAME}
          placeholder="Organization name"
        />
      </Field>
      <Field label="Asset Code Prefix" htmlFor="code-prefix">
        <input
          id="code-prefix"
          name="assetCodePrefix"
          defaultValue={ASSET_CODE_PREFIX}
          placeholder="e.g. ICT-"
        />
      </Field>
      <Field label="Default Currency" htmlFor="currency">
        <select id="currency" name="currency" defaultValue={CURRENCY_OPTIONS[0]}>
          {CURRENCY_OPTIONS.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </Field>
      <Field label="Date Format" htmlFor="date-format">
        <select id="date-format" name="dateFormat" defaultValue={DATE_FORMAT_OPTIONS[0]}>
          {DATE_FORMAT_OPTIONS.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </Field>
      <div className="full">
        {message ? (
          <p className="notice" role="status">
            {message}
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
