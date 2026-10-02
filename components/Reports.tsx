import Link from "next/link";

import type { ReportDefinition } from "@/lib/types";

export function Reports({ reports }: { reports: ReportDefinition[] }) {
  if (reports.length === 0) {
    return <p className="empty">No reports available yet.</p>;
  }

  return (
    <div className="report-grid">
      {reports.map((report) => (
        <div className="report" key={report.slug}>
          <span aria-hidden="true">{report.icon}</span>
          <h3>{report.title}</h3>
          <p>{report.description}</p>
          <div className="rowactions">
            <Link className="btn btn-primary" href={`/reports/${report.slug}`}>
              Generate
            </Link>
            <a className="btn btn-light" href={`/api/reports/${report.slug}`}>
              CSV
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
