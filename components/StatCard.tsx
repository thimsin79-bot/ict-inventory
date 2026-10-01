const FOOT_COLOR = {
  default: undefined,
  red: "var(--red)",
  orange: "var(--orange)",
} as const;

export type Tone = keyof typeof FOOT_COLOR;

export function StatCard({
  label,
  value,
  foot,
  tone = "default",
}: {
  label: string;
  value: string;
  foot: string;
  tone?: Tone;
}) {
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
