import { DataTable } from "@/components/DataTable";
import type { Column } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { listDepartments } from "@/lib/store";
import type { DepartmentRecord } from "@/lib/types";

const COLUMNS: Column<DepartmentRecord>[] = [
  { header: "Department", render: (row) => row.name },
  { header: "Manager", render: (row) => row.manager },
  { header: "Assets", render: (row) => String(row.assets) },
  { header: "Users", render: (row) => String(row.users) },
];

export default async function DepartmentsPage() {
  const departments = await listDepartments();

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
        <DataTable
          columns={COLUMNS}
          rows={departments}
          rowKey={(row) => row.name}
          emptyMessage="No departments added yet."
        />
      </Panel>
    </>
  );
}
