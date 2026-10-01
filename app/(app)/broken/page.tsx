import { Badge } from "@/components/Badge";
import { DataTable } from "@/components/DataTable";
import type { Column } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { listBroken } from "@/lib/store";
import type { BrokenRecord } from "@/lib/types";

const COLUMNS: Column<BrokenRecord>[] = [
  { header: "Asset", render: (row) => row.asset },
  { header: "Problem", render: (row) => row.problem },
  { header: "Location", render: (row) => row.location },
  { header: "Reported Date", render: (row) => row.reportedDate },
  { header: "Action", render: (row) => row.action },
  { header: "Status", render: (row) => <Badge status={row.status} /> },
];

export default async function BrokenPage() {
  const broken = await listBroken();

  return (
    <>
      <PageHeader
        title="Broken / Damaged Items"
        subtitle="Manage damaged and non-working ICT assets"
        action={
          <button className="btn btn-primary" type="button">
            ＋ Report Broken
          </button>
        }
      />
      <Panel>
        <DataTable
          columns={COLUMNS}
          rows={broken}
          rowKey={(row) => `${row.asset}-${row.reportedDate}`}
          emptyMessage="No broken or damaged assets reported."
        />
      </Panel>
    </>
  );
}
