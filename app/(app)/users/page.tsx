import Link from "next/link";

import { DataTable } from "@/components/DataTable";
import type { Column } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { RecordForm, type FieldDef } from "@/components/RecordForm";
import { requireAdministrator } from "@/lib/auth/guards";
import { ROLE_DESCRIPTIONS } from "@/lib/permissions";
import { listDepartments, listUsers } from "@/lib/store";
import { createUserAction, deleteUserAction } from "@/lib/store/reference-actions";
import type { UserRecord } from "@/lib/types";

export default async function UsersPage() {
  const current = await requireAdministrator();
  const [users, departments] = await Promise.all([listUsers(), listDepartments()]);

  const departmentOptions = [
    { value: "", label: "— No department —" },
    ...departments.map((department) => ({
      value: String(department.id),
      label: department.name,
    })),
  ];

  const fields: FieldDef[] = [
    { name: "name", label: "Full Name", required: true, autoFocus: true },
    { name: "email", label: "Email", type: "email", required: true },
    {
      name: "password",
      label: "Password",
      type: "password",
      required: true,
      hint: "At least 8 characters.",
    },
    {
      name: "role",
      label: "Role",
      type: "select",
      defaultValue: "Viewer",
      options: [
        { value: "Administrator", label: "Administrator" },
        { value: "ICT Staff", label: "ICT Staff" },
        { value: "Viewer", label: "Viewer" },
      ],
    },
    {
      name: "departmentId",
      label: "Department",
      type: "select",
      options: departmentOptions,
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      defaultValue: "Active",
      options: [
        { value: "Active", label: "Active" },
        { value: "Inactive", label: "Inactive" },
      ],
    },
  ];

  const columns: Column<UserRecord>[] = [
    { header: "Name", render: (row) => row.name },
    { header: "Email", render: (row) => row.email },
    { header: "Role", render: (row) => row.role },
    { header: "Department", render: (row) => row.department || "—" },
    { header: "Status", render: (row) => row.status },
    {
      header: "Action",
      render: (row) => (
        <div className="rowactions">
          <Link className="btn btn-light" href={`/users/${row.id}/edit`}>
            Edit
          </Link>
          {row.id === current.id ? (
            <span className="hint">That&rsquo;s you</span>
          ) : (
            <form action={deleteUserAction}>
              <input type="hidden" name="id" value={row.id} />
              <button className="btn btn-light" type="submit">
                Delete
              </button>
            </form>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Users & Roles" subtitle="Accounts, roles and access control" />

      <div className="panel">
        <div className="panel-head">
          <h2>Role Permissions</h2>
        </div>
        <div className="panel-body">
          <ul className="plain-list">
            {Object.entries(ROLE_DESCRIPTIONS).map(([role, description]) => (
              <li key={role}>
                <b>{role}</b> — {description}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Panel title="Add a User">
        <RecordForm
          action={createUserAction}
          fields={fields}
          submitLabel="Add User"
          resetAfterSuccess
        />
      </Panel>

      <Panel title={`${users.length} user${users.length === 1 ? "" : "s"}`}>
        <DataTable
          columns={columns}
          rows={users}
          rowKey={(row) => String(row.id)}
          emptyMessage="No users yet."
        />
      </Panel>
    </>
  );
}
