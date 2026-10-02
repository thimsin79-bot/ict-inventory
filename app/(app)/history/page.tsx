import { DataTable } from "@/components/DataTable";
import type { Column } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { RecordForm, type FieldDef } from "@/components/RecordForm";
import { requireUser } from "@/lib/auth/guards";
import { canWrite } from "@/lib/permissions";
import { listHistory } from "@/lib/store";
import { createHistoryAction, deleteHistoryAction } from "@/lib/store/reference-actions";
import type { HistoryRecord } from "@/lib/types";

const FIELDS: FieldDef[] = [
  { name: "item", label: "Item", required: true, full: true },
  { name: "year", label: "Year", type: "number", required: true, min: "1900", defaultValue: "2018" },
  { name: "category", label: "Category" },
  { name: "supplier", label: "Supplier" },
  { name: "value", label: "Value", type: "number", step: "0.01", min: "0", defaultValue: "0" },
  { name: "remarks", label: "Remarks", type: "textarea", full: true },
];

export default async function HistoryPage() {
  const user = await requireUser();
  const writable = canWrite(user.role);
  const history = await listHistory();

  const columns: Column<HistoryRecord>[] = [
    { header: "Year", render: (row) => String(row.year) },
    { header: "Item", render: (row) => row.item },
    { header: "Category", render: (row) => row.category || "—" },
    { header: "Supplier", render: (row) => row.supplier || "—" },
    { header: "Value", render: (row) => row.value.toFixed(2) },
    { header: "Remarks", render: (row) => row.remarks || "—" },
    {
      header: "Action",
      render: (row) =>
        writable ? (
          <form action={deleteHistoryAction}>
            <input type="hidden" name="id" value={row.id} />
            <button className="btn btn-light" type="submit">
              Delete
            </button>
          </form>
        ) : null,
    },
  ];

  return (
    <>
      <PageHeader
        title="History"
        subtitle="Imported inventory records from previous years"
      />

      {writable ? (
        <Panel title="Add a Historical Record">
          <RecordForm
            action={createHistoryAction}
            fields={FIELDS}
            submitLabel="Add Record"
            resetAfterSuccess
          />
        </Panel>
      ) : null}

      <Panel title={`${history.length} record${history.length === 1 ? "" : "s"}`}>
        <DataTable
          columns={columns}
          rows={history}
          rowKey={(row) => String(row.id)}
          emptyMessage="No historical records yet."
        />
      </Panel>
    </>
  );
}
