import type { StatCardData, Tone } from "@/lib/types";

const FOOT_COLOR: Record<Tone, string | undefined> = {
  default: undefined,
  red: "var(--red)",
  orange: "var(--orange)",
};

export function StatCard({ label, value, foot, tone }: StatCardData) {
  return (
    <div className="card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-foot" style={{ color: FOOT_COLOR[tone] }}>
        {foot}
      </div>
    </div>
  );
}
