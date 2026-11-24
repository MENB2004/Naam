import { apiRequest } from './api';
import {
  AnalyticsOverview,
  CategoryDistribution,
  DistrictMetric,
  TrendPoint,
  AnalyticsSummaryResponse,
} from '../types/analytics';

export const analyticsService = {
  getSummary: async (days: number = 14): Promise<AnalyticsSummaryResponse> => {
    return apiRequest<AnalyticsSummaryResponse>(`/analytics/summary?days=${days}`);
  },

  getOverview: async (): Promise<AnalyticsOverview> => {
    return apiRequest<AnalyticsOverview>('/analytics/overview');
  },

  getCategories: async (): Promise<CategoryDistribution[]> => {
    return apiRequest<CategoryDistribution[]>('/analytics/categories');
  },

  getDistricts: async (): Promise<DistrictMetric[]> => {
    return apiRequest<DistrictMetric[]>('/analytics/districts');
  },

  getTrends: async (days: number = 14): Promise<TrendPoint[]> => {
    return apiRequest<TrendPoint[]>(`/analytics/trends?days=${days}`);
  },

  downloadReport: async (format: 'csv' | 'json' = 'csv'): Promise<void> => {
    const token = localStorage.getItem('naam_access_token');
    const apiBase = (import.meta as any).env?.VITE_API_URL || '/api/v1';
    const url = `${apiBase}/analytics/export?format=${format}`;

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(url, { headers });
    if (!res.ok) {
      throw new Error('റിപ്പോർട്ട് ഡൗൺലോഡ് ചെയ്യുന്നതിൽ പരാജയപ്പെട്ടു / Failed to download report');
    }

    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `naam_environmental_report_${new Date().toISOString().slice(0, 10)}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },
};
