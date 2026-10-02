import Link from "next/link";

import { DataTable } from "@/components/DataTable";
import type { Column } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { RecordForm, type FieldDef } from "@/components/RecordForm";
import { requireUser } from "@/lib/auth/guards";
import { canWrite } from "@/lib/permissions";
import { listDepartments } from "@/lib/store";
import { createDepartmentAction, deleteDepartmentAction } from "@/lib/store/reference-actions";
import type { DepartmentRecord } from "@/lib/types";

const FIELDS: FieldDef[] = [
  { name: "name", label: "Department Name", required: true, autoFocus: true },
  { name: "manager", label: "Manager" },
];

export default async function DepartmentsPage() {
  const user = await requireUser();
  const writable = canWrite(user.role);
  const departments = await listDepartments();

  const columns: Column<DepartmentRecord>[] = [
    { header: "Department", render: (row) => row.name },
    { header: "Manager", render: (row) => row.manager || "—" },
    { header: "Assets", render: (row) => String(row.assets) },
    { header: "Users", render: (row) => String(row.users) },
    {
      header: "Action",
      render: (row) =>
        writable ? (
          <div className="rowactions">
            <Link className="btn btn-light" href={`/departments/${row.id}/edit`}>
              Edit
            </Link>
            <form action={deleteDepartmentAction}>
              <input type="hidden" name="id" value={row.id} />
              <button className="btn btn-light" type="submit">
                Delete
              </button>
            </form>
          </div>
        ) : null,
    },
  ];

  return (
    <>
      <PageHeader title="Departments" subtitle="Departments that own ICT assets" />

      {writable ? (
        <Panel title="Add a Department">
          <RecordForm
            action={createDepartmentAction}
            fields={FIELDS}
            submitLabel="Add Department"
            resetAfterSuccess
          />
        </Panel>
      ) : null}

      <Panel title={`${departments.length} department${departments.length === 1 ? "" : "s"}`}>
        <DataTable
          columns={columns}
          rows={departments}
          rowKey={(row) => String(row.id)}
          emptyMessage="No departments added yet."
        />
      </Panel>
    </>
  );
}
