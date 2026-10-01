import type {
  AssetCondition,
  Availability,
  NavSection,
} from "./types";

export const NAV: NavSection[] = [
  {
    title: "Inventory",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: "🏠" },
      { href: "/assets", label: "All Assets", icon: "📦" },
      { href: "/assets/new", label: "Add Asset", icon: "➕" },
      { href: "/equipment", label: "Equipment", icon: "🖥" },
      { href: "/assignments", label: "Assignments", icon: "👥" },
      { href: "/transfers", label: "Transfers", icon: "🔄" },
    ],
  },
  {
    title: "Operations",
    items: [
      { href: "/maintenance", label: "Maintenance", icon: "🔧" },
      { href: "/broken", label: "Broken / Damaged", icon: "⚠️" },
      { href: "/audit", label: "Asset Audit", icon: "🔍" },
      { href: "/barcode", label: "Barcode / QR", icon: "📱" },
    ],
  },
  {
    title: "Management",
    items: [
      { href: "/locations", label: "Locations", icon: "🏢" },
      { href: "/departments", label: "Departments", icon: "🏫" },
      { href: "/suppliers", label: "Suppliers", icon: "🏭" },
      { href: "/purchases", label: "Purchasing", icon: "🛒" },
      { href: "/history", label: "History", icon: "📚" },
    ],
  },
  {
    title: "Reports & System",
    items: [
      { href: "/reports", label: "Reports", icon: "📊" },
      { href: "/users", label: "Users & Roles", icon: "👤" },
      { href: "/settings", label: "Settings", icon: "⚙️" },
    ],
  },
];

export const CURRENT_USER = {
  name: "ICT Administrator",
  role: "Administrator",
  initials: "IA",
};

export const CATEGORY_ICONS: Record<string, string> = {
  Desktop: "🖥️",
  Laptop: "💻",
  Printer: "🖨️",
  Network: "📡",
  Monitor: "🖵",
  Projector: "📽️",
  "Network Equipment": "🌐",
};

export const AVAILABILITY_OPTIONS: Availability[] = ["Available", "Assigned", "Spare"];

export const CONDITION_OPTIONS: AssetCondition[] = ["Good", "Fair", "Poor"];

export const SUPPLIER_OPTIONS: string[] = [];

export const CURRENCY_OPTIONS = ["USD", "KHR"];

export const DATE_FORMAT_OPTIONS = ["dd-mmm-yyyy", "yyyy-mm-dd"];

export const ORGANIZATION_NAME = "";

export const ASSET_CODE_PREFIX = "";
