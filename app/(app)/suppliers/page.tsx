import Link from "next/link";

import { DataTable } from "@/components/DataTable";
import type { Column } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { RecordForm, type FieldDef } from "@/components/RecordForm";
import { requireUser } from "@/lib/auth/guards";
import { canWrite } from "@/lib/permissions";
import { listSuppliers } from "@/lib/store";
import { createSupplierAction, deleteSupplierAction } from "@/lib/store/reference-actions";
import type { SupplierRecord } from "@/lib/types";

const FIELDS: FieldDef[] = [
  { name: "name", label: "Supplier Name", required: true, autoFocus: true },
  { name: "contact", label: "Contact Person" },
  { name: "phone", label: "Phone" },
  { name: "email", label: "Email", type: "email" },
];

export default async function SuppliersPage() {
  const user = await requireUser();
  const writable = canWrite(user.role);
  const suppliers = await listSuppliers();

  const columns: Column<SupplierRecord>[] = [
    { header: "Supplier", render: (row) => row.name },
    { header: "Contact", render: (row) => row.contact || "—" },
    { header: "Phone", render: (row) => row.phone || "—" },
    { header: "Email", render: (row) => row.email || "—" },
    { header: "Assets", render: (row) => String(row.assets) },
    {
      header: "Action",
      render: (row) =>
        writable ? (
          <div className="rowactions">
            <Link className="btn btn-light" href={`/suppliers/${row.id}/edit`}>
              Edit
            </Link>
            <form action={deleteSupplierAction}>
              <input type="hidden" name="id" value={row.id} />
              <button className="btn btn-light" type="submit">
                Delete
              </button>
            </form>
          </div>
        ) : null,
    },
  ];

  return (
    <>
      <PageHeader title="Suppliers" subtitle="Vendors and service providers" />

      {writable ? (
        <Panel title="Add a Supplier">
          <RecordForm
            action={createSupplierAction}
            fields={FIELDS}
            submitLabel="Add Supplier"
            resetAfterSuccess
          />
        </Panel>
      ) : null}

      <Panel title={`${suppliers.length} supplier${suppliers.length === 1 ? "" : "s"}`}>
        <DataTable
          columns={columns}
          rows={suppliers}
          rowKey={(row) => String(row.id)}
          emptyMessage="No suppliers added yet."
        />
      </Panel>
    </>
  );
}
