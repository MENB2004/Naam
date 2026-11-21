import { apiRequest } from './api';
import { MapClustersResponse, MapPoint } from '../types/map';

export interface GetClustersParams {
  min_lat?: number;
  max_lat?: number;
  min_lng?: number;
  max_lng?: number;
  category?: string;
  status?: string;
  district?: string;
  limit?: number;
}

export const mapService = {
  getClusters: async (params: GetClustersParams = {}): Promise<MapClustersResponse> => {
    const query = new URLSearchParams();
    if (params.min_lat !== undefined) query.append('min_lat', params.min_lat.toString());
    if (params.max_lat !== undefined) query.append('max_lat', params.max_lat.toString());
    if (params.min_lng !== undefined) query.append('min_lng', params.min_lng.toString());
    if (params.max_lng !== undefined) query.append('max_lng', params.max_lng.toString());
    if (params.category && params.category !== 'ALL') query.append('category', params.category);
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    if (params.district && params.district !== 'ALL') query.append('district', params.district);
    if (params.limit) query.append('limit', params.limit.toString());

    return apiRequest<MapClustersResponse>(`/map/clusters?${query.toString()}`);
  },

  getNearby: async (
    lat: number,
    lng: number,
    radiusKm: number = 10,
    category?: string,
    status?: string,
    limit: number = 50
  ): Promise<MapPoint[]> => {
    const query = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      radius_km: radiusKm.toString(),
      limit: limit.toString(),
    });
    if (category && category !== 'ALL') query.append('category', category);
    if (status && status !== 'ALL') query.append('status', status);

    return apiRequest<MapPoint[]>(`/map/nearby?${query.toString()}`);
  },
};
