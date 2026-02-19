import { Navigate } from 'react-router-dom';
import { useSubscriptionStore } from '@/store/subscription.store';
import { useUIStore } from '@/store/ui.store';
import type { UpgradePromptType } from '@/store/ui.store';
import { useEffect } from 'react';

interface PremiumRouteProps {
  children: React.ReactNode;
  promptType?: UpgradePromptType;
}

/**
 * Route guard that only allows access for premium or trialing users.
 * Free-tier users will see an upgrade prompt and be redirected to the dashboard.
 */
export function PremiumRoute({ children, promptType = 'generic' }: PremiumRouteProps) {
  const { isPremium, isTrialing } = useSubscriptionStore();
  const setUpgradeModalOpen = useUIStore((s) => s.setUpgradeModalOpen);

  const hasAccess = isPremium || isTrialing;

  useEffect(() => {
    if (!hasAccess) {
      setUpgradeModalOpen(true, promptType);
    }
  }, [hasAccess, promptType, setUpgradeModalOpen]);

  if (!hasAccess) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <>{children}</>;
}
