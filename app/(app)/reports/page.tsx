import { PageHeader } from "@/components/PageHeader";
import { Reports } from "@/components/Reports";
import { listReports } from "@/lib/store";

export default async function ReportsPage() {
  const reports = await listReports();

  return (
    <>
      <PageHeader
        title="Reports & Analytics"
        subtitle="Generate inventory and management reports"
      />
      <Reports reports={reports} />
    </>
  );
}
