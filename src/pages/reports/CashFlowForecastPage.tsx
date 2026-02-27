import { useCallback } from 'react';
import { useCashFlowForecast } from '@/queries/gl.queries';
import type { ForecastPeriod, UpcomingReceivable, UpcomingPayable } from '@/queries/gl.queries';
import { Card } from '@/components/ui/Card';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatCurrency } from '@/utils/currency';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useQueryClient } from '@tanstack/react-query';
import { ExclamationTriangleIcon, DocumentChartBarIcon } from '@heroicons/react/24/outline';

function getDaysBadge(days: number): string {
  if (days <= 7) return 'bg-red-100 text-red-700';
  if (days <= 30) return 'bg-yellow-100 text-yellow-700';
  return 'bg-green-100 text-green-700';
}

function PeriodRow({ period }: { period: ForecastPeriod }) {
  return (
    <div className="px-4 py-3 border-b border-gray-10 last:border-b-0">
      <div className="flex items-center justify-between mb-2">
        <p className="text-body-01 font-medium text-gray-100">{period.label}</p>
        <span className={`text-label-01 font-semibold tabular-nums ${period.netCashFlow >= 0 ? 'text-success' : 'text-danger'}`}>
          {period.netCashFlow >= 0 ? '+' : ''}{formatCurrency(period.netCashFlow)}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-helper-01 text-gray-40">Inflows</p>
          <p className="text-body-01 tabular-nums text-success">{formatCurrency(period.expectedInflows)}</p>
        </div>
        <div>
          <p className="text-helper-01 text-gray-40">Outflows</p>
          <p className="text-body-01 tabular-nums text-danger">{formatCurrency(period.expectedOutflows)}</p>
        </div>
        <div>
          <p className="text-helper-01 text-gray-40">Balance</p>
          <p className={`text-body-01 tabular-nums font-medium ${period.projectedBalance >= 0 ? 'text-gray-100' : 'text-danger'}`}>
            {formatCurrency(period.projectedBalance)}
          </p>
        </div>
      </div>
    </div>
  );
}

function ReceivableCard({ item }: { item: UpcomingReceivable }) {
  const badgeClass = getDaysBadge(item.daysUntilDue);
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-10 last:border-b-0">
      <div className="flex-1 min-w-0 mr-3">
        <p className="text-body-01 font-medium text-gray-100 truncate">{item.clientName}</p>
        <p className="text-helper-01 text-gray-40">{item.invoiceNumber} · Due {item.dueDate}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <p className="text-body-01 font-semibold tabular-nums text-gray-100">{formatCurrency(item.amount)}</p>
        <span className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${badgeClass}`}>
          {item.daysUntilDue}d
        </span>
      </div>
    </div>
  );
}

function PayableCard({ item }: { item: UpcomingPayable }) {
  const badgeClass = getDaysBadge(item.daysUntilDue);
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-10 last:border-b-0">
      <div className="flex-1 min-w-0 mr-3">
        <p className="text-body-01 font-medium text-gray-100 truncate">{item.supplierName}</p>
        <p className="text-helper-01 text-gray-40">Due {item.dueDate}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <p className="text-body-01 font-semibold tabular-nums text-gray-100">{formatCurrency(item.amount)}</p>
        <span className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${badgeClass}`}>
          {item.daysUntilDue}d
        </span>
      </div>
    </div>
  );
}

export function CashFlowForecastPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useCashFlowForecast();

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['gl'] });
  }, [queryClient]);

  const { containerRef, PullIndicator } = usePullToRefresh({ onRefresh: handleRefresh });

  const period7 = data?.periods.find((p) => p.days === 7);
  const period30 = data?.periods.find((p) => p.days === 30);
  const period90 = data?.periods.find((p) => p.days === 90);

  const sortedReceivables = data?.upcomingReceivables
    .slice()
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue) ?? [];

  const sortedPayables = data?.upcomingPayables
    .slice()
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue) ?? [];

  return (
    <>
      <PageHeader title="Cash Flow Forecast" backTo="/app/dashboard" />
      <div className="page-content space-y-4 pb-24" ref={containerRef}>
        <PullIndicator />

        {isLoading && <DashboardSkeleton />}

        {isError && (
          <Card>
            <div className="flex flex-col items-center py-6 text-center">
              <ExclamationTriangleIcon className="w-10 h-10 text-gray-40 mb-3" />
              <p className="text-body-01 text-gray-70 mb-1">
                Failed to load cash flow forecast
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
                No forecast data available
              </p>
              <p className="text-helper-01 text-gray-50">
                Add invoices and bills to generate a cash flow forecast.
              </p>
            </div>
          </Card>
        )}

        {!isLoading && !isError && data && (
          <>
            {/* Summary metric cards — 2×2 grid */}
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <p className="text-label-01 text-gray-50">Current Cash</p>
                <p className="text-heading-03 font-semibold tabular-nums text-gray-100">
                  {formatCurrency(data.currentCashBalance)}
                </p>
              </Card>
              <Card>
                <p className="text-label-01 text-gray-50">+7 Days</p>
                <p className={`text-heading-03 font-semibold tabular-nums ${period7 && period7.projectedBalance >= 0 ? 'text-success' : 'text-danger'}`}>
                  {period7 ? formatCurrency(period7.projectedBalance) : '—'}
                </p>
              </Card>
              <Card>
                <p className="text-label-01 text-gray-50">+30 Days</p>
                <p className={`text-heading-03 font-semibold tabular-nums ${period30 && period30.projectedBalance >= 0 ? 'text-success' : 'text-danger'}`}>
                  {period30 ? formatCurrency(period30.projectedBalance) : '—'}
                </p>
              </Card>
              <Card>
                <p className="text-label-01 text-gray-50">+90 Days</p>
                <p className={`text-heading-03 font-semibold tabular-nums ${period90 && period90.projectedBalance >= 0 ? 'text-success' : 'text-danger'}`}>
                  {period90 ? formatCurrency(period90.projectedBalance) : '—'}
                </p>
              </Card>
            </div>

            {/* As-of date note */}
            <p className="text-helper-01 text-gray-40 px-1">As of {data.asOfDate}</p>

            {/* Forecast Periods */}
            {data.periods.length > 0 && (
              <Card padding={false}>
                <div className="px-4 py-3 border-b border-gray-10">
                  <p className="text-label-01 text-gray-50 font-medium">Forecast Periods</p>
                </div>
                {data.periods.map((period, idx) => (
                  <PeriodRow key={`${period.label}-${idx}`} period={period} />
                ))}
              </Card>
            )}

            {/* Upcoming Receivables */}
            {sortedReceivables.length > 0 && (
              <Card padding={false}>
                <div className="px-4 py-3 border-b border-gray-10">
                  <p className="text-label-01 text-gray-50 font-medium">
                    Upcoming Receivables ({sortedReceivables.length})
                  </p>
                </div>
                {sortedReceivables.map((item) => (
                  <ReceivableCard key={item.invoiceId} item={item} />
                ))}
              </Card>
            )}

            {/* Upcoming Payables */}
            {sortedPayables.length > 0 && (
              <Card padding={false}>
                <div className="px-4 py-3 border-b border-gray-10">
                  <p className="text-label-01 text-gray-50 font-medium">
                    Upcoming Payables ({sortedPayables.length})
                  </p>
                </div>
                {sortedPayables.map((item) => (
                  <PayableCard key={item.billId} item={item} />
                ))}
              </Card>
            )}
          </>
        )}
      </div>
    </>
  );
}
