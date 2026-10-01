import { KpiGrid } from "@/components/KpiGrid";
import { PageHeader } from "@/components/PageHeader";
import { CATEGORY_ICONS } from "@/lib/navigation";
import { getCategoryBreakdown } from "@/lib/store";

export default async function EquipmentPage() {
  const categories = await getCategoryBreakdown();

  return (
    <>
      <PageHeader title="Equipment" subtitle="ICT equipment categories" />
      {categories.length === 0 ? (
        <p className="empty">No equipment registered yet.</p>
      ) : (
        <KpiGrid
          stats={categories.map((category) => ({
            label: category.label,
            value: String(category.value),
            icon: CATEGORY_ICONS[category.label],
          }))}
        />
      )}
    </>
  );
}
