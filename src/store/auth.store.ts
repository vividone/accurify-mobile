import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types';
import { authApi } from '@/services/api/auth.api';
import { useBusinessStore } from '@/store/business.store';
import { useSubscriptionStore } from '@/store/subscription.store';
import { queryClient } from '@/lib/queryClient';
import { resetSessionValidation } from '@/components/auth/ProtectedRoute';

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

/**
 * Clear all client-side state from other stores and caches.
 * Called by both sync logout (401 interceptor) and async logout (user-initiated).
 */
function clearAllClientState() {
  // Clear persisted business data (localStorage)
  useBusinessStore.getState().clearBusiness();
  // Clear in-memory subscription data
  useSubscriptionStore.getState().clearSubscription();
  // Clear all React Query cached data
  queryClient.clear();
  // Reset session validation flag synchronously
  resetSessionValidation();
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

      logout: () => {
        clearAllClientState();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

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

        // Clear all client-side state (business, subscription, query cache)
        clearAllClientState();

        // Clear auth state
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
