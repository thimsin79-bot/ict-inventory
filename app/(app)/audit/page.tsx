import Link from "next/link";

import { Badge } from "@/components/Badge";
import { DataTable } from "@/components/DataTable";
import type { Column } from "@/components/DataTable";
import { KpiGrid } from "@/components/KpiGrid";
import { LiveRefresh } from "@/components/LiveRefresh";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { RecordForm, type FieldDef } from "@/components/RecordForm";
import { requireUser } from "@/lib/auth/guards";
import { canWrite } from "@/lib/permissions";
import { setAuditResultAction, startAuditAction } from "@/lib/store/actions";
import { getAuditSummary, listAudits, listUnauditedAssets } from "@/lib/store/operations";
import type { AuditRecord, AuditResult } from "@/lib/types";

const FILTERS: readonly { key: string; label: string }[] = [
  { key: "", label: "All" },
  { key: "Pending", label: "Pending" },
  { key: "Verified", label: "Verified" },
  { key: "Missing", label: "Missing" },
];

function isResult(value: string | undefined): value is AuditResult {
  return value === "Pending" || value === "Verified" || value === "Missing";
}

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ result?: string }>;
}) {
  const [user, params] = await Promise.all([requireUser(), searchParams]);
  const writable = canWrite(user.role);
  const filter = isResult(params.result) ? params.result : undefined;

  const [summary, records, unaudited] = await Promise.all([
    getAuditSummary(),
    listAudits(filter),
    writable ? listUnauditedAssets(100) : Promise.resolve([]),
  ]);

  const fields: FieldDef[] = [
    {
      name: "auditor",
      label: "Lead Auditor",
      required: true,
      defaultValue: user.name,
      full: true,
    },
    {
      name: "limit",
      label: "Number of assets to include",
      type: "number",
      min: "1",
      defaultValue: "100",
      hint: "Pending audit rows are created for assets that have none yet.",
    },
  ];

  const columns: Column<AuditRecord>[] = [
    { header: "Asset Code", render: (row) => row.code },
    { header: "Asset", render: (row) => row.asset || "—" },
    { header: "Location", render: (row) => row.location || "—" },
    { header: "Audit Date", render: (row) => row.auditDate || "—" },
    { header: "Auditor", render: (row) => row.auditor || "—" },
    { header: "Result", render: (row) => <Badge status={row.result} /> },
    {
      header: "Action",
      render: (row) =>
        writable ? (
          <div className="rowactions">
            <form action={setAuditResultAction}>
              <input type="hidden" name="assetId" value={row.assetId} />
              <input type="hidden" name="auditor" value={user.name} />
              <input type="hidden" name="notes" value="" />
              <button className="btn btn-light btn-sm" name="result" value="Verified" type="submit">
                Verify
              </button>
            </form>
            <form action={setAuditResultAction}>
              <input type="hidden" name="assetId" value={row.assetId} />
              <input type="hidden" name="auditor" value={user.name} />
              <input type="hidden" name="notes" value="" />
              <button className="btn btn-light btn-sm" name="result" value="Missing" type="submit">
                Missing
              </button>
            </form>
          </div>
        ) : null,
    },
  ];

  return (
    <>
      <LiveRefresh topics={["audit", "assets"]} />
      <PageHeader
        title="Asset Audit"
        subtitle="Verify physical assets against the register"
      />

      <KpiGrid
        stats={[
          { label: "Assets to Verify", value: String(summary.toVerify) },
          { label: "Verified", value: String(summary.verified) },
          { label: "Missing", value: String(summary.missing) },
          { label: "Pending", value: String(summary.pending) },
        ]}
      />

      {writable && unaudited.length > 0 ? (
        <Panel title={`Start an audit (${unaudited.length} asset${unaudited.length === 1 ? "" : "s"} without a record)`}>
          <RecordForm
            action={startAuditAction}
            fields={fields}
            submitLabel="Start Audit"
          />
        </Panel>
      ) : null}

      <div className="toolbar">
        {FILTERS.map((option) => (
          <Link
            key={option.key || "all"}
            className={`btn ${filter === (option.key || undefined) ? "btn-primary" : "btn-light"}`}
            href={option.key === "" ? "/audit" : `/audit?result=${option.key}`}
          >
            {option.label}
          </Link>
        ))}
      </div>

      <Panel title={`${records.length} audit record${records.length === 1 ? "" : "s"}`}>
        <DataTable
          columns={columns}
          rows={records}
          rowKey={(row) => String(row.id)}
          emptyMessage="No audit records match this filter."
        />
      </Panel>
    </>
  );
}
