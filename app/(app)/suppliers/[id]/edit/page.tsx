import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { RecordForm, type FieldDef } from "@/components/RecordForm";
import { updateSupplierAction } from "@/lib/store/reference-actions";
import { requireWrite } from "@/lib/auth/guards";
import { getSupplierById } from "@/lib/store";

export default async function EditSupplierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireWrite("/suppliers");
  const { id } = await params;
  const supplierId = Number(id);

  if (!Number.isFinite(supplierId)) {
    notFound();
  }

  const supplier = await getSupplierById(supplierId);

  if (!supplier) {
    notFound();
  }

  const fields: FieldDef[] = [
    { name: "name", label: "Supplier Name", required: true, defaultValue: supplier.name },
    { name: "contact", label: "Contact Person", defaultValue: supplier.contact },
    { name: "phone", label: "Phone", defaultValue: supplier.phone },
    { name: "email", label: "Email", type: "email", defaultValue: supplier.email },
  ];

  return (
    <>
      <PageHeader
        title={`Edit ${supplier.name}`}
        subtitle="Update this supplier"
        action={
          <Link className="btn btn-light" href="/suppliers">
            ← Back
          </Link>
        }
      />
      <Panel title="Supplier Details">
        <RecordForm
          action={updateSupplierAction.bind(null, supplier.id)}
          fields={fields}
          submitLabel="Save Changes"
        />
      </Panel>
    </>
  );
}
