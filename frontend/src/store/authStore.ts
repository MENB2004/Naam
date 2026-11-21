import { create } from 'zustand';
import { UserProfile, UserRole } from '../types/auth';

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  setAuth: (user: UserProfile, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

const STORAGE_KEY_USER = 'naam_auth_user';
const STORAGE_KEY_ACCESS = 'naam_access_token';
const STORAGE_KEY_REFRESH = 'naam_refresh_token';

// Safely load initial state from localStorage
const loadInitialState = () => {
  try {
    const storedUser = localStorage.getItem(STORAGE_KEY_USER);
    const accessToken = localStorage.getItem(STORAGE_KEY_ACCESS);
    const refreshToken = localStorage.getItem(STORAGE_KEY_REFRESH);
    if (storedUser && accessToken) {
      return {
        user: JSON.parse(storedUser) as UserProfile,
        accessToken,
        refreshToken,
        isAuthenticated: true,
      };
    }
  } catch (e) {
    console.error('Failed to load auth from localStorage', e);
  }
  return {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
  };
};

const initial = loadInitialState();

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initial.user,
  accessToken: initial.accessToken,
  refreshToken: initial.refreshToken,
  isAuthenticated: initial.isAuthenticated,
  isLoading: false,
  error: null,

  setAuth: (user, accessToken, refreshToken) => {
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEY_ACCESS, accessToken);
      localStorage.setItem(STORAGE_KEY_REFRESH, refreshToken);
    } catch (e) {
      console.error('Failed to persist auth state', e);
    }
    set({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
      error: null,
      isLoading: false,
    });
  },

  logout: () => {
    try {
      localStorage.removeItem(STORAGE_KEY_USER);
      localStorage.removeItem(STORAGE_KEY_ACCESS);
      localStorage.removeItem(STORAGE_KEY_REFRESH);
    } catch (e) {
      console.error('Failed to clear auth storage', e);
    }
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      error: null,
      isLoading: false,
    });
  },

  setError: (error) => set({ error }),
  setLoading: (isLoading) => set({ isLoading }),

  hasRole: (roles) => {
    const currentUser = get().user;
    if (!currentUser) return false;
    if (Array.isArray(roles)) {
      return roles.includes(currentUser.role);
    }
    return currentUser.role === roles;
  },
}));
