import Link from "next/link";

import { AddAssetForm } from "@/components/AddAssetForm";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { NEXT_ASSET_CODE } from "@/lib/data";

export default function AddAssetPage() {
  return (
    <>
      <PageHeader
        title="Add New Asset"
        subtitle="Register a new ICT asset"
        action={
          <Link className="btn btn-light" href="/assets">
            ← Back
          </Link>
        }
      />
      <Panel>
        <AddAssetForm assetCode={NEXT_ASSET_CODE} />
      </Panel>
    </>
  );
}
