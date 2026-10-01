import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { SUPPLIERS_TABLE } from "@/lib/data";

export default function SuppliersPage() {
  return (
    <>
      <PageHeader
        title="Suppliers"
        subtitle="Supplier and vendor management"
        action={
          <button className="btn btn-primary" type="button">
            ＋ Add Supplier
          </button>
        }
      />
      <Panel>
        <DataTable table={SUPPLIERS_TABLE} />
      </Panel>
    </>
  );
}
