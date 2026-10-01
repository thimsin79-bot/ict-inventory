import { PageHeader } from "@/components/PageHeader";
import { Reports } from "@/components/Reports";

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Reports & Analytics"
        subtitle="Generate inventory and management reports"
      />
      <Reports />
    </>
  );
}
