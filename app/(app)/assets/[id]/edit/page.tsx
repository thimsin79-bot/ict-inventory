import Link from "next/link";
import { notFound } from "next/navigation";

import { AssetForm } from "@/components/AssetForm";
import { PageHeader } from "@/components/PageHeader";
import { updateAssetAction } from "@/app/(app)/assets/actions";
import { requireWrite } from "@/lib/auth/guards";
import { getAssetById, getAssetFormOptions } from "@/lib/store/assets";

export default async function EditAssetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireWrite("/assets");

  const { id } = await params;
  const assetId = Number(id);

  if (!Number.isFinite(assetId)) {
    notFound();
  }

  const [asset, options] = await Promise.all([
    getAssetById(assetId),
    getAssetFormOptions(),
  ]);

  if (!asset) {
    notFound();
  }

  // The action is bound here so the client form stays a plain FormAction and
  // never needs to know the asset id.
  const action = updateAssetAction.bind(null, asset.id);

  return (
    <>
      <PageHeader
        title={`Edit ${asset.code}`}
        subtitle="Update the asset's details, status and location"
        action={
          <Link className="btn btn-light" href={`/assets/${asset.id}`}>
            ← Back to Asset
          </Link>
        }
      />
      <div className="panel">
        <div className="panel-head">
          <h2>Asset Details</h2>
        </div>
        <div className="panel-body">
          <AssetForm
            action={action}
            options={options}
            codeLocked
            values={{
              code: asset.code,
              category: asset.category,
              brand: asset.brand,
              model: asset.model,
              serial: asset.serial,
              locationId: asset.locationId,
              departmentId: asset.departmentId,
              supplierId: asset.supplierId,
              status: asset.status,
              condition: asset.condition,
              availability: asset.availability,
              purchasePrice: asset.purchasePrice ?? null,
              purchaseDate: asset.purchaseDate ?? null,
              remarks: asset.remarks,
            }}
            submitLabel="Save Changes"
          />
        </div>
      </div>
    </>
  );
}
