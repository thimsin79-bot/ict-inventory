import Link from "next/link";

import { DataTable } from "@/components/DataTable";
import type { Column } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { RecordForm, type FieldDef } from "@/components/RecordForm";
import { requireUser } from "@/lib/auth/guards";
import { canWrite } from "@/lib/permissions";
import { listLocations } from "@/lib/store";
import { createLocationAction, deleteLocationAction } from "@/lib/store/reference-actions";
import type { LocationRecord } from "@/lib/types";

const FIELDS: FieldDef[] = [
  { name: "name", label: "Location Name", required: true, autoFocus: true },
  { name: "building", label: "Building" },
  { name: "room", label: "Room" },
];

export default async function LocationsPage() {
  const user = await requireUser();
  const writable = canWrite(user.role);
  const locations = await listLocations();

  const columns: Column<LocationRecord>[] = [
    { header: "Location", render: (row) => row.name },
    { header: "Building", render: (row) => row.building || "—" },
    { header: "Room", render: (row) => row.room || "—" },
    { header: "Assets", render: (row) => String(row.assets) },
    {
      header: "Action",
      render: (row) =>
        writable ? (
          <div className="rowactions">
            <Link className="btn btn-light" href={`/locations/${row.id}/edit`}>
              Edit
            </Link>
            <form action={deleteLocationAction}>
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
      <PageHeader title="Locations" subtitle="Buildings, rooms and asset locations" />

      {writable ? (
        <Panel title="Add a Location">
          <RecordForm
            action={createLocationAction}
            fields={FIELDS}
            submitLabel="Add Location"
            resetAfterSuccess
          />
        </Panel>
      ) : null}

      <Panel title={`${locations.length} location${locations.length === 1 ? "" : "s"}`}>
        <DataTable
          columns={columns}
          rows={locations}
          rowKey={(row) => String(row.id)}
          emptyMessage="No locations added yet."
        />
      </Panel>
    </>
  );
}
