import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { BROKEN_RECORDS } from "@/lib/data";

export default function BrokenPage() {
  return (
    <>
      <PageHeader
        title="Broken / Damaged Items"
        subtitle="Manage damaged and non-working ICT assets"
        action={
          <button className="btn btn-primary" type="button">
            ＋ Report Broken
          </button>
        }
      />
      <Panel>
        <DataTable table={BROKEN_RECORDS} />
      </Panel>
    </>
  );
}
