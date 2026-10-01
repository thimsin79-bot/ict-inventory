import { DataTable } from "@/components/DataTable";
import type { Column } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { formatCurrency } from "@/lib/format";
import { listPurchases } from "@/lib/store";
import type { PurchaseRecord } from "@/lib/types";

const COLUMNS: Column<PurchaseRecord>[] = [
  { header: "Invoice", render: (row) => row.invoice },
  { header: "Date", render: (row) => row.date },
  { header: "Supplier", render: (row) => row.supplier },
  { header: "Items", render: (row) => String(row.items) },
  { header: "Total", render: (row) => formatCurrency(row.total) },
];

export default async function PurchasesPage() {
  const purchases = await listPurchases();

  return (
    <>
      <PageHeader
        title="Purchasing"
        subtitle="Purchase records, invoices and procurement history"
        action={
          <button className="btn btn-primary" type="button">
            ＋ New Purchase
          </button>
        }
      />
      <Panel>
        <DataTable
          columns={COLUMNS}
          rows={purchases}
          rowKey={(row) => row.invoice}
          emptyMessage="No purchase records yet."
        />
      </Panel>
    </>
  );
}
