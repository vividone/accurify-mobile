import { Navigate } from 'react-router-dom';
import { useBusinessStore } from '@/store/business.store';
import { BusinessType } from '@/types';

interface GoodsRouteProps {
  children: React.ReactNode;
}

/**
 * Route guard that only allows access for GOODS businesses.
 * SERVICE businesses will be redirected to the dashboard.
 */
export function GoodsRoute({ children }: GoodsRouteProps) {
  const business = useBusinessStore((state) => state.business);

  if (business?.type !== BusinessType.GOODS) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <>{children}</>;
}
