export interface PublicCategoryCount {
  category: string;
  count: number;
  active_count: number;
}

export interface PublicRecentReport {
  category: string;
  current_status: string;
  district: string;
  created_at: string;
}

export interface PublicMapSummary {
  total_complaints: number;
  active_complaints: number;
  resolved_complaints: number;
  active_categories: number;
  categories: PublicCategoryCount[];
  recent_reports: PublicRecentReport[];
}
