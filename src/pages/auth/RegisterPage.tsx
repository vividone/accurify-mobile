import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { authApi } from '@/services/api';

type AccountType = 'BUSINESS' | 'ACCOUNTANT';

const registerSchema = z
  .object({
    accountType: z.enum(['BUSINESS', 'ACCOUNTANT']),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: 'You must agree to the Terms of Service and Privacy Policy',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

function PasswordStrengthMeter({ password }: { password?: string }) {
  if (!password) return null;

  const getStrength = (p: string) => {
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[a-z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

  const strength = getStrength(password);
  const labels = ['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'];
  const colors = [
    'bg-danger',
    'bg-orange-500',
    'bg-warning',
    'bg-success',
    'bg-success-dark',
  ];

  return (
    <div className="flex items-center gap-2 mt-1.5">
      <div className="flex gap-1 flex-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full ${
              i < strength ? colors[strength - 1] : 'bg-gray-20'
            }`}
          />
        ))}
      </div>
      {strength > 0 && (
        <span className="text-helper-01 text-gray-60">
          {labels[strength - 1]}
        </span>
      )}
    </div>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      accountType: 'BUSINESS',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
  });

  const accountType = watch('accountType');
  const passwordValue = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await authApi.register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        accountType: data.accountType,
      });
      setSuccess(true);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle="We've sent a verification link to your email address"
      >
        <div className="space-y-4">
          <div className="p-4 bg-success-light border-l-4 border-success rounded text-sm text-success-dark">
            Please check your email and click the verification link to activate
            your account.
          </div>
          <button
            onClick={() => navigate('/login')}
            className="w-full h-12 bg-primary text-white font-medium text-body-01 hover:bg-primary-600 transition-colors"
          >
            Back to Sign In
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle={
        accountType === 'BUSINESS'
          ? 'Start managing your business with Accurify'
          : 'Manage your clients with Accurify'
      }
    >
      {error && (
        <div className="mb-4 p-3 bg-danger-light border-l-4 border-danger rounded text-sm text-danger-dark">
          {error}
        </div>
      )}

      {/* Account type selector */}
      <div className="flex gap-3 mb-6">
        {(['BUSINESS', 'ACCOUNTANT'] as AccountType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setValue('accountType', type)}
            className={`flex-1 p-3 border-2 rounded-lg text-left transition-colors ${
              accountType === type
                ? 'border-primary bg-primary-50'
                : 'border-gray-20 bg-white'
            }`}
          >
            <span className="block text-body-01 font-medium text-gray-100">
              {type === 'BUSINESS' ? 'Business' : 'Accountant'}
            </span>
            <span className="block text-helper-01 text-gray-50 mt-0.5">
              {type === 'BUSINESS' ? 'I run a business' : 'I manage clients'}
            </span>
          </button>
        ))}
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="firstName"
              className="block text-label-01 text-gray-70 mb-1.5"
            >
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              placeholder="e.g John"
              autoComplete="given-name"
              className={`w-full h-12 px-4 bg-gray-10 border text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.firstName ? 'border-danger' : 'border-gray-30'
              }`}
              {...register('firstName')}
            />
            {errors.firstName && (
              <p className="mt-1 text-helper-01 text-danger">
                {errors.firstName.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="lastName"
              className="block text-label-01 text-gray-70 mb-1.5"
            >
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              placeholder="e.g Doe"
              autoComplete="family-name"
              className={`w-full h-12 px-4 bg-gray-10 border text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.lastName ? 'border-danger' : 'border-gray-30'
              }`}
              {...register('lastName')}
            />
            {errors.lastName && (
              <p className="mt-1 text-helper-01 text-danger">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

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
              placeholder="Min 8 characters"
              autoComplete="new-password"
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5"
              >
                {showPassword ? (
                  <>
                    <path
                      fillRule="evenodd"
                      d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.092 1.092a4 4 0 00-5.558-5.558z"
                      clipRule="evenodd"
                    />
                    <path d="M10.748 13.93l2.523 2.523A9.987 9.987 0 0110 17c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 012.838-4.826L6.29 8.17A4 4 0 0010.749 13.93z" />
                  </>
                ) : (
                  <>
                    <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                    <path
                      fillRule="evenodd"
                      d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </>
                )}
              </svg>
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-helper-01 text-danger">
              {errors.password.message}
            </p>
          )}
          <PasswordStrengthMeter password={passwordValue} />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-label-01 text-gray-70 mb-1.5"
          >
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Re-type your password"
              autoComplete="new-password"
              className={`w-full h-12 px-4 pr-12 bg-gray-10 border text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.confirmPassword ? 'border-danger' : 'border-gray-30'
              }`}
              {...register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-50 p-1"
            >
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
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-helper-01 text-danger">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="pt-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 w-5 h-5 min-w-[1.25rem] accent-primary rounded border-2 border-gray-30"
              {...register('agreeToTerms')}
            />
            <span className="text-body-01 text-gray-60">
              I agree to the{' '}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
                onClick={(e) => e.stopPropagation()}
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
                onClick={(e) => e.stopPropagation()}
              >
                Privacy Policy
              </a>
            </span>
          </label>
          {errors.agreeToTerms && (
            <p className="mt-1 text-helper-01 text-danger">
              {errors.agreeToTerms.message}
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
              <span>Creating account...</span>
            </div>
          ) : (
            'Create my account'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-body-01 text-gray-60">
        Already have an account?{' '}
        <Link to="/login" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
