import { BarcodeTool } from "@/components/BarcodeTool";
import { PageHeader } from "@/components/PageHeader";
import { requireUser } from "@/lib/auth/guards";
import { getNextAssetCode, getSettings, listAssetOptions } from "@/lib/store";

export default async function BarcodePage() {
  await requireUser();

  const [assetCode, options, settings] = await Promise.all([
    getNextAssetCode(),
    listAssetOptions(),
    getSettings(),
  ]);

  const codes = options.map((option) => option.label.split(" · ")[0]);

  return (
    <>
      <PageHeader
        title="Barcode / QR Code"
        subtitle="Generate and print asset identification labels"
      />
      <div className="grid2">
        <BarcodeTool
          defaultCode={assetCode}
          codes={codes}
          organization={settings.organizationName}
        />
      </div>
    </>
  );
}
