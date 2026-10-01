import { KpiGrid } from "@/components/KpiGrid";
import { PageHeader } from "@/components/PageHeader";
import { AUDIT_STATS } from "@/lib/data";

export default function AuditPage() {
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
      <KpiGrid stats={AUDIT_STATS} />
    </>
  );
}
