import { apiRequest } from './api';
import { Complaint, ComplaintCreatePayload, ComplaintUpdate } from '../types/complaint';

export const complaintService = {
  async createComplaint(payload: ComplaintCreatePayload): Promise<Complaint> {
    return apiRequest<Complaint>('/complaints', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getMyComplaints(): Promise<Complaint[]> {
    return apiRequest<Complaint[]>('/complaints/me');
  },

  async getComplaintById(complaintId: string): Promise<Complaint> {
    return apiRequest<Complaint>(`/complaints/${complaintId}`);
  },

  async trackComplaint(trackingCode: string): Promise<Complaint> {
    return apiRequest<Complaint>(`/complaints/track/${encodeURIComponent(trackingCode.trim().toUpperCase())}`);
  },

  async updateComplaintStatus(
    complaintId: string,
    payload: {
      new_status: string;
      remarks: string;
      department_id?: string;
    }
  ): Promise<Complaint> {
    return apiRequest<Complaint>(`/complaints/${complaintId}/status`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getComplaintTimeline(complaintId: string): Promise<ComplaintUpdate[]> {
    return apiRequest<ComplaintUpdate[]>(`/complaints/${complaintId}/timeline`);
  },

  async getPublicComplaints(params?: {
    category?: string;
    status?: string;
    district?: string;
  }): Promise<Complaint[]> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.status) query.append('status', params.status);
    if (params?.district) query.append('district', params.district);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiRequest<Complaint[]>(`/complaints${qs}`);
  },
};
