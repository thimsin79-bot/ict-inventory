"use client";

import { useState } from "react";

import { Field } from "@/components/Field";

const NOT_AVAILABLE =
  "Codes are not available until a data source is connected.";

export function BarcodeTool({ defaultCode }: { defaultCode: string }) {
  const [code, setCode] = useState(defaultCode);
  const [generated, setGenerated] = useState(defaultCode);
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
    setMessage(NOT_AVAILABLE);
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
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="e.g. ICT-00001"
            />
          </Field>
          <div className="spacer" />
          <button className="btn btn-primary" type="submit">
            Generate Code
          </button>
        </form>
      </section>
      <section className="panel qr-preview">
        <div className="glyph" aria-hidden="true">
          ▦
        </div>
        <h3>{generated || "No code"}</h3>
        <p>QR Code Preview</p>
        <button
          className="btn btn-light"
          type="button"
          onClick={() => setMessage("Printing is not available until a data source is connected.")}
        >
          Print Label
        </button>
      </section>
      {message ? (
        <p className="notice" role="status">
          {message}
        </p>
      ) : null}
    </>
  );
}
