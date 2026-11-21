export interface MapPoint {
  id: string;
  tracking_code: string;
  title: string;
  category: string;
  category_display_ml: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
  current_status: string;
  status_display_ml: string;
  latitude: number;
  longitude: number;
  district: string;
  lsgd_name: string;
  ward_number?: string | null;
  created_at: string;
  thumbnail_url?: string | null;
  distance_km?: number | null;
}

export interface MapFilters {
  category: string;
  status: string;
  district: string;
  search: string;
}

export interface MapClustersResponse {
  total_count: number;
  points: MapPoint[];
  geojson: {
    type: string;
    features: Array<{
      type: string;
      geometry: {
        type: string;
        coordinates: [number, number];
      };
      properties: Record<string, any>;
    }>;
  };
}
