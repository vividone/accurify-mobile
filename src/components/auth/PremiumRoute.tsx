import { Navigate } from 'react-router-dom';
import { useSubscriptionStore } from '@/store/subscription.store';
import { useUIStore } from '@/store/ui.store';
import type { UpgradePromptType } from '@/store/ui.store';
import { useEffect } from 'react';
import { useSubscription } from '@/queries/subscription.queries';

interface PremiumRouteProps {
  children: React.ReactNode;
  promptType?: UpgradePromptType;
}

/**
 * Route guard that only allows access for premium or trialing users.
 * Free-tier users will see an upgrade prompt and be redirected to the dashboard.
 */
export function PremiumRoute({ children, promptType = 'generic' }: PremiumRouteProps) {
  // Fetch subscription data via React Query (also updates the Zustand store)
  const { isLoading, isError } = useSubscription();

  const { isPremium, isTrialing } = useSubscriptionStore();
  const setUpgradeModalOpen = useUIStore((s) => s.setUpgradeModalOpen);

  const hasAccess = isPremium || isTrialing;

  useEffect(() => {
    if (!isLoading && !isError && !hasAccess) {
      setUpgradeModalOpen(true, promptType);
    }
  }, [isLoading, isError, hasAccess, promptType, setUpgradeModalOpen]);

  // Show a loading state while subscription data is being fetched
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError) {
    return <Navigate to="/app/dashboard" replace />;
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  return <Navigate to="/app/dashboard" replace />;
}
