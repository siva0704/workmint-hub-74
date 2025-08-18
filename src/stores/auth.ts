
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User, Tenant } from '@/types';

interface AuthStore extends AuthState {
  login: (user: User, tenant?: Tenant) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (user: Partial<User>) => void;
  // NEW: allow updating tenant details (e.g., factoryName) so header reflects changes
  updateTenant: (tenant: Partial<Tenant>) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      tenant: null,
      isAuthenticated: false,
      isLoading: false,

      login: (user: User, tenant?: Tenant) => {
        set({
          user,
          tenant,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        set({
          user: null,
          tenant: null,
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
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        tenant: state.tenant,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
