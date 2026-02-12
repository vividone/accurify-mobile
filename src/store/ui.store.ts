import { create } from 'zustand';

export type UpgradePromptType =
  | 'invoiceLimitReached'
  | 'clientLimitReached'
  | 'bankSyncLocked'
  | 'aiFeatureLocked'
  | 'glFeatureLocked'
  | 'marketplaceLocked'
  | 'quickStoreLocked'
  | 'generic';

interface UIState {
  // Upgrade modal
  upgradeModalOpen: boolean;
  upgradePromptType: UpgradePromptType;
  setUpgradeModalOpen: (open: boolean, promptType?: UpgradePromptType) => void;

  // Global loading
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;

  // Toast notifications
  notification: {
    open: boolean;
    title: string;
    subtitle: string;
    kind: 'success' | 'error' | 'warning' | 'info';
  } | null;
  showNotification: (
    title: string,
    subtitle: string,
    kind: 'success' | 'error' | 'warning' | 'info'
  ) => void;
  hideNotification: () => void;

  // More menu (bottom tab "More" slide-up)
  moreMenuOpen: boolean;
  setMoreMenuOpen: (open: boolean) => void;

  // Create action sheet (FAB "+" button)
  createSheetOpen: boolean;
  setCreateSheetOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Upgrade modal
  upgradeModalOpen: false,
  upgradePromptType: 'generic',
  setUpgradeModalOpen: (open, promptType = 'generic') =>
    set({ upgradeModalOpen: open, upgradePromptType: promptType }),

  // Global loading
  globalLoading: false,
  setGlobalLoading: (loading) => set({ globalLoading: loading }),

  // Toast notifications
  notification: null,
  showNotification: (title, subtitle, kind) =>
    set({
      notification: { open: true, title, subtitle, kind },
    }),
  hideNotification: () => set({ notification: null }),

  // More menu
  moreMenuOpen: false,
  setMoreMenuOpen: (open) => set({ moreMenuOpen: open }),

  // Create action sheet
  createSheetOpen: false,
  setCreateSheetOpen: (open) => set({ createSheetOpen: open }),
}));

// Standalone function for use in interceptors (called by client.ts)
export function openUpgradeModalFromInterceptor(promptType: UpgradePromptType = 'generic') {
  useUIStore.getState().setUpgradeModalOpen(true, promptType);
}
