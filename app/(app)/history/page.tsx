import { DataTable } from "@/components/DataTable";
import type { Column } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { formatCurrency } from "@/lib/format";
import { listHistory } from "@/lib/store";
import type { HistoryRecord } from "@/lib/types";

const COLUMNS: Column<HistoryRecord>[] = [
  { header: "Year", render: (row) => String(row.year) },
  { header: "Asset / Item", render: (row) => row.item },
  { header: "Category", render: (row) => row.category },
  { header: "Supplier", render: (row) => row.supplier },
  { header: "Purchase Value", render: (row) => formatCurrency(row.value) },
  { header: "Remarks", render: (row) => row.remarks },
];

export default async function HistoryPage() {
  const history = await listHistory();

  return (
    <>
      <PageHeader
        title="Historical Inventory"
        subtitle="Imported historical records from 2013–2018 and asset history"
      />
      <Panel>
        <DataTable
          columns={COLUMNS}
          rows={history}
          rowKey={(row) => `${row.year}-${row.item}`}
          emptyMessage="No historical records imported yet."
        />
      </Panel>
    </>
  );
}
