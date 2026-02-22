import { Navigate } from 'react-router-dom';
import { useBusinessStore } from '@/store/business.store';
import { BusinessType } from '@/types';

interface ServiceRouteProps {
  children: React.ReactNode;
}

/**
 * Route guard that only allows access for SERVICE businesses.
 * GOODS businesses will be redirected to the dashboard.
 */
export function ServiceRoute({ children }: ServiceRouteProps) {
  const business = useBusinessStore((state) => state.business);

  if (business?.type !== BusinessType.SERVICE) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <>{children}</>;
}
