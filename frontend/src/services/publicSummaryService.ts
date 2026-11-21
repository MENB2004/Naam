import { apiRequest } from './api';
import type { PublicMapSummary } from '../types/publicSummary';

export const publicSummaryService = {
  getSummary: () => apiRequest<PublicMapSummary>('/map/summary'),
};
