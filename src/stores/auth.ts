
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User, Tenant } from '@/types';

interface AuthStore extends AuthState {
  token: string | null;
  refreshToken: string | null;
  login: (user: User, tenant?: Tenant, tokens?: { token: string; refreshToken: string }) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (user: Partial<User>) => void;
  updateTenant: (tenant: Partial<Tenant>) => void;
  setTokens: (token: string, refreshToken: string) => void;
  clearTokens: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      tenant: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: (user: User, tenant?: Tenant, tokens?: { token: string; refreshToken: string }) => {
        if (tokens) {
          localStorage.setItem('auth-token', tokens.token);
          localStorage.setItem('refresh-token', tokens.refreshToken);
        }
        set({
          user,
          tenant,
          token: tokens?.token || null,
          refreshToken: tokens?.refreshToken || null,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        localStorage.removeItem('auth-token');
        localStorage.removeItem('refresh-token');
        set({
          user: null,
          tenant: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      updateUser: (userData: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...userData } });
        }
      },

      updateTenant: (tenantData: Partial<Tenant>) => {
        const { tenant } = get();
        if (tenant) {
          set({ tenant: { ...tenant, ...tenantData } });
        }
      },

      setTokens: (token: string, refreshToken: string) => {
        localStorage.setItem('auth-token', token);
        localStorage.setItem('refresh-token', refreshToken);
        set({ token, refreshToken });
      },

      clearTokens: () => {
        localStorage.removeItem('auth-token');
        localStorage.removeItem('refresh-token');
        set({ token: null, refreshToken: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        tenant: state.tenant,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
