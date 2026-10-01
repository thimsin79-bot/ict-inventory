import type { MiniStatData } from "@/lib/types";

export function KpiGrid({ stats }: { stats: MiniStatData[] }) {
  return (
    <div className="kpis">
      {stats.map((stat) => (
        <div className="mini" key={stat.label}>
          {stat.icon ? <span aria-hidden="true">{stat.icon}</span> : null}
          <span className="stat-label">{stat.label}</span>
          <strong>{stat.value}</strong>
        </div>
      ))}
    </div>
  );
}
