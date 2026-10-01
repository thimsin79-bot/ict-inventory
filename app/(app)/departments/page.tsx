import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { DEPARTMENTS_TABLE } from "@/lib/data";

export default function DepartmentsPage() {
  return (
    <>
      <PageHeader
        title="Departments"
        subtitle="Manage departments and assigned assets"
        action={
          <button className="btn btn-primary" type="button">
            ＋ Add Department
          </button>
        }
      />
      <Panel>
        <DataTable table={DEPARTMENTS_TABLE} />
      </Panel>
    </>
  );
}
