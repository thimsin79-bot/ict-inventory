import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { HISTORY } from "@/lib/data";

export default function HistoryPage() {
  return (
    <>
      <PageHeader
        title="Historical Inventory"
        subtitle="Imported historical records from 2013–2018 and asset history"
      />
      <Panel>
        <DataTable table={HISTORY} />
      </Panel>
    </>
  );
}
