import { Badge } from "@/components/Badge";
import { DataTable } from "@/components/DataTable";
import type { Column } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { listTransfers } from "@/lib/store";
import type { TransferRecord } from "@/lib/types";

const COLUMNS: Column<TransferRecord>[] = [
  { header: "Asset", render: (row) => row.code },
  { header: "From", render: (row) => row.from },
  { header: "To", render: (row) => row.to },
  { header: "Transfer Date", render: (row) => row.date },
  { header: "Transferred By", render: (row) => row.by },
  { header: "Status", render: (row) => <Badge status={row.status} /> },
];

export default async function TransfersPage() {
  const transfers = await listTransfers();

  return (
    <>
      <PageHeader
        title="Asset Transfers"
        subtitle="Move assets between locations and users"
        action={
          <button className="btn btn-primary" type="button">
            ＋ New Transfer
          </button>
        }
      />
      <Panel>
        <DataTable
          columns={COLUMNS}
          rows={transfers}
          rowKey={(row) => `${row.code}-${row.date}`}
          emptyMessage="No transfers recorded yet."
        />
      </Panel>
    </>
  );
}
