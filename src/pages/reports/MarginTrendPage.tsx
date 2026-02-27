import { useState, useCallback } from 'react';
import { useMarginTrend } from '@/queries/gl.queries';
import type { MonthlyMargin, MarginAlert } from '@/queries/gl.queries';
import { Card } from '@/components/ui/Card';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatCurrency } from '@/utils/currency';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useQueryClient } from '@tanstack/react-query';
import { ExclamationTriangleIcon, DocumentChartBarIcon } from '@heroicons/react/24/outline';

const MONTH_OPTIONS = [3, 6, 12] as const;

function getMarginBadge(percent: number): string {
  if (percent >= 20) return 'bg-green-100 text-green-700';
  if (percent >= 0) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
}

function getAlertClasses(severity: MarginAlert['severity']): string {
  switch (severity) {
    case 'CRITICAL':
      return 'bg-red-50 border-red-200 text-red-700';
    case 'WARNING':
      return 'bg-yellow-50 border-yellow-200 text-yellow-700';
    case 'INFO':
    default:
      return 'bg-blue-50 border-blue-200 text-blue-700';
  }
}

function getTrendDisplay(trend: 'UP' | 'DOWN' | 'STABLE'): { label: string; color: string } {
  switch (trend) {
    case 'UP':
      return { label: 'Trending Up', color: 'text-success' };
    case 'DOWN':
      return { label: 'Trending Down', color: 'text-danger' };
    case 'STABLE':
    default:
      return { label: 'Stable', color: 'text-gray-70' };
  }
}

function MonthRow({ month }: { month: MonthlyMargin }) {
  const badgeClass = getMarginBadge(month.marginPercent);
  return (
    <div className="px-4 py-3 border-b border-gray-10 last:border-b-0">
      <div className="flex items-center justify-between mb-2">
        <p className="text-body-01 font-medium text-gray-100">{month.month}</p>
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${badgeClass}`}>
          {month.marginPercent.toFixed(1)}%
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-helper-01 text-gray-40">Revenue</p>
          <p className="text-body-01 tabular-nums text-gray-100">{formatCurrency(month.revenue)}</p>
        </div>
        <div>
          <p className="text-helper-01 text-gray-40">COGS</p>
          <p className="text-body-01 tabular-nums text-gray-100">{formatCurrency(month.cogs)}</p>
        </div>
        <div>
          <p className="text-helper-01 text-gray-40">Gross Profit</p>
          <p className={`text-body-01 tabular-nums font-medium ${month.grossProfit >= 0 ? 'text-success' : 'text-danger'}`}>
            {formatCurrency(month.grossProfit)}
          </p>
        </div>
      </div>
    </div>
  );
}

function AlertCard({ alert }: { alert: MarginAlert }) {
  const classes = getAlertClasses(alert.severity);
  return (
    <div className={`rounded-lg border px-3 py-2.5 ${classes}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${classes}`}>
              {alert.severity}
            </span>
            <span className="text-helper-01 opacity-70">{alert.period}</span>
          </div>
          <p className="text-body-01">{alert.message}</p>
        </div>
      </div>
    </div>
  );
}

export function MarginTrendPage() {
  const queryClient = useQueryClient();
  const [months, setMonths] = useState<number>(6);

  const { data, isLoading, isError, error } = useMarginTrend(months);

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['gl'] });
  }, [queryClient]);

  const { containerRef, PullIndicator } = usePullToRefresh({ onRefresh: handleRefresh });

  const trendDisplay = data ? getTrendDisplay(data.trend) : null;

  return (
    <>
      <PageHeader title="Margin Trend" backTo="/app/dashboard" />
      <div className="page-content space-y-4 pb-24" ref={containerRef}>
        <PullIndicator />

        {/* Period toggle: 3M | 6M | 12M */}
        <Card>
          <div className="flex rounded-lg bg-gray-10 p-1">
            {MONTH_OPTIONS.map((m) => (
              <button
                key={m}
                onClick={() => setMonths(m)}
                className={`flex-1 py-2 text-body-01 font-medium rounded-md transition-colors ${
                  months === m
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-gray-50'
                }`}
              >
                {m}M
              </button>
            ))}
          </div>
        </Card>

        {isLoading && <DashboardSkeleton />}

        {isError && (
          <Card>
            <div className="flex flex-col items-center py-6 text-center">
              <ExclamationTriangleIcon className="w-10 h-10 text-gray-40 mb-3" />
              <p className="text-body-01 text-gray-70 mb-1">
                Failed to load margin trend report
              </p>
              <p className="text-helper-01 text-gray-50 mb-4">
                {(error as Error)?.message || 'Please try again later.'}
              </p>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-primary text-white text-body-01 font-medium rounded-lg"
              >
                Retry
              </button>
            </div>
          </Card>
        )}

        {!isLoading && !isError && !data && (
          <Card>
            <div className="flex flex-col items-center py-8 text-center">
              <DocumentChartBarIcon className="w-10 h-10 text-gray-30 mb-3" />
              <p className="text-body-01 font-medium text-gray-70 mb-1">
                No margin data available
              </p>
              <p className="text-helper-01 text-gray-50">
                Create invoices and record COGS to see margin trends.
              </p>
            </div>
          </Card>
        )}

        {!isLoading && !isError && data && (
          <>
            {/* Summary metric cards — 3 across */}
            <div className="grid grid-cols-3 gap-3">
              <Card>
                <p className="text-helper-01 text-gray-50 mb-1">Current Margin</p>
                <p className={`text-heading-03 font-semibold tabular-nums ${
                  data.currentMonthMargin >= 20 ? 'text-success' :
                  data.currentMonthMargin >= 0 ? 'text-warning-dark' : 'text-danger'
                }`}>
                  {data.currentMonthMargin.toFixed(1)}%
                </p>
              </Card>
              <Card>
                <p className="text-helper-01 text-gray-50 mb-1">Trend</p>
                <p className={`text-heading-03 font-semibold ${trendDisplay?.color}`}>
                  {trendDisplay?.label ?? '—'}
                </p>
              </Card>
              <Card>
                <p className="text-helper-01 text-gray-50 mb-1">Period Change</p>
                <p className={`text-heading-03 font-semibold tabular-nums ${data.changePercent >= 0 ? 'text-success' : 'text-danger'}`}>
                  {data.changePercent >= 0 ? '+' : ''}{data.changePercent.toFixed(1)}%
                </p>
              </Card>
            </div>

            {/* Monthly Data */}
            {data.monthlyData.length > 0 && (
              <Card padding={false}>
                <div className="px-4 py-3 border-b border-gray-10">
                  <p className="text-label-01 text-gray-50 font-medium">Monthly Data</p>
                </div>
                {data.monthlyData.map((month, idx) => (
                  <MonthRow key={`${month.month}-${idx}`} month={month} />
                ))}
              </Card>
            )}

            {/* Alerts */}
            {data.alerts.length > 0 && (
              <div className="space-y-2">
                <p className="text-label-01 text-gray-50 font-medium px-1">
                  Alerts ({data.alerts.length})
                </p>
                {data.alerts.map((alert, idx) => (
                  <AlertCard key={idx} alert={alert} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
