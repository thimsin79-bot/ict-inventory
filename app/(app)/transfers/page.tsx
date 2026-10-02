import { Badge } from "@/components/Badge";
import { DataTable } from "@/components/DataTable";
import type { Column } from "@/components/DataTable";
import { LiveRefresh } from "@/components/LiveRefresh";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { RecordForm, type FieldDef } from "@/components/RecordForm";
import { requireUser } from "@/lib/auth/guards";
import { canWrite } from "@/lib/permissions";
import { listAssetOptions, listUserOptions } from "@/lib/store";
import { createTransferAction } from "@/lib/store/actions";
import { getAssetFormOptions } from "@/lib/store/assets";
import { listTransfers } from "@/lib/store/operations";
import type { TransferRecord } from "@/lib/types";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default async function TransfersPage() {
  const user = await requireUser();
  const writable = canWrite(user.role);

  const [transfers, assetOptions, users, reference] = await Promise.all([
    listTransfers(),
    listAssetOptions(),
    listUserOptions(),
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
    {
      name: "fromLocationId",
      label: "From",
      type: "select",
      hint: "Leave as the asset's current location if unsure.",
      options: [
        { value: "", label: "— Asset's current location —" },
        ...reference.locations.map((option) => ({
          value: String(option.id),
          label: option.name,
        })),
      ],
    },
    {
      name: "toLocationId",
      label: "To",
      type: "select",
      required: true,
      options: [
        { value: "", label: "— Choose destination —" },
        ...reference.locations.map((option) => ({
          value: String(option.id),
          label: option.name,
        })),
      ],
    },
    { name: "transferDate", label: "Transfer Date", type: "date", required: true, defaultValue: today() },
    {
      name: "transferredBy",
      label: "Transferred By",
      type: "select",
      options: [
        { value: "", label: "— Not set —" },
        ...users.map((option) => ({ value: String(option.id), label: option.name })),
      ],
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      defaultValue: "Completed",
      options: [
        { value: "Completed", label: "Completed" },
        { value: "Pending", label: "Pending" },
      ],
    },
    { name: "notes", label: "Notes", type: "textarea", full: true },
  ];

  const columns: Column<TransferRecord>[] = [
    { header: "Asset", render: (row) => row.code },
    { header: "From", render: (row) => row.from || "—" },
    { header: "To", render: (row) => row.to || "—" },
    { header: "Date", render: (row) => row.date },
    { header: "By", render: (row) => row.by || "—" },
    { header: "Status", render: (row) => <Badge status={row.status} /> },
  ];

  return (
    <>
      <LiveRefresh topics={["transfers", "assets"]} />
      <PageHeader
        title="Asset Transfers"
        subtitle="Move assets between locations and users"
      />

      {writable ? (
        <Panel title="Record a Transfer">
          <RecordForm
            action={createTransferAction}
            fields={fields}
            submitLabel="Record Transfer"
            resetAfterSuccess
          />
        </Panel>
      ) : null}

      <Panel title={`${transfers.length} transfer${transfers.length === 1 ? "" : "s"}`}>
        <DataTable
          columns={columns}
          rows={transfers}
          rowKey={(row) => String(row.id)}
          emptyMessage="No transfers recorded yet."
        />
      </Panel>
    </>
  );
}
