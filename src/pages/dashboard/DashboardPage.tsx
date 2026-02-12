import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '@/queries';
import { Card } from '@/components/ui/Card';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/utils/currency';
import { formatRelative } from '@/utils/date';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useQueryClient } from '@tanstack/react-query';
import { useBusinessStore } from '@/store/business.store';
import { BusinessType } from '@/types/enums';
import {
  BanknotesIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  CubeIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline';

export function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: dashboard, isLoading } = useDashboard();
  const business = useBusinessStore((s) => s.business);
  const isGoodsBusiness = business?.type === BusinessType.GOODS;

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  }, [queryClient]);

  const { containerRef, PullIndicator } = usePullToRefresh({ onRefresh: handleRefresh });

  if (isLoading || !dashboard) {
    return <DashboardSkeleton />;
  }

  const summaryCards = [
    {
      label: 'Revenue',
      value: formatCurrency(dashboard.thisMonthRevenue),
      icon: BanknotesIcon,
      color: 'text-success',
      bgColor: 'bg-success-light',
    },
    {
      label: 'Outstanding',
      value: formatCurrency(dashboard.unpaidInvoicesTotal),
      icon: ClockIcon,
      color: 'text-primary',
      bgColor: 'bg-primary-50',
      sub: `${dashboard.unpaidInvoicesCount} invoices`,
    },
    {
      label: 'Growth',
      value: `${dashboard.revenueChangePercent >= 0 ? '+' : ''}${dashboard.revenueChangePercent.toFixed(1)}%`,
      icon: ArrowTrendingUpIcon,
      color: dashboard.revenueChangePercent >= 0 ? 'text-success' : 'text-danger',
      bgColor: dashboard.revenueChangePercent >= 0 ? 'bg-success-light' : 'bg-danger-light',
      sub: 'vs last month',
    },
    {
      label: 'Uncategorized',
      value: String(dashboard.uncategorizedTransactionsCount),
      icon: ExclamationTriangleIcon,
      color: 'text-warning-dark',
      bgColor: 'bg-warning-light',
      sub: 'transactions',
    },
  ];

  const quickActions = [
    {
      label: 'New Invoice',
      icon: DocumentTextIcon,
      onClick: () => navigate('/app/invoices/new'),
    },
    {
      label: 'New Bill',
      icon: ClipboardDocumentListIcon,
      onClick: () => navigate('/app/bills/new'),
    },
    ...(isGoodsBusiness
      ? [
          {
            label: 'POS Sale',
            icon: ShoppingCartIcon,
            onClick: () => navigate('/app/pos'),
          },
          {
            label: 'Products',
            icon: CubeIcon,
            onClick: () => navigate('/app/products'),
          },
        ]
      : [
          {
            label: 'Clients',
            icon: UserGroupIcon,
            onClick: () => navigate('/app/clients'),
          },
        ]),
  ];

  return (
    <div className="page-content space-y-5" ref={containerRef}>
      <PullIndicator />
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        {summaryCards.map((card) => (
          <Card key={card.label}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-7 h-7 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            <p className="text-label-01 text-gray-50">{card.label}</p>
            <p className={`text-heading-03 tabular-nums ${card.color}`}>
              {card.value}
            </p>
            {card.sub && (
              <p className="text-helper-01 text-gray-40 mt-0.5">{card.sub}</p>
            )}
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-heading-01 text-gray-100 mb-3">Quick Actions</h2>
        <div className="flex gap-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className="flex-1 flex flex-col items-center gap-2 p-4 bg-white rounded-lg shadow-card active:shadow-card-hover transition-shadow"
            >
              <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center">
                <action.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-label-01 text-gray-70">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      {dashboard.recentActivity.length > 0 && (
        <div>
          <h2 className="text-heading-01 text-gray-100 mb-3">
            Recent Activity
          </h2>
          <Card padding={false}>
            <div className="divide-y divide-gray-10">
              {dashboard.recentActivity.slice(0, 5).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-body-01 text-gray-100 truncate">
                      {activity.description}
                    </p>
                    <p className="text-helper-01 text-gray-40">
                      {formatRelative(activity.timestamp)}
                    </p>
                  </div>
                  {activity.amount != null && (
                    <span className="text-body-01 font-medium tabular-nums text-gray-100 flex-shrink-0">
                      {formatCurrency(activity.amount)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
