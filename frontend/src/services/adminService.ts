import { apiRequest } from './api';
import {
  SystemStats,
  UserAdmin,
  DepartmentAdmin,
  DepartmentCreatePayload,
  AuditLog,
} from '../types/admin';

export const adminService = {
  getStats: async (): Promise<SystemStats> => {
    return apiRequest<SystemStats>('/admin/stats');
  },

  getUsers: async (search?: string, role?: string): Promise<UserAdmin[]> => {
    const query = new URLSearchParams();
    if (search && search.trim()) query.append('search', search.trim());
    if (role && role !== 'ALL') query.append('role', role);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiRequest<UserAdmin[]>(`/admin/users${qs}`);
  },

  updateUserRole: async (
    userId: string,
    role: string,
    departmentId?: string | null
  ): Promise<UserAdmin> => {
    return apiRequest<UserAdmin>(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role, department_id: departmentId }),
    });
  },

  toggleUserStatus: async (userId: string, isActive: boolean): Promise<UserAdmin> => {
    return apiRequest<UserAdmin>(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: isActive }),
    });
  },

  getDepartments: async (): Promise<DepartmentAdmin[]> => {
    return apiRequest<DepartmentAdmin[]>('/admin/departments');
  },

  createDepartment: async (payload: DepartmentCreatePayload): Promise<DepartmentAdmin> => {
    return apiRequest<DepartmentAdmin>('/admin/departments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getAuditLogs: async (action?: string): Promise<AuditLog[]> => {
    const query = new URLSearchParams();
    if (action && action !== 'ALL') query.append('action', action);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiRequest<AuditLog[]>(`/admin/audit-logs${qs}`);
  },
};
