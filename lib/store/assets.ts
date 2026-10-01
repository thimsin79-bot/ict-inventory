import type { Asset, AssetSummary, Breakdown } from "@/lib/types";

function toBreakdown(assets: Asset[], key: (asset: Asset) => string): Breakdown[] {
  const counts = new Map<string, number>();

  for (const asset of assets) {
    const label = key(asset);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  const total = assets.length;

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({
      label,
      value,
      percent: total === 0 ? 0 : Math.round((value / total) * 100),
    }));
}

export async function listAssets(): Promise<Asset[]> {
  return [];
}

export async function getAssetSummary(): Promise<AssetSummary> {
  const assets = await listAssets();

  return {
    total: assets.length,
    active: assets.filter((asset) => asset.status === "Active").length,
    assigned: assets.filter((asset) => asset.status === "Assigned").length,
    broken: assets.filter((asset) => asset.status === "Broken").length,
    inMaintenance: assets.filter((asset) => asset.status === "Maintenance").length,
    totalValue: assets.reduce((sum, asset) => sum + asset.purchasePrice, 0),
  };
}

export async function getCategoryBreakdown(): Promise<Breakdown[]> {
  return toBreakdown(await listAssets(), (asset) => asset.category);
}

export async function getLocationBreakdown(): Promise<Breakdown[]> {
  return toBreakdown(await listAssets(), (asset) => asset.location);
}

export async function getNextAssetCode(): Promise<string> {
  return "";
}
