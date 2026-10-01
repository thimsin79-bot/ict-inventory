import { toneFor } from "@/lib/tone";

export function Badge({ status }: { status: string }) {
  return <span className={`badge ${toneFor(status)}-b`}>{status}</span>;
}
