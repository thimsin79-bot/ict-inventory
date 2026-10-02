"use client";

import { useState } from "react";

import { Field } from "@/components/Field";

export function BarcodeTool({
  defaultCode,
  codes,
  organization,
}: {
  defaultCode: string;
  codes: string[];
  organization: string;
}) {
  const [code, setCode] = useState(defaultCode);
  const [generated, setGenerated] = useState(defaultCode.trim());
  const [message, setMessage] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = code.trim();

    if (trimmed === "") {
      setGenerated("");
      setMessage("Enter an asset code to generate a label.");
      return;
    }

    setGenerated(trimmed);
    setMessage("");
  }

  return (
    <>
      <section className="panel">
        <h3>Generate Asset Label</h3>
        <form onSubmit={handleSubmit}>
          <Field label="Asset Code" htmlFor="barcode-code">
            <input
              id="barcode-code"
              name="assetCode"
              list="asset-codes"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="e.g. ICT-00001"
            />
          </Field>
          <datalist id="asset-codes">
            {codes.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
          <div className="spacer" />
          <button className="btn btn-primary" type="submit">
            Generate Code
          </button>
        </form>
        {message ? (
          <p className="notice" role="status">
            {message}
          </p>
        ) : null}
      </section>

      <section className="panel qr-preview">
        {generated ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- QR is served by our own API route */}
            <img
              className="qr-image"
              src={`/api/qr?code=${encodeURIComponent(generated)}&size=220`}
              alt={`QR code for ${generated}`}
              width={220}
              height={220}
            />
            <h3 className="mono">{generated}</h3>
            <p>{organization}</p>
            <button
              className="btn btn-light"
              type="button"
              onClick={() => window.print()}
            >
              Print Label
            </button>
          </>
        ) : (
          <p className="empty">Enter an asset code to preview its label.</p>
        )}
      </section>
    </>
  );
}
