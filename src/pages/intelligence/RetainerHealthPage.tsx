import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowPathRoundedSquareIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useRetainerHealth, intelligenceKeys } from '@/queries/intelligence.queries';
import type { RetainerHealthItem, RetainerHealthStatus } from '@/types';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { formatCurrency } from '@/utils/currency';

function retainerStatusVariant(status: RetainerHealthStatus): 'success' | 'danger' | 'gray' | 'warning' {
  const map: Record<RetainerHealthStatus, 'success' | 'danger' | 'gray' | 'warning'> = {
    HEALTHY: 'success',
    OVER_SERVICED: 'danger',
    UNDER_UTILIZED: 'gray',
    EXPIRING: 'warning',
  };
  return map[status] ?? 'warning';
}

function retainerStatusLabel(status: RetainerHealthStatus): string {
  const map: Record<RetainerHealthStatus, string> = {
    HEALTHY: 'Healthy',
    OVER_SERVICED: 'Over-serviced',
    UNDER_UTILIZED: 'Under-utilized',
    EXPIRING: 'Expiring',
  };
  return map[status] ?? status;
}

export function RetainerHealthPage() {
  const queryClient = useQueryClient();
  const { data: report, isLoading } = useRetainerHealth();

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: intelligenceKeys.all });
  }, [queryClient]);

  const { containerRef, PullIndicator } = usePullToRefresh({ onRefresh: handleRefresh });

  return (
    <>
      <PageHeader title="Retainer Health" backTo="/app/dashboard" />
      <div className="page-content" ref={containerRef}>
        <PullIndicator />

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : !report || report.totalRetainers === 0 ? (
          <EmptyState
            icon={ArrowPathRoundedSquareIcon}
            title="No retainer data"
            description="Create retainer agreements with clients to track health and utilization."
          />
        ) : (
          <>
            {/* Summary stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Card>
                <p className="text-helper-01 text-gray-40">Active Retainers</p>
                <p className="text-heading-03 font-semibold text-gray-100">
                  {report.totalRetainers}
                </p>
              </Card>
              <Card>
                <p className="text-helper-01 text-gray-40">Total MRR</p>
                <p className="text-heading-03 font-semibold text-green-600">
                  {formatCurrency(report.totalMRR)}
                </p>
              </Card>
              <Card>
                <p className="text-helper-01 text-gray-40">Avg Utilization</p>
                <p className="text-heading-03 font-semibold text-gray-100">
                  {report.averageUtilization.toFixed(0)}%
                </p>
              </Card>
              <Card>
                <p className="text-helper-01 text-gray-40">Alerts</p>
                <p className="text-heading-03 font-semibold text-red-600">
                  {report.overServicedCount + report.expiringCount}
                </p>
              </Card>
            </div>

            {/* Retainer Cards */}
            {report.retainers.length === 0 ? (
              <EmptyState
                icon={ArrowPathRoundedSquareIcon}
                title="No retainers"
                description="Retainer agreements will appear here once created."
              />
            ) : (
              <div className="space-y-3">
                {report.retainers.map((retainer: RetainerHealthItem) => {
                  const burnPercent = retainer.includedHours > 0
                    ? (retainer.usedHours / retainer.includedHours) * 100
                    : 0;
                  const isOverBurn = burnPercent > 100;

                  return (
                    <Card key={retainer.retainerId}>
                      <div className="space-y-2.5">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-body-01 font-medium text-gray-100 truncate">
                              {retainer.name}
                            </p>
                            {retainer.clientName && (
                              <p className="text-helper-01 text-gray-40 truncate">
                                {retainer.clientName}
                              </p>
                            )}
                          </div>
                          <Badge variant={retainerStatusVariant(retainer.status)}>
                            {retainerStatusLabel(retainer.status)}
                          </Badge>
                        </div>

                        {/* Fee + Hours */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                          <div>
                            <p className="text-helper-01 text-gray-40">Monthly Fee</p>
                            <p className="text-body-01 font-medium text-gray-100">
                              {formatCurrency(retainer.monthlyFee)}
                            </p>
                          </div>
                          <div>
                            <p className="text-helper-01 text-gray-40">Hours</p>
                            <p className="text-body-01 font-medium text-gray-100">
                              {retainer.usedHours.toFixed(1)} / {retainer.includedHours}
                            </p>
                          </div>
                        </div>

                        {/* Burn rate bar */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-helper-01 text-gray-40">Burn Rate</p>
                            <p
                              className={clsx(
                                'text-helper-01 font-medium',
                                isOverBurn ? 'text-red-600' : 'text-gray-50'
                              )}
                            >
                              {burnPercent.toFixed(0)}%
                            </p>
                          </div>
                          <div className="w-full h-1.5 bg-gray-10 rounded-full overflow-hidden">
                            <div
                              className={clsx(
                                'h-full rounded-full transition-all',
                                isOverBurn ? 'bg-red-500' : 'bg-primary'
                              )}
                              style={{
                                width: `${Math.min(burnPercent, 100)}%`,
                              }}
                            />
                          </div>
                        </div>

                        {/* Expiry + Overage */}
                        <div className="flex items-center justify-between">
                          {retainer.daysToExpiry != null && (
                            <span
                              className={clsx(
                                'text-helper-01',
                                retainer.daysToExpiry <= 30
                                  ? 'text-warning-dark font-medium'
                                  : 'text-gray-40'
                              )}
                            >
                              {retainer.daysToExpiry <= 0
                                ? 'Expired'
                                : `${retainer.daysToExpiry}d to expiry`}
                            </span>
                          )}
                          {retainer.unbilledOverageAmount > 0 && (
                            <span className="text-helper-01 text-red-600 font-medium">
                              +{formatCurrency(retainer.unbilledOverageAmount)} unbilled
                            </span>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
