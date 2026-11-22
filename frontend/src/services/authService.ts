import { apiRequest } from './api';
import {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  UserProfile,
} from '../types/auth';

function mapResponseUserToProfile(u: AuthResponse['user']): UserProfile {
  return {
    id: u.id,
    email: u.email,
    phone: u.phone,
    fullName: u.full_name,
    role: u.role,
    roleDisplayMl: u.role_display_ml,
    roleDisplayEn: u.role_display_en,
    departmentId: u.department_id,
    departmentNameMl: u.department_name_ml,
    isActive: u.is_active,
    locality: u.locality,
  };
}

export const authService = {
  async login(payload: LoginPayload): Promise<{ user: UserProfile; accessToken: string; refreshToken: string }> {
    const res = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return {
      user: mapResponseUserToProfile(res.user),
      accessToken: res.access_token,
      refreshToken: res.refresh_token,
    };
  },

  async register(payload: RegisterPayload): Promise<{ user: UserProfile; accessToken: string; refreshToken: string }> {
    const res = await apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return {
      user: mapResponseUserToProfile(res.user),
      accessToken: res.access_token,
      refreshToken: res.refresh_token,
    };
  },

  async getMe(): Promise<UserProfile> {
    const res = await apiRequest<AuthResponse['user']>('/auth/me');
    return mapResponseUserToProfile(res);
  },

  async updateMyProfile(payload: { full_name: string; phone?: string; locality?: string }): Promise<UserProfile> {
    const res = await apiRequest<AuthResponse['user']>('/auth/me/profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return mapResponseUserToProfile(res);
  },

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const res = await apiRequest<{ access_token: string; refresh_token: string; token_type: string }>(
      '/auth/refresh',
      {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
      }
    );
    return {
      accessToken: res.access_token,
      refreshToken: res.refresh_token,
    };
  },
};
