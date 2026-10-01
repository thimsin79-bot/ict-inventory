export type BadgeTone = "active" | "assigned" | "maint" | "broken";

export type Tone = "default" | "red" | "orange";

export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export interface StatCardData {
  label: string;
  value: string;
  foot: string;
  tone: Tone;
}

export interface BarDatum {
  label: string;
  value: number;
  percent: number;
}

export interface Asset {
  code: string;
  category: string;
  brandModel: string;
  serial: string;
  location: string;
  department: string;
  status: string;
  tone: BadgeTone;
}

export interface MiniStatData {
  label: string;
  value: string;
  icon?: string;
}

export interface ReportDefinition {
  icon: string;
  title: string;
  description: string;
}

export type TableCell = string | { text: string; tone: BadgeTone };

export interface SimpleTable {
  columns: string[];
  rows: TableCell[][];
}
