export interface Kpi {
  label: string;
  value: string;
  icon?: string;
}

export function KpiGrid({ stats }: { stats: Kpi[] }) {
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
