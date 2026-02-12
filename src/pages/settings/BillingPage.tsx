import { useCallback } from 'react';
import {
  useSubscription,
  usePaymentHistory,
  useInitializePayment,
  useStartTrial,
} from '@/queries';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useQueryClient } from '@tanstack/react-query';
import { useUIStore } from '@/store/ui.store';
import { SubscriptionPlan, SubscriptionStatus } from '@/types/enums';
import {
  CheckCircleIcon,
  SparklesIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'gray'> = {
  ACTIVE: 'success',
  TRIALING: 'info',
  PAST_DUE: 'warning',
  CANCELLED: 'danger',
  EXPIRED: 'gray',
};

const paymentStatusVariant: Record<string, 'success' | 'warning' | 'danger' | 'gray'> = {
  SUCCESS: 'success',
  PENDING: 'warning',
  FAILED: 'danger',
  REFUNDED: 'gray',
};

const planLabels: Record<string, string> = {
  FREE: 'Free',
  PREMIUM_MONTHLY: 'Premium Monthly',
  PREMIUM_YEARLY: 'Premium Yearly',
};

interface PlanOption {
  plan: SubscriptionPlan;
  label: string;
  price: string;
  period: string;
  savings?: string;
}

const plans: PlanOption[] = [
  {
    plan: SubscriptionPlan.FREE,
    label: 'Free',
    price: 'NGN 0',
    period: 'forever',
  },
  {
    plan: SubscriptionPlan.PREMIUM_MONTHLY,
    label: 'Premium Monthly',
    price: 'NGN 9,999',
    period: '/month',
  },
  {
    plan: SubscriptionPlan.PREMIUM_YEARLY,
    label: 'Premium Yearly',
    price: 'NGN 99,999',
    period: '/year',
    savings: '2 months free',
  },
];

const premiumFeatures = [
  'Unlimited invoices',
  'Unlimited clients',
  'Income Statement & Balance Sheet',
  'General Ledger & Journal Entries',
  'Tax Dashboard',
  'Accurify Pay (online payments)',
  'Bank statement reconciliation',
  'PDF export & custom branding',
];

export function BillingPage() {
  const queryClient = useQueryClient();
  const showNotification = useUIStore((s) => s.showNotification);
  const { data: subscription, isLoading: subLoading } = useSubscription();
  const { data: history, isLoading: historyLoading } = usePaymentHistory();
  const initPayment = useInitializePayment();
  const startTrial = useStartTrial();

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['subscription'] });
  }, [queryClient]);

  const { containerRef, PullIndicator } = usePullToRefresh({ onRefresh: handleRefresh });

  const handleUpgrade = async (plan: SubscriptionPlan) => {
    if (plan === SubscriptionPlan.FREE) return;
    try {
      const result = await initPayment.mutateAsync(plan);
      // Redirect to Paystack
      window.location.href = result.authorizationUrl;
    } catch {
      showNotification('Error', 'Failed to initialize payment', 'error');
    }
  };

  const handleStartTrial = async () => {
    try {
      await startTrial.mutateAsync();
      showNotification('Success', 'Free trial started! Enjoy 30 days of Premium.', 'success');
    } catch {
      showNotification('Error', 'Failed to start trial', 'error');
    }
  };

  if (subLoading) {
    return (
      <>
        <PageHeader title="Billing" backTo="/app/settings" />
        <DashboardSkeleton />
      </>
    );
  }

  const isFree = subscription?.plan === SubscriptionPlan.FREE;
  const isPremium = subscription?.isPremium;
  const isTrialing = subscription?.isTrialing;

  return (
    <>
      <PageHeader title="Billing" backTo="/app/settings" />
      <div className="page-content space-y-4" ref={containerRef}>
        <PullIndicator />

        {/* Current plan */}
        <Card>
          <div className="flex items-center justify-between mb-2">
            <p className="text-heading-02 text-gray-100">Current Plan</p>
            <Badge variant={statusVariant[subscription?.status ?? 'ACTIVE'] ?? 'gray'}>
              {subscription?.status === SubscriptionStatus.TRIALING ? 'Trial' : subscription?.status}
            </Badge>
          </div>
          <p className="text-heading-03 text-primary mb-1">
            {planLabels[subscription?.plan ?? 'FREE'] ?? subscription?.plan}
          </p>
          {isTrialing && subscription?.trialDaysRemaining != null && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-helper-01 text-gray-50">Trial remaining</span>
                <span className="text-helper-01 text-primary font-medium">
                  {subscription.trialDaysRemaining} days
                </span>
              </div>
              <div className="h-1.5 bg-gray-10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${Math.max(0, Math.min(100, (subscription.trialDaysRemaining / 30) * 100))}%` }}
                />
              </div>
            </div>
          )}
          {isPremium && subscription?.currentPeriodEndsAt && (
            <p className="text-helper-01 text-gray-50 mt-1">
              Next billing: {formatDate(subscription.currentPeriodEndsAt)}
            </p>
          )}
        </Card>

        {/* Trial banner for free users */}
        {isFree && !isTrialing && (
          <Card className="border border-primary bg-primary-50/30">
            <div className="flex items-start gap-3">
              <SparklesIcon className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-body-01 font-medium text-gray-100 mb-1">
                  Try Premium Free for 30 Days
                </p>
                <p className="text-helper-01 text-gray-60 mb-3">
                  Get access to all features including reports, tax dashboard, and online payments.
                </p>
                <button
                  onClick={handleStartTrial}
                  disabled={startTrial.isPending}
                  className="h-10 px-6 bg-primary text-white font-medium text-body-01 rounded-lg disabled:opacity-50"
                >
                  {startTrial.isPending ? 'Starting...' : 'Start Free Trial'}
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* Plan options */}
        <div>
          <h2 className="text-heading-01 text-gray-100 mb-3">Plans</h2>
          <div className="space-y-3">
            {plans.map((option) => {
              const isActive = subscription?.plan === option.plan;
              return (
                <Card
                  key={option.plan}
                  className={clsx(isActive && 'border-2 border-primary')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <p className="text-body-01 font-medium text-gray-100">{option.label}</p>
                      {option.savings && (
                        <Badge variant="success">{option.savings}</Badge>
                      )}
                    </div>
                    {isActive && <Badge variant="info">Current</Badge>}
                  </div>
                  <p className="text-heading-03 text-gray-100 tabular-nums">
                    {option.price}
                    <span className="text-body-01 text-gray-50 font-normal"> {option.period}</span>
                  </p>
                  {!isActive && option.plan !== SubscriptionPlan.FREE && (
                    <button
                      onClick={() => handleUpgrade(option.plan)}
                      disabled={initPayment.isPending}
                      className="w-full mt-3 h-10 bg-primary text-white font-medium text-body-01 rounded-lg disabled:opacity-50"
                    >
                      {initPayment.isPending ? 'Processing...' : 'Upgrade'}
                    </button>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* Premium features */}
        <Card>
          <p className="text-label-01 text-gray-70 font-medium mb-3">Premium Features</p>
          <div className="space-y-2">
            {premiumFeatures.map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-success flex-shrink-0" />
                <span className="text-body-01 text-gray-70">{feature}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Payment history */}
        <div>
          <h2 className="text-heading-01 text-gray-100 mb-3">Billing History</h2>
          {historyLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse h-16"><div /></Card>
              ))}
            </div>
          ) : !history || history.length === 0 ? (
            <EmptyState
              icon={CreditCardIcon}
              title="No billing history"
              description="Your payment history will appear here."
            />
          ) : (
            <Card padding={false}>
              <div className="divide-y divide-gray-10">
                {history.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-body-01 text-gray-100">
                        {planLabels[payment.plan] ?? payment.plan}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant={paymentStatusVariant[payment.status] ?? 'gray'}>
                          {payment.status}
                        </Badge>
                        <span className="text-helper-01 text-gray-40">
                          {formatDate(payment.createdAt)}
                        </span>
                      </div>
                    </div>
                    <p className="text-body-01 font-medium tabular-nums text-gray-100 flex-shrink-0">
                      {formatCurrency(payment.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
