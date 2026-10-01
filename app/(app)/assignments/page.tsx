import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { ASSIGNMENTS } from "@/lib/data";

export default function AssignmentsPage() {
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
        <DataTable table={ASSIGNMENTS} />
      </Panel>
    </>
  );
}
