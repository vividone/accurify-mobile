import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Business } from '@/types';

interface BusinessState {
  business: Business | null;
  isOnboarded: boolean;
  isLoading: boolean;

  setBusiness: (business: Business | null) => void;
  setLoading: (loading: boolean) => void;
  clearBusiness: () => void;
}

export const useBusinessStore = create<BusinessState>()(
  persist(
    (set) => ({
      business: null,
      isOnboarded: false,
      isLoading: true,

      setBusiness: (business) =>
        set({
          business,
          isOnboarded: business !== null,
        }),

      setLoading: (loading) => set({ isLoading: loading }),

      clearBusiness: () =>
        set({
          business: null,
          isOnboarded: false,
        }),
    }),
    {
      name: 'accura-business',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        business: state.business,
        isOnboarded: state.isOnboarded,
      }),
    }
  )
);
