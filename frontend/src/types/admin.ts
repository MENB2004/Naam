export interface SystemStats {
  total_users: number;
  total_complaints: number;
  active_complaints: number;
  resolved_complaints: number;
  total_departments: number;
  active_alerts: number;
  total_audit_logs: number;
}

export interface UserAdmin {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  role: string;
  role_display_ml: string;
  department_id?: string | null;
  department_name_ml?: string | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface DepartmentAdmin {
  id: string;
  code: string;
  name_ml: string;
  name_en: string;
  contact_email?: string | null;
  contact_phone?: string | null;
  is_active: boolean;
  user_count: number;
  complaint_count: number;
  created_at: string;
}

export interface DepartmentCreatePayload {
  code: string;
  name_ml: string;
  name_en: string;
  contact_email?: string;
  contact_phone?: string;
}

export interface AuditLog {
  id: string;
  user_id?: string | null;
  user_email?: string | null;
  user_name?: string | null;
  action: string;
  entity_name?: string | null;
  entity_id?: string | null;
  ip_address?: string | null;
  details?: Record<string, any> | null;
  created_at: string;
}
