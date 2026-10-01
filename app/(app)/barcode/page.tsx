import { BarcodeTool } from "@/components/BarcodeTool";
import { PageHeader } from "@/components/PageHeader";

export default function BarcodePage() {
  return (
    <>
      <PageHeader
        title="Barcode / QR Code"
        subtitle="Generate and print asset identification labels"
      />
      <div className="grid2">
        <BarcodeTool />
      </div>
    </>
  );
}
