import { Badge } from "@/components/Badge";
import { DataTable } from "@/components/DataTable";
import type { Column } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { listUsers } from "@/lib/store";
import type { UserRecord } from "@/lib/types";

const COLUMNS: Column<UserRecord>[] = [
  { header: "Name", render: (row) => row.name },
  { header: "Email", render: (row) => row.email },
  { header: "Role", render: (row) => row.role },
  { header: "Department", render: (row) => row.department },
  { header: "Status", render: (row) => <Badge status={row.status} /> },
];

export default async function UsersPage() {
  const users = await listUsers();

  return (
    <>
      <PageHeader
        title="Users & Roles"
        subtitle="Manage system users and permissions"
        action={
          <button className="btn btn-primary" type="button">
            ＋ Add User
          </button>
        }
      />
      <Panel>
        <DataTable
          columns={COLUMNS}
          rows={users}
          rowKey={(row) => row.email}
          emptyMessage="No users added yet."
        />
      </Panel>
    </>
  );
}
