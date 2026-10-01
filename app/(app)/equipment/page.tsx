import { KpiGrid } from "@/components/KpiGrid";
import { PageHeader } from "@/components/PageHeader";
import { EQUIPMENT_STATS } from "@/lib/data";

export default function EquipmentPage() {
  return (
    <>
      <PageHeader title="Equipment" subtitle="ICT equipment categories" />
      <KpiGrid stats={EQUIPMENT_STATS} />
    </>
  );
}
