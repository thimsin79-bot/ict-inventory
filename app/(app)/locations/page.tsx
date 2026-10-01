import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { LOCATIONS } from "@/lib/data";

export default function LocationsPage() {
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
        <DataTable table={LOCATIONS} />
      </Panel>
    </>
  );
}
