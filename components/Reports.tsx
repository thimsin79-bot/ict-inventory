"use client";

import { useState } from "react";

import type { ReportDefinition } from "@/lib/types";

export function Reports({ reports }: { reports: ReportDefinition[] }) {
  const [message, setMessage] = useState("");

  if (reports.length === 0) {
    return <p className="empty">No reports available until a data source is connected.</p>;
  }

  return (
    <>
      <div className="report-grid">
        {reports.map((report) => (
          <div className="report" key={report.title}>
            <span aria-hidden="true">{report.icon}</span>
            <h3>{report.title}</h3>
            <p>{report.description}</p>
            <button
              className="btn btn-light"
              type="button"
              onClick={() =>
                setMessage(`${report.title} report is not available until a data source is connected.`)
              }
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
