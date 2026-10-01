import { BarcodeTool } from "@/components/BarcodeTool";
import { PageHeader } from "@/components/PageHeader";
import { getNextAssetCode } from "@/lib/store";

export default async function BarcodePage() {
  const assetCode = await getNextAssetCode();

  return (
    <>
      <PageHeader
        title="Barcode / QR Code"
        subtitle="Generate and print asset identification labels"
      />
      <div className="grid2">
        <BarcodeTool defaultCode={assetCode} />
      </div>
    </>
  );
}
