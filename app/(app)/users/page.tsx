import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { USERS } from "@/lib/data";

export default function UsersPage() {
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
        <DataTable table={USERS} />
      </Panel>
    </>
  );
}
