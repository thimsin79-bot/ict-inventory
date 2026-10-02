import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { RecordForm, type FieldDef } from "@/components/RecordForm";
import { updateLocationAction } from "@/lib/store/reference-actions";
import { requireWrite } from "@/lib/auth/guards";
import { getLocationById } from "@/lib/store";

export default async function EditLocationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireWrite("/locations");
  const { id } = await params;
  const locationId = Number(id);

  if (!Number.isFinite(locationId)) {
    notFound();
  }

  const location = await getLocationById(locationId);

  if (!location) {
    notFound();
  }

  const fields: FieldDef[] = [
    { name: "name", label: "Location Name", required: true, defaultValue: location.name },
    { name: "building", label: "Building", defaultValue: location.building },
    { name: "room", label: "Room", defaultValue: location.room },
  ];

  return (
    <>
      <PageHeader
        title={`Edit ${location.name}`}
        subtitle="Update this location"
        action={
          <Link className="btn btn-light" href="/locations">
            ← Back
          </Link>
        }
      />
      <Panel title="Location Details">
        <RecordForm
          action={updateLocationAction.bind(null, location.id)}
          fields={fields}
          submitLabel="Save Changes"
        />
      </Panel>
    </>
  );
}
