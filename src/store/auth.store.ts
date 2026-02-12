import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types';
import { authApi } from '@/services/api/auth.api';

/**
 * SECURITY: Auth state no longer stores tokens in localStorage (FE-001, FE-003)
 * Tokens are now stored in httpOnly cookies, making them inaccessible to JavaScript
 */
interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setAuth: (user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
  logoutAsync: () => Promise<void>; // SECURITY: Async logout with backend cookie clearing (FE-012)
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: true,

      // Actions - SECURITY: Tokens are no longer stored in localStorage (FE-001)
      setAuth: (user) =>
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        }),

      setUser: (user) => set({ user }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      // SECURITY: Async logout that clears httpOnly cookies on backend (FE-012)
      logoutAsync: async () => {
        // Call backend to clear cookies and blacklist tokens
        // No need to pass tokens - backend reads them from cookies
        try {
          await authApi.logout();
        } catch {
          // Continue logout even if backend call fails
          console.warn('Backend logout failed, clearing local state anyway');
        }

        // Clear local state
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'accura-auth',
      storage: createJSONStorage(() => localStorage),
      // SECURITY: Only persist user info and auth state, not tokens (FE-001, FE-003)
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Set loading to false after hydration
        if (state) {
          state.setLoading(false);
        }
      },
    }
  )
);
