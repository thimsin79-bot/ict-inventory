import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { RecordForm, type FieldDef } from "@/components/RecordForm";
import { updateDepartmentAction } from "@/lib/store/reference-actions";
import { requireWrite } from "@/lib/auth/guards";
import { getDepartmentById } from "@/lib/store";

export default async function EditDepartmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireWrite("/departments");
  const { id } = await params;
  const departmentId = Number(id);

  if (!Number.isFinite(departmentId)) {
    notFound();
  }

  const department = await getDepartmentById(departmentId);

  if (!department) {
    notFound();
  }

  const fields: FieldDef[] = [
    { name: "name", label: "Department Name", required: true, defaultValue: department.name },
    { name: "manager", label: "Manager", defaultValue: department.manager },
  ];

  return (
    <>
      <PageHeader
        title={`Edit ${department.name}`}
        subtitle="Update this department"
        action={
          <Link className="btn btn-light" href="/departments">
            ← Back
          </Link>
        }
      />
      <Panel title="Department Details">
        <RecordForm
          action={updateDepartmentAction.bind(null, department.id)}
          fields={fields}
          submitLabel="Save Changes"
        />
      </Panel>
    </>
  );
}
