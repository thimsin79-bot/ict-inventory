"use client";

import { useState } from "react";

import { Field } from "@/components/Field";

const SAMPLE_CODE = "ICT-00001";

export function BarcodeTool() {
  const [code, setCode] = useState(SAMPLE_CODE);
  const [generated, setGenerated] = useState(SAMPLE_CODE);
  const [printed, setPrinted] = useState(false);

  return (
    <>
      <section className="panel">
        <h3>Generate Asset Label</h3>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setGenerated(code.trim() || SAMPLE_CODE);
            setPrinted(false);
          }}
        >
          <Field label="Asset Code" htmlFor="barcode-code">
            <input
              id="barcode-code"
              name="assetCode"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder={SAMPLE_CODE}
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
        <h3>{generated}</h3>
        <p>QR Code Preview</p>
        <button className="btn btn-light" type="button" onClick={() => setPrinted(true)}>
          Print Label
        </button>
        {printed ? (
          <>
            <div className="spacer" />
            <p className="notice" role="status">
              Demo UI: label sent to print queue.
            </p>
          </>
        ) : null}
      </section>
    </>
  );
}
