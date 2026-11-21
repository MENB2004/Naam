export interface PublicCategoryCount {
  category: string;
  count: number;
}

export interface PublicRecentReport {
  id: string;
  title: string;
  category: string;
  current_status: string;
  district: string;
  created_at: string;
}

export interface PublicMapSummary {
  total_complaints: number;
  active_complaints: number;
  resolved_complaints: number;
  active_departments: number;
  categories: PublicCategoryCount[];
  recent_reports: PublicRecentReport[];
}
