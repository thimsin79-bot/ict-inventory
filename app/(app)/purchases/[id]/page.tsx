import Link from "next/link";
import { notFound } from "next/navigation";

import { DataTable } from "@/components/DataTable";
import type { Column } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { requireUser } from "@/lib/auth/guards";
import { getPurchaseById, getPurchaseItems } from "@/lib/store";
import type { PurchaseItemRecord } from "@/lib/types";

export default async function PurchaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const purchaseId = Number(id);

  if (!Number.isFinite(purchaseId)) {
    notFound();
  }

  const purchase = await getPurchaseById(purchaseId);

  if (!purchase) {
    notFound();
  }

  const items = await getPurchaseItems(purchaseId);

  const columns: Column<PurchaseItemRecord>[] = [
    { header: "Description", render: (row) => row.description },
    { header: "Qty", render: (row) => String(row.quantity) },
    { header: "Unit Price", render: (row) => row.unitPrice.toFixed(2) },
    { header: "Line Total", render: (row) => row.lineTotal.toFixed(2) },
  ];

  return (
    <>
      <PageHeader
        title={`Invoice ${purchase.invoice}`}
        subtitle={`${purchase.date} • ${purchase.supplier || "No supplier"}`}
        action={
          <Link className="btn btn-light" href="/purchases">
            ← Back
          </Link>
        }
      />

      <div className="panel">
        <div className="panel-head">
          <h2>Purchase Summary</h2>
        </div>
        <div className="panel-body">
          <dl className="details">
            <div className="detail">
              <dt>Invoice</dt>
              <dd>{purchase.invoice}</dd>
            </div>
            <div className="detail">
              <dt>Date</dt>
              <dd>{purchase.date}</dd>
            </div>
            <div className="detail">
              <dt>Supplier</dt>
              <dd>{purchase.supplier || "—"}</dd>
            </div>
            <div className="detail">
              <dt>Items</dt>
              <dd className="num">{purchase.items}</dd>
            </div>
            <div className="detail">
              <dt>Total</dt>
              <dd className="num">{purchase.total.toFixed(2)}</dd>
            </div>
            <div className="detail">
              <dt>Notes</dt>
              <dd>{purchase.notes || "—"}</dd>
            </div>
          </dl>
        </div>
      </div>

      <Panel title={`${items.length} line item${items.length === 1 ? "" : "s"}`}>
        <DataTable
          columns={columns}
          rows={items}
          rowKey={(row) => String(row.id)}
          emptyMessage="No line items recorded for this invoice."
        />
      </Panel>
    </>
  );
}
