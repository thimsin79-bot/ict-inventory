import { DataTable } from "@/components/DataTable";
import type { Column } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { listSuppliers } from "@/lib/store";
import type { SupplierRecord } from "@/lib/types";

const COLUMNS: Column<SupplierRecord>[] = [
  { header: "Supplier", render: (row) => row.name },
  { header: "Contact", render: (row) => row.contact },
  { header: "Phone", render: (row) => row.phone },
  { header: "Purchased Assets", render: (row) => String(row.assets) },
];

export default async function SuppliersPage() {
  const suppliers = await listSuppliers();

  return (
    <>
      <PageHeader
        title="Suppliers"
        subtitle="Supplier and vendor management"
        action={
          <button className="btn btn-primary" type="button">
            ＋ Add Supplier
          </button>
        }
      />
      <Panel>
        <DataTable
          columns={COLUMNS}
          rows={suppliers}
          rowKey={(row) => row.name}
          emptyMessage="No suppliers added yet."
        />
      </Panel>
    </>
  );
}
