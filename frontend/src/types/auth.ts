export type UserRole = 'COMMUNITY' | 'AUTHORITY' | 'OFFICER' | 'SUPER_ADMIN';

export interface UserProfile {
  id: string;
  email: string;
  phone?: string | null;
  fullName: string;
  role: UserRole;
  roleDisplayMl: string;
  roleDisplayEn: string;
  departmentId?: string | null;
  departmentNameMl?: string | null;
  isActive: boolean;
  isVerified?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

export interface LoginPayload {
  identifier: string;
  password: string;
  expected_role?: UserRole;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  phone?: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    phone?: string | null;
    full_name: string;
    role: UserRole;
    role_display_ml: string;
    role_display_en: string;
    department_id?: string | null;
    department_name_ml?: string | null;
    is_active: boolean;
  };
}
