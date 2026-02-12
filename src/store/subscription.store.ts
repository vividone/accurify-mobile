import { create } from 'zustand';
import type { Subscription } from '@/types';

interface SubscriptionState {
  subscription: Subscription | null;
  isPremium: boolean;
  isTrialing: boolean;
  isLoading: boolean;

  setSubscription: (subscription: Subscription | null) => void;
  setLoading: (loading: boolean) => void;
  clearSubscription: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  subscription: null,
  isPremium: false,
  isTrialing: false,
  isLoading: false, // Note: We now rely on React Query's loading state instead

  setSubscription: (subscription) =>
    set({
      subscription,
      isPremium: subscription?.isPremium ?? false,
      isTrialing: subscription?.isTrialing ?? false,
    }),

  setLoading: (loading) => set({ isLoading: loading }),

  clearSubscription: () =>
    set({
      subscription: null,
      isPremium: false,
      isTrialing: false,
    }),
}));
