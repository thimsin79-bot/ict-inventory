import Link from "next/link";

import { BarList } from "@/components/BarList";
import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { StatCard } from "@/components/StatCard";
import {
  ASSETS_BY_CATEGORY,
  ASSETS_BY_LOCATION,
  DASHBOARD_STATS,
  RECENT_ACTIVITY,
} from "@/lib/data";

export default function DashboardPage() {
  return (
    <>
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
        {DASHBOARD_STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
      <div className="grid2">
        <Panel title="Assets by Category">
          <BarList data={ASSETS_BY_CATEGORY} />
        </Panel>
        <Panel title="Assets by Location">
          <BarList data={ASSETS_BY_LOCATION} />
        </Panel>
      </div>
      <Panel title="Recent Asset Activity">
        <DataTable table={RECENT_ACTIVITY} />
      </Panel>
    </>
  );
}
