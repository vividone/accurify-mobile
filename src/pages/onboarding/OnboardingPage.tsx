import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { businessApi } from '@/services/api';
import { useBusinessStore } from '@/store/business.store';
import { BusinessType, Industry, INDUSTRY_META } from '@/types';
import accurifyLogo from '@/assets/accurify-logo.svg';

const onboardingSchema = z.object({
  name: z.string().min(1, 'Business name is required'),
  type: z.nativeEnum(BusinessType),
  industry: z.nativeEnum(Industry).optional(),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email().optional().or(z.literal('')),
  fiscalYearStartMonth: z.number().min(1).max(12),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

export function OnboardingPage() {
  const navigate = useNavigate();
  const setBusiness = useBusinessStore((s) => s.setBusiness);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: '',
      type: BusinessType.SERVICE,
      industry: Industry.GENERAL,
      address: '',
      phone: '',
      email: '',
      fiscalYearStartMonth: 1,
    },
  });

  const onSubmit = async (data: OnboardingFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const business = await businessApi.create({
        name: data.name,
        type: data.type,
        industry: data.industry,
        address: data.address,
        phone: data.phone,
        email: data.email || undefined,
        fiscalYearStartMonth: data.fiscalYearStartMonth,
      });
      setBusiness(business);
      navigate('/app/dashboard', { replace: true });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to set up business';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 pt-12 pb-6">
        <div className="flex items-center gap-2 mb-6">
          <img src={accurifyLogo} alt="Accurify" className="h-7 w-auto" />
        </div>
        <h1 className="text-heading-04 text-gray-100">Set up your business</h1>
        <p className="mt-2 text-body-02 text-gray-60">
          Tell us about your business to get started.
        </p>
      </div>

      <div className="px-6 pb-8">
        {error && (
          <div className="mb-4 p-3 bg-danger-light border-l-4 border-danger rounded text-sm text-danger-dark">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div>
            <label className="block text-label-01 text-gray-70 mb-1.5">
              Business Name
            </label>
            <input
              type="text"
              placeholder="e.g Acme Corp Ltd"
              className={`w-full h-12 px-4 bg-gray-10 border text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.name ? 'border-danger' : 'border-gray-30'
              }`}
              {...register('name')}
            />
            {errors.name && (
              <p className="mt-1 text-helper-01 text-danger">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-label-01 text-gray-70 mb-1.5">
              Business Type
            </label>
            <select
              className="w-full h-12 px-4 bg-gray-10 border border-gray-30 text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
              {...register('type')}
            >
              <option value={BusinessType.SERVICE}>Service</option>
              <option value={BusinessType.GOODS}>Goods</option>
            </select>
          </div>

          <div>
            <label className="block text-label-01 text-gray-70 mb-1.5">
              Industry
            </label>
            <select
              className="w-full h-12 px-4 bg-gray-10 border border-gray-30 text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
              {...register('industry')}
            >
              {Object.entries(INDUSTRY_META).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.displayName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-label-01 text-gray-70 mb-1.5">
              Business Address
            </label>
            <input
              type="text"
              placeholder="e.g 123 Main Street, Lagos"
              className={`w-full h-12 px-4 bg-gray-10 border text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.address ? 'border-danger' : 'border-gray-30'
              }`}
              {...register('address')}
            />
            {errors.address && (
              <p className="mt-1 text-helper-01 text-danger">
                {errors.address.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-label-01 text-gray-70 mb-1.5">
              Phone Number
            </label>
            <input
              type="tel"
              inputMode="tel"
              placeholder="e.g 08012345678"
              className={`w-full h-12 px-4 bg-gray-10 border text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.phone ? 'border-danger' : 'border-gray-30'
              }`}
              {...register('phone')}
            />
            {errors.phone && (
              <p className="mt-1 text-helper-01 text-danger">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-label-01 text-gray-70 mb-1.5">
              Business Email (optional)
            </label>
            <input
              type="email"
              placeholder="e.g info@acmecorp.com"
              className="w-full h-12 px-4 bg-gray-10 border border-gray-30 text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              {...register('email')}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-primary text-white font-medium text-body-01 hover:bg-primary-600 active:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span>Setting up...</span>
              </div>
            ) : (
              'Get Started'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
