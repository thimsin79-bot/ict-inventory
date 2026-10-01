import type { Asset, AssetFormOptions, AssetSummary, Breakdown } from "@/lib/types";

function unique(values: string[]) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

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

export const SEED_ASSETS: Asset[] = [
  {
    code: "ICT-00001",
    category: "Desktop",
    brand: "Dell",
    model: "OptiPlex 7060",
    serial: "CPJZWX1",
    location: "Main Office",
    department: "Administration",
    status: "Active",
  },
  {
    code: "ICT-00002",
    category: "Laptop",
    brand: "HP",
    model: "ProBook 450",
    serial: "5CD12345",
    location: "Computer Lab",
    department: "ICT",
    status: "Assigned",
  },
  {
    code: "ICT-00003",
    category: "Projector",
    brand: "Epson",
    model: "EB-X06",
    serial: "X1234567",
    location: "Room 101",
    department: "Academic",
    status: "Maintenance",
  },
  {
    code: "ICT-00004",
    category: "Printer",
    brand: "HP",
    model: "LaserJet Pro",
    serial: "VNC98765",
    location: "Finance",
    department: "Finance",
    status: "Broken",
  },
  {
    code: "ICT-00005",
    category: "Monitor",
    brand: "Dell",
    model: "P2419H",
    serial: "CN-123456",
    location: "Computer Lab",
    department: "ICT",
    status: "Active",
  },
];

export async function listAssets(): Promise<Asset[]> {
  return SEED_ASSETS;
}

export async function getAssetSummary(): Promise<AssetSummary> {
  const assets = await listAssets();

  return {
    total: assets.length,
    active: assets.filter((asset) => asset.status === "Active").length,
    assigned: assets.filter((asset) => asset.status === "Assigned").length,
    broken: assets.filter((asset) => asset.status === "Broken").length,
    inMaintenance: assets.filter((asset) => asset.status === "Maintenance").length,
    totalValue: assets.reduce((sum, asset) => sum + (asset.purchasePrice ?? 0), 0),
  };
}

export async function getAssetFormOptions(): Promise<AssetFormOptions> {
  const assets = await listAssets();

  return {
    categories: unique(assets.map((asset) => asset.category)),
    locations: unique(assets.map((asset) => asset.location)),
    departments: unique(assets.map((asset) => asset.department)),
  };
}

export async function getCategoryBreakdown(): Promise<Breakdown[]> {
  return toBreakdown(await listAssets(), (asset) => asset.category);
}

export async function getLocationBreakdown(): Promise<Breakdown[]> {
  return toBreakdown(await listAssets(), (asset) => asset.location);
}

export async function getNextAssetCode(): Promise<string> {
  const assets = await listAssets();

  const highest = assets.reduce((max, asset) => {
    const suffix = Number.parseInt(asset.code.replace(/\D+/g, ""), 10);
    return Number.isFinite(suffix) && suffix > max ? suffix : max;
  }, 0);

  const prefix = assets[0]?.code.replace(/\d+$/, "") ?? "ICT-";

  return `${prefix}${String(highest + 1).padStart(5, "0")}`;
}
