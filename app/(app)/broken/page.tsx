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
import { createBrokenAction, updateBrokenStatusAction } from "@/lib/store/actions";
import { getAssetFormOptions } from "@/lib/store/assets";
import { listBroken } from "@/lib/store/operations";
import type { BrokenRecord } from "@/lib/types";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

const NEXT_STATUS: Record<string, string> = {
  Broken: "Repairing",
  Repairing: "Resolved",
  Resolved: "Broken",
};

export default async function BrokenPage() {
  const user = await requireUser();
  const writable = canWrite(user.role);

  const [records, assetOptions, reference] = await Promise.all([
    listBroken(),
    listAssetOptions(),
    getAssetFormOptions(),
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
    { name: "problem", label: "Fault", required: true, full: true },
    {
      name: "locationId",
      label: "Location",
      type: "select",
      options: [
        { value: "", label: "— Asset's current location —" },
        ...reference.locations.map((option) => ({
          value: String(option.id),
          label: option.name,
        })),
      ],
    },
    {
      name: "reportedDate",
      label: "Reported Date",
      type: "date",
      required: true,
      defaultValue: today(),
    },
    { name: "action", label: "Action Taken" },
    {
      name: "status",
      label: "Status",
      type: "select",
      defaultValue: "Broken",
      options: [
        { value: "Broken", label: "Broken" },
        { value: "Repairing", label: "Repairing" },
        { value: "Resolved", label: "Resolved" },
      ],
    },
    { name: "notes", label: "Notes", type: "textarea", full: true },
  ];

  const columns: Column<BrokenRecord>[] = [
    { header: "Asset", render: (row) => row.asset },
    { header: "Fault", render: (row) => row.problem },
    { header: "Location", render: (row) => row.location || "—" },
    { header: "Reported", render: (row) => row.reportedDate },
    { header: "Action", render: (row) => row.action || "—" },
    { header: "Status", render: (row) => <Badge status={row.status} /> },
    {
      header: "Update",
      render: (row) =>
        writable ? (
          <form action={updateBrokenStatusAction}>
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
      <LiveRefresh topics={["broken", "assets"]} />
      <PageHeader
        title="Broken / Damaged"
        subtitle="Report damaged equipment and track repairs"
      />

      {writable ? (
        <Panel title="Report a Fault">
          <RecordForm
            action={createBrokenAction}
            fields={fields}
            submitLabel="Report Fault"
            resetAfterSuccess
          />
        </Panel>
      ) : null}

      <Panel title={`${records.length} damage report${records.length === 1 ? "" : "s"}`}>
        <DataTable
          columns={columns}
          rows={records}
          rowKey={(row) => String(row.id)}
          emptyMessage="No damaged equipment reported."
        />
      </Panel>
    </>
  );
}
