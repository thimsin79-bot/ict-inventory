import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/PageHeader";
import { PrintButton } from "@/components/PrintButton";
import { requireUser } from "@/lib/auth/guards";
import { buildReport, getSettings } from "@/lib/store";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireUser();
  const { slug } = await params;
  const [report, settings] = await Promise.all([buildReport(slug), getSettings()]);

  if (!report) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title={report.title}
        subtitle={report.description}
        action={
          <div className="rowactions">
            <a className="btn btn-light" href={`/api/reports/${report.slug}`}>
              Download CSV
            </a>
            <PrintButton />
            <Link className="btn btn-light" href="/reports">
              ← Back
            </Link>
          </div>
        }
      />

      <div className="panel report-doc">
        <div className="panel-head">
          <div>
            <h2>{settings.organizationName}</h2>
            <p className="hint">
              {report.title} — {report.rows.length} row
              {report.rows.length === 1 ? "" : "s"}.
            </p>
          </div>
        </div>
        <div className="panel-body">
          {report.summary.length > 0 ? (
            <dl className="details">
              {report.summary.map((item) => (
                <div className="detail" key={item.label}>
                  <dt>{item.label}</dt>
                  <dd className="num">{item.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          <table>
            <thead>
              <tr>
                {report.columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    style={column.align === "right" ? { textAlign: "right" } : undefined}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.rows.map((row, index) => (
                <tr key={index}>
                  {report.columns.map((column) => (
                    <td
                      key={column.key}
                      className={column.align === "right" ? "num" : undefined}
                    >
                      {row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {report.rows.length === 0 ? (
            <p className="empty">No data available for this report.</p>
          ) : null}
        </div>
      </div>
    </>
  );
}
