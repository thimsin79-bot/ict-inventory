import Link from "next/link";

import { DataTable } from "@/components/DataTable";
import type { Column } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { PurchaseForm } from "@/components/PurchaseForm";
import { requireUser } from "@/lib/auth/guards";
import { canWrite } from "@/lib/permissions";
import { listPurchases, listSuppliers } from "@/lib/store";
import { createPurchaseAction, deletePurchaseAction } from "@/lib/store/reference-actions";
import type { PurchaseRecord } from "@/lib/types";

export default async function PurchasesPage() {
  const user = await requireUser();
  const writable = canWrite(user.role);

  const [purchases, suppliers] = await Promise.all([listPurchases(), listSuppliers()]);

  const columns: Column<PurchaseRecord>[] = [
    {
      header: "Invoice",
      render: (row) => (
        <Link className="link" href={`/purchases/${row.id}`}>
          {row.invoice}
        </Link>
      ),
    },
    { header: "Date", render: (row) => row.date },
    { header: "Supplier", render: (row) => row.supplier || "—" },
    { header: "Items", render: (row) => String(row.items) },
    { header: "Total", render: (row) => row.total.toFixed(2) },
    { header: "Notes", render: (row) => row.notes || "—" },
    {
      header: "Action",
      render: (row) =>
        writable ? (
          <form action={deletePurchaseAction}>
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
      <PageHeader title="Purchasing" subtitle="Purchase records and invoice line items" />

      {writable ? (
        <Panel title="Record a Purchase">
          <PurchaseForm
            action={createPurchaseAction}
            suppliers={suppliers.map((supplier) => ({ id: supplier.id, name: supplier.name }))}
          />
        </Panel>
      ) : null}

      <Panel title={`${purchases.length} purchase${purchases.length === 1 ? "" : "s"}`}>
        <DataTable
          columns={columns}
          rows={purchases}
          rowKey={(row) => String(row.id)}
          emptyMessage="No purchases recorded yet."
        />
      </Panel>
    </>
  );
}
