import { DataTable } from "@/components/DataTable";
import type { Column } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { listLocations } from "@/lib/store";
import type { LocationRecord } from "@/lib/types";

const COLUMNS: Column<LocationRecord>[] = [
  { header: "Location", render: (row) => row.name },
  { header: "Building", render: (row) => row.building },
  { header: "Room", render: (row) => row.room },
  { header: "Assets", render: (row) => String(row.assets) },
];

export default async function LocationsPage() {
  const locations = await listLocations();

  return (
    <>
      <PageHeader
        title="Locations"
        subtitle="Buildings, rooms and asset locations"
        action={
          <button className="btn btn-primary" type="button">
            ＋ Add Location
          </button>
        }
      />
      <Panel>
        <DataTable
          columns={COLUMNS}
          rows={locations}
          rowKey={(row) => row.name}
          emptyMessage="No locations added yet."
        />
      </Panel>
    </>
  );
}
