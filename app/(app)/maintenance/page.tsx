import { Badge } from "@/components/Badge";
import { DataTable } from "@/components/DataTable";
import type { Column } from "@/components/DataTable";
import { KpiGrid } from "@/components/KpiGrid";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { formatCurrency } from "@/lib/format";
import { getMaintenanceSummary, listMaintenance } from "@/lib/store";
import type { MaintenanceRecord } from "@/lib/types";

const COLUMNS: Column<MaintenanceRecord>[] = [
  { header: "Asset", render: (row) => row.code },
  { header: "Problem", render: (row) => row.problem },
  { header: "Date", render: (row) => row.date },
  { header: "Technician", render: (row) => row.technician },
  { header: "Cost", render: (row) => formatCurrency(row.cost) },
  { header: "Status", render: (row) => <Badge status={row.status} /> },
];

export default async function MaintenancePage() {
  const [summary, records] = await Promise.all([
    getMaintenanceSummary(),
    listMaintenance(),
  ]);

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
      <KpiGrid
        stats={[
          { label: "Open", value: String(summary.open) },
          { label: "In Progress", value: String(summary.inProgress) },
          { label: "Completed", value: String(summary.completed) },
          { label: "Total Cost", value: formatCurrency(summary.totalCost) },
        ]}
      />
      <Panel>
        <DataTable
          columns={COLUMNS}
          rows={records}
          rowKey={(row) => `${row.code}-${row.date}`}
          emptyMessage="No maintenance records yet."
        />
      </Panel>
    </>
  );
}
