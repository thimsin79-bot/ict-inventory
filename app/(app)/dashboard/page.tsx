import Link from "next/link";

import { BarList } from "@/components/BarList";
import { DataTable } from "@/components/DataTable";
import type { Column } from "@/components/DataTable";
import { LiveRefresh } from "@/components/LiveRefresh";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { StatCard } from "@/components/StatCard";
import { formatPercent } from "@/lib/format";
import { money } from "@/lib/format-server";
import {
  getAssetSummary,
  getCategoryBreakdown,
  getLocationBreakdown,
  listRecentActivity,
} from "@/lib/store";
import type { ActivityRecord } from "@/lib/types";
import { Badge } from "@/components/Badge";

const ACTIVITY_COLUMNS: Column<ActivityRecord>[] = [
  { header: "Asset Code", render: (row) => row.code },
  { header: "Asset", render: (row) => row.asset },
  { header: "Action", render: (row) => row.action },
  { header: "User", render: (row) => row.user },
  { header: "Date", render: (row) => row.date },
  { header: "Status", render: (row) => <Badge status={row.status} /> },
];

export default async function DashboardPage() {
  const [summary, categories, locations, activity] = await Promise.all([
    getAssetSummary(),
    getCategoryBreakdown(),
    getLocationBreakdown(),
    listRecentActivity(),
  ]);

  const activeTotal = summary.active + summary.assigned;
  const totalValue = await money(summary.totalValue);

  return (
    <>
      <LiveRefresh
        topics={["assets", "assignments", "transfers", "maintenance", "broken", "audit"]}
      />
      <PageHeader
        title="ICT Inventory Dashboard"
        subtitle="Overview of ICT assets and inventory activities"
        action={
          <Link className="btn btn-primary" href="/assets/new">
            ＋ Add Asset
          </Link>
        }
      />
      <div className="cards">
        <StatCard
          label="TOTAL ASSETS"
          value={String(summary.total)}
          foot="In the asset register"
        />
        <StatCard
          label="ACTIVE ASSETS"
          value={String(activeTotal)}
          foot={`${formatPercent(activeTotal, summary.total)} of inventory`}
        />
        <StatCard
          label="BROKEN / DAMAGED"
          value={String(summary.broken)}
          foot="Needs attention"
          tone="red"
        />
        <StatCard
          label="MAINTENANCE"
          value={String(summary.inMaintenance)}
          foot="Open records"
          tone="orange"
        />
        <StatCard
          label="TOTAL VALUE"
          value={totalValue}
          foot="Asset purchase value"
        />
      </div>
      <div className="grid2">
        <Panel title="Assets by Category">
          <BarList data={categories} />
        </Panel>
        <Panel title="Assets by Location">
          <BarList data={locations} />
        </Panel>
      </div>
      <Panel title="Recent Asset Activity">
        <DataTable
          columns={ACTIVITY_COLUMNS}
          rows={activity}
          rowKey={(row) => `${row.code}-${row.date}`}
          emptyMessage="No activity recorded yet."
        />
      </Panel>
    </>
  );
}
