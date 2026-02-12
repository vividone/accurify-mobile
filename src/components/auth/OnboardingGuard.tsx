import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useBusinessStore } from '@/store/business.store';
import { useAuthStore } from '@/store/auth.store';
import { businessApi } from '@/services/api';
import { UserRole } from '@/types';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { business, setBusiness } = useBusinessStore();
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);

  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;
  const isAccountant = user?.role === UserRole.ACCOUNTANT;

  useEffect(() => {
    if (isSuperAdmin || isAccountant) {
      setIsLoading(false);
      return;
    }

    const fetchBusiness = async () => {
      if (business) {
        setIsLoading(false);
        setHasFetched(true);
        return;
      }

      if (hasFetched) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await businessApi.get();
        setBusiness(data);
      } catch {
        setBusiness(null);
      } finally {
        setIsLoading(false);
        setHasFetched(true);
      }
    };

    fetchBusiness();
  }, [business, hasFetched, setBusiness, isSuperAdmin, isAccountant]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isSuperAdmin) {
    return <Navigate to="/app/dashboard" replace />;
  }

  if (isAccountant) {
    return <>{children}</>;
  }

  if (!business) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
