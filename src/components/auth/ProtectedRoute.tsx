import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/services/api/auth.api';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Tracks whether the session has been validated in this browser session.
 * Reset synchronously via resetSessionValidation() during logout,
 * and also reactively via useEffect when isAuthenticated becomes false.
 */
let sessionValidated = false;

/** Call synchronously during logout to prevent race conditions. */
export function resetSessionValidation() {
  sessionValidated = false;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, logout } = useAuthStore();
  const location = useLocation();
  const [validatingSession, setValidatingSession] = useState(
    // Only need to validate if we think we're authenticated but haven't verified yet
    isAuthenticated && !sessionValidated
  );

  useEffect(() => {
    // Nothing to validate if not authenticated or already validated
    if (!isAuthenticated || sessionValidated) {
      setValidatingSession(false);
      return;
    }

    let cancelled = false;

    const validateSession = async () => {
      try {
        // Try a token refresh to verify the session is still valid.
        // If the refresh token is expired, this will fail with 401.
        await authApi.refresh();
        sessionValidated = true;
      } catch {
        // Session is expired — clear auth state and let the render
        // cycle redirect to login via the <Navigate> below.
        sessionValidated = false;
        logout();
      } finally {
        if (!cancelled) {
          setValidatingSession(false);
        }
      }
    };

    validateSession();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, logout]);

  // Reset the validation flag when the user logs out so that
  // the next login will re-validate.
  useEffect(() => {
    if (!isAuthenticated) {
      sessionValidated = false;
    }
  }, [isAuthenticated]);

  if (isLoading || validatingSession) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
