import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { authApi } from '@/services/api';
import { useAuthStore } from '@/store/auth.store';
import { UserRole } from '@/types';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const isValidRedirectPath = (path: string): boolean => {
  const safePatterns = ['/app', '/accountant', '/onboarding'];
  if (!path.startsWith('/') || path.includes('://') || path.includes('//')) {
    return false;
  }
  return safePatterns.some((pattern) => path.startsWith(pattern));
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const rawFrom = (location.state as { from?: string })?.from;
  const from =
    rawFrom && isValidRedirectPath(rawFrom) ? rawFrom : '/app/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.login(data);
      setAuth(response.user);

      if (response.user.role === UserRole.SUPER_ADMIN) {
        navigate('/app/dashboard', { replace: true });
      } else if (response.user.role === UserRole.ACCOUNTANT) {
        navigate('/app/dashboard', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string } };
      };
      const errorMessage =
        axiosError.response?.data?.message ||
        (err instanceof Error ? err.message : null) ||
        'Invalid email or password. Please try again.';

      if (errorMessage.startsWith('EMAIL_NOT_VERIFIED:')) {
        const parts = errorMessage.split(':');
        if (parts.length >= 3) {
          const email = parts[1];
          const message = parts.slice(2).join(':');
          navigate('/resend-verification', { state: { email, message } });
          return;
        }
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your Accurify account">
      {error && (
        <div className="mb-4 p-3 bg-danger-light border-l-4 border-danger rounded text-sm text-danger-dark">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div>
          <label
            htmlFor="email"
            className="block text-label-01 text-gray-70 mb-1.5"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="e.g joe@acmecorp.com"
            autoComplete="email"
            className={`w-full h-12 px-4 bg-gray-10 border text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.email ? 'border-danger' : 'border-gray-30'
            }`}
            {...register('email')}
          />
          {errors.email && (
            <p className="mt-1 text-helper-01 text-danger">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-label-01 text-gray-70 mb-1.5"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Type here..."
              autoComplete="current-password"
              className={`w-full h-12 px-4 pr-12 bg-gray-10 border text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.password ? 'border-danger' : 'border-gray-30'
              }`}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-50 p-1"
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.092 1.092a4 4 0 00-5.558-5.558z"
                    clipRule="evenodd"
                  />
                  <path d="M10.748 13.93l2.523 2.523A9.987 9.987 0 0110 17c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 012.838-4.826L6.29 8.17A4 4 0 0010.749 13.93z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                  <path
                    fillRule="evenodd"
                    d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-helper-01 text-danger">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="text-right">
          <Link
            to="/forgot-password"
            className="text-body-01 text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-primary text-white font-medium text-body-01 hover:bg-primary-600 active:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              <span>Signing in...</span>
            </div>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-body-01 text-gray-60">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-primary font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}
