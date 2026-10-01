import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { TRANSFERS } from "@/lib/data";

export default function TransfersPage() {
  return (
    <>
      <PageHeader
        title="Asset Transfers"
        subtitle="Move assets between locations and users"
        action={
          <button className="btn btn-primary" type="button">
            ＋ New Transfer
          </button>
        }
      />
      <Panel>
        <DataTable table={TRANSFERS} />
      </Panel>
    </>
  );
}
