import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '@/queries';
import { useCashFlowForecast, useMarginTrend } from '@/queries/gl.queries';
import type { CashFlowForecast, MarginTrendReport } from '@/queries/gl.queries';
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
  ArrowTrendingDownIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  CubeIcon,
  ShoppingCartIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

function CashFlowForecastSection({ forecast }: { forecast: CashFlowForecast }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
          <CurrencyDollarIcon className="w-4 h-4 text-blue-600" />
        </div>
        <h2 className="text-heading-01 text-gray-100">Cash Flow Forecast</h2>
      </div>

      {/* Hero: Current Cash Balance */}
      <Card className="mb-3">
        <p className="text-label-01 text-gray-50 uppercase tracking-wide">Current Cash Balance</p>
        <p className="text-[1.75rem] font-bold tabular-nums text-gray-100 leading-tight mt-1">
          {formatCurrency(forecast.currentCashBalance)}
        </p>
      </Card>

      {/* Period projections — horizontal scroll */}
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1">
        {forecast.periods.map((period) => {
          const isPositive = period.netCashFlow >= 0;
          return (
            <Card
              key={period.label}
              className={`min-w-[170px] flex-shrink-0 snap-start border-l-[3px] ${isPositive ? 'border-l-green-500' : 'border-l-red-500'}`}
            >
              <p className="text-[0.65rem] font-semibold text-gray-50 uppercase tracking-wide mb-1">
                {period.label}
              </p>
              <p className="text-lg font-bold tabular-nums text-gray-100 leading-tight">
                {formatCurrency(period.projectedBalance)}
              </p>
              <p className={`text-sm font-semibold tabular-nums mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '+' : ''}{formatCurrency(period.netCashFlow)}
              </p>
              <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-100/10">
                <span className="inline-flex items-center gap-0.5 text-[0.7rem] tabular-nums text-gray-50">
                  <ArrowDownIcon className="w-3 h-3 text-green-600" />
                  {formatCurrency(period.expectedInflows)}
                </span>
                <span className="inline-flex items-center gap-0.5 text-[0.7rem] tabular-nums text-gray-50">
                  <ArrowUpIcon className="w-3 h-3 text-red-600" />
                  {formatCurrency(period.expectedOutflows)}
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function MarginTrendSection({ trend }: { trend: MarginTrendReport }) {
  const trendIcon = trend.trend === 'UP'
    ? <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />
    : trend.trend === 'DOWN'
      ? <ArrowTrendingDownIcon className="w-4 h-4 text-red-600" />
      : <ChartBarIcon className="w-4 h-4 text-gray-50" />;

  const trendColor = trend.trend === 'UP' ? 'text-green-600' : trend.trend === 'DOWN' ? 'text-red-600' : 'text-gray-70';

  const latestAlert = trend.alerts.length > 0 ? trend.alerts[trend.alerts.length - 1] : null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center">
          <ChartBarIcon className="w-4 h-4 text-purple-600" />
        </div>
        <h2 className="text-heading-01 text-gray-100">Gross Margin Trend</h2>
      </div>
      <Card>
        {/* Hero: Current margin */}
        <div className="mb-3">
          <p className={`text-[2rem] font-bold tabular-nums leading-tight ${trendColor}`}>
            {trend.currentMonthMargin.toFixed(1)}%
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            {trendIcon}
            <span className={`text-sm font-medium tabular-nums ${trendColor}`}>
              {trend.changePercent >= 0 ? '+' : ''}{trend.changePercent.toFixed(1)}%
            </span>
            <span className="text-helper-01 text-gray-40">vs last month</span>
          </div>
        </div>

        {/* Previous month context */}
        <div className="flex items-center justify-between py-2 border-t border-gray-100/10">
          <span className="text-helper-01 text-gray-40">Previous month</span>
          <span className="text-body-01 font-medium tabular-nums text-gray-70">
            {trend.previousMonthMargin.toFixed(1)}%
          </span>
        </div>
      </Card>

      {/* Alert */}
      {latestAlert && (
        <div className={`mt-2 rounded-lg px-3 py-2.5 flex items-start gap-2 ${
          latestAlert.severity === 'CRITICAL' ? 'bg-red-50' :
          latestAlert.severity === 'WARNING' ? 'bg-yellow-50' : 'bg-blue-50'
        }`}>
          <ExclamationTriangleIcon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
            latestAlert.severity === 'CRITICAL' ? 'text-red-600' :
            latestAlert.severity === 'WARNING' ? 'text-yellow-600' : 'text-blue-600'
          }`} />
          <p className={`text-helper-01 font-medium ${
            latestAlert.severity === 'CRITICAL' ? 'text-red-700' :
            latestAlert.severity === 'WARNING' ? 'text-yellow-700' : 'text-blue-700'
          }`}>
            {latestAlert.message}
          </p>
        </div>
      )}
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: dashboard, isLoading } = useDashboard();
  const { data: cashFlowForecast, isLoading: isCashFlowLoading } = useCashFlowForecast();
  const { data: marginTrend, isLoading: isMarginLoading } = useMarginTrend(6);
  const business = useBusinessStore((s) => s.business);
  const isGoodsBusiness = business?.type === BusinessType.GOODS;

  const handleRefresh = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      queryClient.invalidateQueries({ queryKey: ['gl'] }),
    ]);
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
    ...(dashboard.netProfit != null
      ? [
          {
            label: 'Net Profit',
            value: formatCurrency(dashboard.netProfit),
            icon: ChartBarIcon,
            color: dashboard.netProfit >= 0 ? 'text-success' : 'text-danger',
            bgColor: dashboard.netProfit >= 0 ? 'bg-success-light' : 'bg-danger-light',
            sub: dashboard.grossMarginPercent != null
              ? `${dashboard.grossMarginPercent.toFixed(1)}% margin`
              : undefined,
          },
        ]
      : []),
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

      {/* Cash Flow Forecast - premium only */}
      {!isCashFlowLoading && cashFlowForecast && (
        <CashFlowForecastSection forecast={cashFlowForecast} />
      )}

      {/* Margin Trend - premium only */}
      {!isMarginLoading && marginTrend && (
        <MarginTrendSection trend={marginTrend} />
      )}

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
