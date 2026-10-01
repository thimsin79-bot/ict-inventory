import type { Breakdown } from "@/lib/types";

export function BarList({
  data,
  emptyMessage = "No data yet.",
}: {
  data: Breakdown[];
  emptyMessage?: string;
}) {
  if (data.length === 0) {
    return <p className="empty">{emptyMessage}</p>;
  }

  return (
    <div>
      {data.map((datum) => (
        <div className="barrow" key={datum.label}>
          <span>{datum.label}</span>
          <div
            className="bar"
            role="img"
            aria-label={`${datum.label}: ${datum.value} assets`}
          >
            <i style={{ width: `${datum.percent}%` }} />
          </div>
          <b>{datum.value}</b>
        </div>
      ))}
    </div>
  );
}
