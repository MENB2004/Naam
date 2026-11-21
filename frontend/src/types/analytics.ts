export interface AnalyticsOverview {
  total_complaints: number;
  resolved_complaints: number;
  in_progress_complaints: number;
  pending_complaints: number;
  resolution_rate: number;
  average_resolution_hours: number;
  active_alerts: number;
}

export interface CategoryDistribution {
  category: string;
  category_name_ml: string;
  category_name_en: string;
  count: number;
  percentage: number;
  color: string;
}

export interface DistrictMetric {
  district: string;
  district_name_ml: string;
  total: number;
  resolved: number;
  pending: number;
  resolution_rate: number;
}

export interface TrendPoint {
  date: string;
  reported: number;
  resolved: number;
}

export interface AnalyticsSummaryResponse {
  overview: AnalyticsOverview;
  categories: CategoryDistribution[];
  districts: DistrictMetric[];
  trends: TrendPoint[];
}
