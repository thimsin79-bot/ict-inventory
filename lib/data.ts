import type {
  Asset,
  BarDatum,
  MiniStatData,
  NavSection,
  ReportDefinition,
  SimpleTable,
  StatCardData,
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

export const DASHBOARD_STATS: StatCardData[] = [
  { label: "TOTAL ASSETS", value: "583", foot: "↑ 12 this year", tone: "default" },
  { label: "ACTIVE ASSETS", value: "492", foot: "84.4% of inventory", tone: "default" },
  { label: "BROKEN / DAMAGED", value: "48", foot: "Needs attention", tone: "red" },
  { label: "MAINTENANCE", value: "15", foot: "Open records", tone: "orange" },
  { label: "TOTAL VALUE", value: "$186K", foot: "Asset purchase value", tone: "default" },
];

export const ASSETS_BY_CATEGORY: BarDatum[] = [
  { label: "Desktop", value: 152, percent: 72 },
  { label: "Laptop", value: 121, percent: 58 },
  { label: "Monitor", value: 94, percent: 45 },
  { label: "Printer", value: 65, percent: 31 },
  { label: "Network", value: 48, percent: 23 },
];

export const ASSETS_BY_LOCATION: BarDatum[] = [
  { label: "Main Office", value: 173, percent: 82 },
  { label: "Computer Lab", value: 146, percent: 69 },
  { label: "Classrooms", value: 116, percent: 55 },
  { label: "Library", value: 57, percent: 27 },
];

export const RECENT_ACTIVITY: SimpleTable = {
  columns: ["Asset Code", "Asset", "Action", "User", "Date", "Status"],
  rows: [
    [
      "ICT-00001",
      "Dell Desktop",
      "Assigned",
      "Admin Office",
      "01-Oct-2026",
      { text: "Assigned", tone: "assigned" },
    ],
    [
      "ICT-00002",
      "HP Laptop",
      "Maintenance",
      "ICT Staff",
      "30-Sep-2026",
      { text: "Maintenance", tone: "maint" },
    ],
    [
      "ICT-00003",
      "Epson Projector",
      "Registered",
      "ICT Admin",
      "29-Sep-2026",
      { text: "Active", tone: "active" },
    ],
  ],
};

export const ASSETS: Asset[] = [
  {
    code: "ICT-00001",
    category: "Desktop",
    brandModel: "Dell OptiPlex 7060",
    serial: "CPJZWX1",
    location: "Main Office",
    department: "Administration",
    status: "Active",
    tone: "active",
  },
  {
    code: "ICT-00002",
    category: "Laptop",
    brandModel: "HP ProBook 450",
    serial: "5CD12345",
    location: "Computer Lab",
    department: "ICT",
    status: "Assigned",
    tone: "assigned",
  },
  {
    code: "ICT-00003",
    category: "Projector",
    brandModel: "Epson EB-X06",
    serial: "X1234567",
    location: "Room 101",
    department: "Academic",
    status: "Maintenance",
    tone: "maint",
  },
  {
    code: "ICT-00004",
    category: "Printer",
    brandModel: "HP LaserJet Pro",
    serial: "VNC98765",
    location: "Finance",
    department: "Finance",
    status: "Broken",
    tone: "broken",
  },
  {
    code: "ICT-00005",
    category: "Monitor",
    brandModel: "Dell P2419H",
    serial: "CN-123456",
    location: "Computer Lab",
    department: "ICT",
    status: "Active",
    tone: "active",
  },
];

export const NEXT_ASSET_CODE = "ICT-00006";

export const CATEGORIES = [
  "Desktop",
  "Laptop",
  "Monitor",
  "Printer",
  "Projector",
  "Network Equipment",
];

export const STATUSES = ["Available", "Assigned", "Spare"];

export const CONDITIONS = ["Good", "Fair", "Poor"];

export const SUPPLIERS = ["ABC Technology", "Local ICT Supplier"];

export const ASSET_LOCATIONS = ["Main Office", "Computer Lab", "Room 101", "Library"];

export const DEPARTMENTS = ["ICT", "Administration", "Academic", "Finance"];

export const EQUIPMENT_STATS: MiniStatData[] = [
  { icon: "🖥️", label: "Desktop", value: "152" },
  { icon: "💻", label: "Laptop", value: "121" },
  { icon: "🖨️", label: "Printer", value: "65" },
  { icon: "📡", label: "Network", value: "48" },
];

export const ASSIGNMENTS: SimpleTable = {
  columns: ["Asset", "Assigned To", "Department", "Location", "Assigned Date", "Status"],
  rows: [
    [
      "ICT-00001 · Dell Desktop",
      "Mr. Dara",
      "Administration",
      "Main Office",
      "01-Oct-2026",
      { text: "Assigned", tone: "assigned" },
    ],
    [
      "ICT-00002 · HP Laptop",
      "Ms. Sreyneang",
      "ICT",
      "Computer Lab",
      "15-Sep-2026",
      { text: "Assigned", tone: "assigned" },
    ],
  ],
};

export const TRANSFERS: SimpleTable = {
  columns: ["Asset", "From", "To", "Transfer Date", "Transferred By", "Status"],
  rows: [
    [
      "ICT-00015",
      "Room 101",
      "Computer Lab",
      "28-Sep-2026",
      "ICT Admin",
      { text: "Completed", tone: "active" },
    ],
  ],
};

export const MAINTENANCE_STATS: MiniStatData[] = [
  { label: "Open", value: "15" },
  { label: "In Progress", value: "6" },
  { label: "Completed", value: "87" },
  { label: "Total Cost", value: "$4,820" },
];

export const MAINTENANCE_RECORDS: SimpleTable = {
  columns: ["Asset", "Problem", "Date", "Technician", "Cost", "Status"],
  rows: [
    [
      "ICT-00003",
      "Projector lamp issue",
      "30-Sep-2026",
      "ICT Service",
      "$85",
      { text: "In Progress", tone: "maint" },
    ],
    [
      "ICT-00021",
      "Windows issue",
      "29-Sep-2026",
      "ICT Staff",
      "$0",
      { text: "Completed", tone: "active" },
    ],
  ],
};

export const BROKEN_RECORDS: SimpleTable = {
  columns: ["Asset", "Problem", "Location", "Reported Date", "Action", "Status"],
  rows: [
    [
      "ICT-00004 · HP Printer",
      "Paper feed failure",
      "Finance",
      "28-Sep-2026",
      "Repair",
      { text: "Broken", tone: "broken" },
    ],
    [
      "ICT-00031 · Dell Monitor",
      "No display",
      "Lab",
      "22-Sep-2026",
      "Repair",
      { text: "Repairing", tone: "maint" },
    ],
  ],
};

export const AUDIT_STATS: MiniStatData[] = [
  { label: "Assets to Verify", value: "583" },
  { label: "Verified", value: "521" },
  { label: "Missing", value: "7" },
  { label: "Pending", value: "55" },
];

export const LOCATIONS: SimpleTable = {
  columns: ["Location", "Building", "Room", "Assets"],
  rows: [
    ["Main Office", "Administration", "Ground Floor", "173"],
    ["Computer Lab", "Academic Building", "Lab 01", "146"],
    ["Library", "Academic Building", "Library", "57"],
  ],
};

export const DEPARTMENTS_TABLE: SimpleTable = {
  columns: ["Department", "Manager", "Assets", "Users"],
  rows: [
    ["ICT", "ICT Manager", "214", "8"],
    ["Administration", "Admin Manager", "173", "22"],
    ["Academic", "Academic Manager", "146", "35"],
  ],
};

export const SUPPLIERS_TABLE: SimpleTable = {
  columns: ["Supplier", "Contact", "Phone", "Purchased Assets"],
  rows: [
    ["ABC Technology", "Sales Team", "012 000 000", "125"],
    ["Local ICT Supplier", "Support", "010 111 111", "84"],
  ],
};

export const PURCHASES: SimpleTable = {
  columns: ["Invoice", "Date", "Supplier", "Items", "Total"],
  rows: [
    ["INV-2026-001", "10-Sep-2026", "ABC Technology", "25", "$18,500"],
    ["INV-2026-002", "22-Aug-2026", "Local ICT Supplier", "14", "$7,200"],
  ],
};

export const HISTORY: SimpleTable = {
  columns: ["Year", "Asset / Item", "Category", "Supplier", "Purchase Value", "Remarks"],
  rows: [
    ["2018", "Desktop Computer", "Computer", "Historical Supplier", "$650", "Historical record"],
    ["2017", "Projector", "Projector", "Historical Supplier", "$850", "Transferred"],
  ],
};

export const REPORTS: ReportDefinition[] = [
  {
    icon: "📦",
    title: "Asset Register",
    description: "Complete list of ICT assets and current status.",
  },
  {
    icon: "💰",
    title: "Asset Value",
    description: "Purchase value and inventory valuation.",
  },
  {
    icon: "🔧",
    title: "Maintenance",
    description: "Maintenance history and repair costs.",
  },
  {
    icon: "⚠️",
    title: "Broken Assets",
    description: "Damaged, broken and repair records.",
  },
  {
    icon: "🏢",
    title: "Location Report",
    description: "Assets grouped by location.",
  },
  {
    icon: "🏫",
    title: "Department Report",
    description: "Assets assigned to departments.",
  },
];

export const USERS: SimpleTable = {
  columns: ["Name", "Email", "Role", "Department", "Status"],
  rows: [
    [
      "ICT Administrator",
      "admin@example.com",
      "Administrator",
      "ICT",
      { text: "Active", tone: "active" },
    ],
    ["ICT Staff", "ict@example.com", "ICT Staff", "ICT", { text: "Active", tone: "active" }],
  ],
};

export const ORGANIZATION_NAME = "ICT Inventory Management";

export const ASSET_CODE_PREFIX = "ICT-";

export const CURRENCIES = ["USD", "KHR"];

export const DATE_FORMATS = ["dd-mmm-yyyy", "yyyy-mm-dd"];

export const CURRENT_USER = {
  name: "ICT Administrator",
  role: "Administrator",
  initials: "IA",
};
