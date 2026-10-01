import { KpiGrid } from "@/components/KpiGrid";
import { PageHeader } from "@/components/PageHeader";
import { getAuditSummary } from "@/lib/store";

export default async function AuditPage() {
  const summary = await getAuditSummary();

  return (
    <>
      <PageHeader
        title="Asset Audit"
        subtitle="Verify physical assets against the register"
        action={
          <button className="btn btn-primary" type="button">
            ＋ Start Audit
          </button>
        }
      />
      <KpiGrid
        stats={[
          { label: "Assets to Verify", value: String(summary.toVerify) },
          { label: "Verified", value: String(summary.verified) },
          { label: "Missing", value: String(summary.missing) },
          { label: "Pending", value: String(summary.pending) },
        ]}
      />
    </>
  );
}
