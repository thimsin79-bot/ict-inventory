import { Badge } from "@/components/Badge";
import { DataTable } from "@/components/DataTable";
import type { Column } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { listAssignments } from "@/lib/store";
import type { AssignmentRecord } from "@/lib/types";

const COLUMNS: Column<AssignmentRecord>[] = [
  { header: "Asset", render: (row) => row.asset },
  { header: "Assigned To", render: (row) => row.assignee },
  { header: "Department", render: (row) => row.department },
  { header: "Location", render: (row) => row.location },
  { header: "Assigned Date", render: (row) => row.date },
  { header: "Status", render: (row) => <Badge status={row.status} /> },
];

export default async function AssignmentsPage() {
  const assignments = await listAssignments();

  return (
    <>
      <PageHeader
        title="Asset Assignments"
        subtitle="Track assets assigned to staff and departments"
        action={
          <button className="btn btn-primary" type="button">
            ＋ Assign Asset
          </button>
        }
      />
      <Panel>
        <DataTable
          columns={COLUMNS}
          rows={assignments}
          rowKey={(row) => `${row.asset}-${row.date}`}
          emptyMessage="No assignments recorded yet."
        />
      </Panel>
    </>
  );
}
