import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { authApi } from '@/services/api';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await authApi.forgotPassword(data.email);
      setSuccess(true);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to send reset email. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle="Password reset instructions have been sent"
      >
        <div className="space-y-4">
          <div className="p-4 bg-success-light border-l-4 border-success rounded text-sm text-success-dark">
            If an account exists with this email, you will receive password
            reset instructions.
          </div>
          <p className="text-center text-body-01 text-gray-60">
            Remember your password?{' '}
            <Link
              to="/login"
              className="text-primary font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="Enter your email to receive reset instructions"
    >
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

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-primary text-white font-medium text-body-01 hover:bg-primary-600 active:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              <span>Sending...</span>
            </div>
          ) : (
            'Send reset instructions'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-body-01 text-gray-60">
        Remember your password?{' '}
        <Link to="/login" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
