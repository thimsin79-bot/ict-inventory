export type BadgeTone = "active" | "assigned" | "maint" | "broken";

export type AssetStatus = "Active" | "Assigned" | "Maintenance" | "Broken";

export type AssetCondition = "Good" | "Fair" | "Poor";

export type Availability = "Available" | "Assigned" | "Spare";

export type MaintenanceStatus = "Open" | "In Progress" | "Completed";

export type BrokenStatus = "Broken" | "Repairing" | "Resolved";

export type UserStatus = "Active" | "Inactive";

export type UserRole = "Administrator" | "ICT Staff" | "Viewer";

export type AssignmentStatus = "Assigned" | "Returned";

export type TransferStatus = "Pending" | "Completed";

export type AuditResult = "Verified" | "Missing" | "Pending";

export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

/* ------------------------------------------------------------------ assets --- */

export interface Asset {
  id: number;
  code: string;
  category: string;
  brand: string;
  model: string;
  serial: string;
  /** Display name, resolved from the location table ("" when unassigned). */
  location: string;
  department: string;
  status: AssetStatus;
  purchasePrice?: number;
  purchaseDate?: string;
  locationId: number | null;
  departmentId: number | null;
  supplierId: number | null;
  supplier: string;
  condition: AssetCondition;
  availability: Availability;
  remarks: string;
  createdAt: string;
}

export interface AssetFormOptions {
  categories: string[];
  locations: { id: number; name: string }[];
  departments: { id: number; name: string }[];
  suppliers: { id: number; name: string }[];
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

/** Value plus count, used by the reports and the equipment summary. */
export interface CategoryStat {
  label: string;
  count: number;
  value: number;
}

export interface ActivityRecord {
  code: string;
  asset: string;
  action: string;
  user: string;
  date: string;
  status: AssetStatus;
}

/* -------------------------------------------------------------- operations --- */

export interface AssignmentRecord {
  id: number;
  assetId: number;
  asset: string;
  assignee: string;
  department: string;
  location: string;
  date: string;
  returnedDate: string;
  status: AssignmentStatus;
  notes: string;
}

export interface TransferRecord {
  id: number;
  code: string;
  from: string;
  to: string;
  date: string;
  by: string;
  status: TransferStatus;
  notes: string;
}

export interface MaintenanceRecord {
  id: number;
  code: string;
  assetId: number;
  problem: string;
  date: string;
  technician: string;
  cost: number;
  status: MaintenanceStatus;
  completedDate: string;
  notes: string;
}

export interface MaintenanceSummary {
  open: number;
  inProgress: number;
  completed: number;
  totalCost: number;
}

export interface BrokenRecord {
  id: number;
  assetId: number;
  asset: string;
  problem: string;
  location: string;
  reportedDate: string;
  action: string;
  status: BrokenStatus;
  notes: string;
}

export interface AuditRecord {
  id: number;
  assetId: number;
  code: string;
  asset: string;
  location: string;
  auditDate: string;
  auditor: string;
  result: AuditResult;
  notes: string;
}

export interface AuditSummary {
  toVerify: number;
  verified: number;
  missing: number;
  pending: number;
}

/* --------------------------------------------------------------- reference --- */

export interface LocationRecord {
  id: number;
  name: string;
  building: string;
  room: string;
  assets: number;
}

export interface DepartmentRecord {
  id: number;
  name: string;
  manager: string;
  assets: number;
  users: number;
}

export interface SupplierRecord {
  id: number;
  name: string;
  contact: string;
  phone: string;
  email: string;
  assets: number;
}

export interface PurchaseRecord {
  id: number;
  invoice: string;
  date: string;
  supplierId: number | null;
  supplier: string;
  items: number;
  total: number;
  notes: string;
}

export interface PurchaseItemRecord {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface HistoryRecord {
  id: number;
  year: number;
  item: string;
  category: string;
  supplier: string;
  value: number;
  remarks: string;
}

export interface UserRecord {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  departmentId: number | null;
  status: UserStatus;
  createdAt: string;
}

export interface SettingsRecord {
  organizationName: string;
  assetCodePrefix: string;
  currency: string;
  dateFormat: string;
}

export interface ReportDefinition {
  slug: string;
  icon: string;
  title: string;
  description: string;
}

/* ------------------------------------------------------- lists and queries --- */

/** A reference row for populating <select> inputs. */
export interface Option {
  id: number;
  name: string;
}

/** Asset row paired with the names needed to render it. */
export interface AssetOption extends Option {
  code: string;
}

export interface AssetFilters {
  q?: string;
  category?: string;
  status?: string;
  locationId?: number;
  departmentId?: number;
  sort?: AssetSortKey;
  direction?: SortDirection;
  page?: number;
  pageSize?: number;
}

export type AssetSortKey =
  | "code"
  | "category"
  | "brand"
  | "status"
  | "location"
  | "department"
  | "purchaseDate"
  | "purchasePrice";

export type SortDirection = "asc" | "desc";

export interface Paginated<T> {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

/** Result of a form submission, consumed by the client form components. */
export interface FormState {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors: Record<string, string>;
}

export const IDLE: FormState = { status: "idle", message: "", fieldErrors: {} };
