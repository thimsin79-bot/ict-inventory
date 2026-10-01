import { DataTable } from "@/components/DataTable";
import { KpiGrid } from "@/components/KpiGrid";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { MAINTENANCE_RECORDS, MAINTENANCE_STATS } from "@/lib/data";

export default function MaintenancePage() {
  return (
    <>
      <PageHeader
        title="Maintenance"
        subtitle="Maintenance requests and service history"
        action={
          <button className="btn btn-primary" type="button">
            ＋ New Maintenance
          </button>
        }
      />
      <KpiGrid stats={MAINTENANCE_STATS} />
      <Panel>
        <DataTable table={MAINTENANCE_RECORDS} />
      </Panel>
    </>
  );
}
