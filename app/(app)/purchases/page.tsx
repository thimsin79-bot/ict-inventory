import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { PURCHASES } from "@/lib/data";

export default function PurchasesPage() {
  return (
    <>
      <PageHeader
        title="Purchasing"
        subtitle="Purchase records, invoices and procurement history"
        action={
          <button className="btn btn-primary" type="button">
            ＋ New Purchase
          </button>
        }
      />
      <Panel>
        <DataTable table={PURCHASES} />
      </Panel>
    </>
  );
}
