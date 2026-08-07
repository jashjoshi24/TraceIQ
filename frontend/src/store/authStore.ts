import { create } from 'zustand';
import { User, Role } from '../types/auth';
import { api, API_BASE_URL } from '../utils/api';
import axios from 'axios';

interface AuthState {
  user: User | null;
  roles: string[];
  permissions: string[];
  accessToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  isLoading: boolean;

  // Actions
  setAccessToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  clearAuth: () => void;
  updateProfileState: (updatedUser: User) => void;

  // Helper Permission Guards
  hasRole: (roleName: string) => boolean;
  hasPermission: (permissionName: string) => boolean;
  hasAnyRole: (roleNames: string[]) => boolean;
  hasAnyPermission: (permissionNames: string[]) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  roles: [],
  permissions: [],
  accessToken: null,
  isAuthenticated: false,
  isHydrated: false,
  isLoading: false,

  setAccessToken: (token) => {
    set({ accessToken: token, isAuthenticated: !!token });
  },

  setUser: (user) => {
    if (!user) {
      set({ user: null, roles: [], permissions: [], isAuthenticated: false });
      return;
    }

    const roleNames = user.roles.map((r: Role) => r.name);
    const permissionNames = Array.from(
      new Set(user.roles.flatMap((r: Role) => r.permissions.map((p) => p.name)))
    );

    set({
      user,
      roles: roleNames,
      permissions: permissionNames,
      isAuthenticated: true,
    });
  },

  login: async (username, password) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/login', { username, password });
      const accessToken = response.data.access_token;
      set({ accessToken, isAuthenticated: true });

      // Fetch user profile & roles
      const meResponse = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      get().setUser(meResponse.data);
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore logout errors
    } finally {
      get().clearAuth();
      set({ isLoading: false });
    }
  },

  hydrate: async () => {
    if (get().isHydrated) return;
    set({ isLoading: true });
    try {
      // Silent refresh using central api instance
      const refreshResponse = await api.post('/auth/refresh');
      const newAccessToken = refreshResponse.data.access_token;
      set({ accessToken: newAccessToken, isAuthenticated: true });

      // Fetch user details
      const meResponse = await api.get('/auth/me');
      get().setUser(meResponse.data);
    } catch {
      get().clearAuth();
    } finally {
      set({ isHydrated: true, isLoading: false });
    }
  },

  clearAuth: () => {
    set({
      user: null,
      roles: [],
      permissions: [],
      accessToken: null,
      isAuthenticated: false,
    });
  },

  updateProfileState: (updatedUser) => {
    get().setUser(updatedUser);
  },

  hasRole: (roleName) => {
    return get().roles.includes(roleName);
  },

  hasPermission: (permissionName) => {
    return get().permissions.includes(permissionName);
  },

  hasAnyRole: (roleNames) => {
    return roleNames.some((r) => get().roles.includes(r));
  },

  hasAnyPermission: (permissionNames) => {
    return permissionNames.some((p) => get().permissions.includes(p));
  },
}));
