"use client";

import { useState } from "react";

import { REPORTS } from "@/lib/data";

export function Reports() {
  const [message, setMessage] = useState("");

  return (
    <>
      <div className="report-grid">
        {REPORTS.map((report) => (
          <div className="report" key={report.title}>
            <span aria-hidden="true">{report.icon}</span>
            <h3>{report.title}</h3>
            <p>{report.description}</p>
            <button
              className="btn btn-light"
              type="button"
              onClick={() => setMessage(`Demo UI: ${report.title} report would be generated.`)}
            >
              Generate
            </button>
          </div>
        ))}
      </div>
      {message ? (
        <p className="notice" role="status">
          {message}
        </p>
      ) : null}
    </>
  );
}
