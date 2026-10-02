import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { RecordForm, type FieldDef } from "@/components/RecordForm";
import { requireAdministrator } from "@/lib/auth/guards";
import { getUserById, listDepartments } from "@/lib/store";
import { updateUserAction } from "@/lib/store/reference-actions";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdministrator();
  const { id } = await params;
  const userId = Number(id);

  if (!Number.isFinite(userId)) {
    notFound();
  }

  const [user, departments] = await Promise.all([getUserById(userId), listDepartments()]);

  if (!user) {
    notFound();
  }

  const fields: FieldDef[] = [
    { name: "name", label: "Full Name", required: true, defaultValue: user.name },
    { name: "email", label: "Email", type: "email", required: true, defaultValue: user.email },
    {
      name: "password",
      label: "New Password",
      type: "password",
      hint: "Leave blank to keep the current password.",
    },
    {
      name: "role",
      label: "Role",
      type: "select",
      defaultValue: user.role,
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
      defaultValue: user.departmentId ?? "",
      options: [
        { value: "", label: "— No department —" },
        ...departments.map((department) => ({
          value: String(department.id),
          label: department.name,
        })),
      ],
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      defaultValue: user.status,
      options: [
        { value: "Active", label: "Active" },
        { value: "Inactive", label: "Inactive" },
      ],
    },
  ];

  return (
    <>
      <PageHeader
        title={`Edit ${user.name}`}
        subtitle="Update this account"
        action={
          <Link className="btn btn-light" href="/users">
            ← Back
          </Link>
        }
      />
      <Panel title="User Details">
        <RecordForm
          action={updateUserAction.bind(null, user.id)}
          fields={fields}
          submitLabel="Save Changes"
        />
      </Panel>
    </>
  );
}
