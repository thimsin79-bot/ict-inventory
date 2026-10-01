export type BadgeTone = "active" | "assigned" | "maint" | "broken";

export type AssetStatus = "Active" | "Assigned" | "Maintenance" | "Broken";

export type AssetCondition = "Good" | "Fair" | "Poor";

export type Availability = "Available" | "Assigned" | "Spare";

export type MaintenanceStatus = "Open" | "In Progress" | "Completed";

export type BrokenStatus = "Broken" | "Repairing";

export type UserStatus = "Active" | "Inactive";

export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export interface Asset {
  code: string;
  category: string;
  brandModel: string;
  serial: string;
  location: string;
  department: string;
  status: AssetStatus;
  purchasePrice: number;
  purchaseDate: string;
}

export interface AssetSummary {
  total: number;
  active: number;
  assigned: number;
  broken: number;
  inMaintenance: number;
  totalValue: number;
}

export interface Breakdown {
  label: string;
  value: number;
  percent: number;
}

export interface ActivityRecord {
  code: string;
  asset: string;
  action: string;
  user: string;
  date: string;
  status: AssetStatus;
}

export interface AssignmentRecord {
  asset: string;
  assignee: string;
  department: string;
  location: string;
  date: string;
  status: AssetStatus;
}

export interface TransferRecord {
  code: string;
  from: string;
  to: string;
  date: string;
  by: string;
  status: string;
}

export interface MaintenanceRecord {
  code: string;
  problem: string;
  date: string;
  technician: string;
  cost: number;
  status: MaintenanceStatus;
}

export interface MaintenanceSummary {
  open: number;
  inProgress: number;
  completed: number;
  totalCost: number;
}

export interface BrokenRecord {
  asset: string;
  problem: string;
  location: string;
  reportedDate: string;
  action: string;
  status: BrokenStatus;
}

export interface AuditSummary {
  toVerify: number;
  verified: number;
  missing: number;
  pending: number;
}

export interface LocationRecord {
  name: string;
  building: string;
  room: string;
  assets: number;
}

export interface DepartmentRecord {
  name: string;
  manager: string;
  assets: number;
  users: number;
}

export interface SupplierRecord {
  name: string;
  contact: string;
  phone: string;
  assets: number;
}

export interface PurchaseRecord {
  invoice: string;
  date: string;
  supplier: string;
  items: number;
  total: number;
}

export interface HistoryRecord {
  year: number;
  item: string;
  category: string;
  supplier: string;
  value: number;
  remarks: string;
}

export interface UserRecord {
  name: string;
  email: string;
  role: string;
  department: string;
  status: UserStatus;
}

export interface ReportDefinition {
  icon: string;
  title: string;
  description: string;
}
