import { Badge } from "@/components/Badge";
import { DataTable } from "@/components/DataTable";
import type { Column } from "@/components/DataTable";
import { LiveRefresh } from "@/components/LiveRefresh";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { RecordForm, type FieldDef } from "@/components/RecordForm";
import { requireUser } from "@/lib/auth/guards";
import { canWrite } from "@/lib/permissions";
import { listAssetOptions } from "@/lib/store";
import {
  createMaintenanceAction,
  updateMaintenanceStatusAction,
} from "@/lib/store/actions";
import { getMaintenanceSummary, listMaintenance } from "@/lib/store/operations";
import type { MaintenanceRecord } from "@/lib/types";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

const NEXT_STATUS: Record<string, string> = {
  Open: "In Progress",
  "In Progress": "Completed",
  Completed: "Open",
};

export default async function MaintenancePage() {
  const user = await requireUser();
  const writable = canWrite(user.role);

  const [records, summary, assetOptions] = await Promise.all([
    listMaintenance(),
    getMaintenanceSummary(),
    listAssetOptions(),
  ]);

  const fields: FieldDef[] = [
    {
      name: "assetId",
      label: "Asset",
      type: "select",
      required: true,
      full: true,
      options: [
        { value: "", label: "— Choose an asset —" },
        ...assetOptions.map((option) => ({ value: String(option.id), label: option.label })),
      ],
    },
    { name: "problem", label: "Problem", required: true, full: true },
    { name: "requestDate", label: "Request Date", type: "date", required: true, defaultValue: today() },
    { name: "technician", label: "Technician" },
    { name: "cost", label: "Cost", type: "number", step: "0.01", min: "0", defaultValue: "0" },
    {
      name: "status",
      label: "Status",
      type: "select",
      defaultValue: "Open",
      options: [
        { value: "Open", label: "Open" },
        { value: "In Progress", label: "In Progress" },
        { value: "Completed", label: "Completed" },
      ],
    },
    { name: "notes", label: "Notes", type: "textarea", full: true },
  ];

  const columns: Column<MaintenanceRecord>[] = [
    { header: "Asset", render: (row) => row.code },
    { header: "Problem", render: (row) => row.problem },
    { header: "Date", render: (row) => row.date },
    { header: "Technician", render: (row) => row.technician || "—" },
    { header: "Cost", render: (row) => row.cost },
    { header: "Completed", render: (row) => row.completedDate || "—" },
    { header: "Status", render: (row) => <Badge status={row.status} /> },
    {
      header: "Action",
      render: (row) =>
        writable ? (
          <form action={updateMaintenanceStatusAction}>
            <input type="hidden" name="id" value={row.id} />
            <input type="hidden" name="status" value={NEXT_STATUS[row.status]} />
            <button className="btn btn-light" type="submit">
              Mark {NEXT_STATUS[row.status]}
            </button>
          </form>
        ) : null,
    },
  ];

  return (
    <>
      <LiveRefresh topics={["maintenance", "assets"]} />
      <PageHeader
        title="Maintenance"
        subtitle="Log repairs and service jobs for ICT equipment"
      />

      <div className="kpis">
        <div className="mini">
          Open
          <strong>{summary.open}</strong>
        </div>
        <div className="mini">
          In Progress
          <strong>{summary.inProgress}</strong>
        </div>
        <div className="mini">
          Completed
          <strong>{summary.completed}</strong>
        </div>
        <div className="mini">
          Total Cost
          <strong>{summary.totalCost.toLocaleString()}</strong>
        </div>
      </div>

      {writable ? (
        <Panel title="Log Maintenance">
          <RecordForm
            action={createMaintenanceAction}
            fields={fields}
            submitLabel="Log Maintenance"
            resetAfterSuccess
          />
        </Panel>
      ) : null}

      <Panel title={`${records.length} maintenance record${records.length === 1 ? "" : "s"}`}>
        <DataTable
          columns={columns}
          rows={records}
          rowKey={(row) => String(row.id)}
          emptyMessage="No maintenance recorded yet."
        />
      </Panel>
    </>
  );
}
