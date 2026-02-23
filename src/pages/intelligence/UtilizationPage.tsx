import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { UsersIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useUtilization, intelligenceKeys } from '@/queries/intelligence.queries';
import type { TeamMemberUtilization, UtilizationStatus } from '@/types';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { formatCurrency } from '@/utils/currency';
import { toISODateString } from '@/utils/date';

function getDefaultDateRange(): { startDate: string; endDate: string } {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    startDate: toISODateString(startDate),
    endDate: toISODateString(endDate),
  };
}

function utilizationBarColor(percent: number): string {
  if (percent > 85) return 'bg-red-500';
  if (percent >= 50) return 'bg-green-500';
  return 'bg-gray-30';
}

function statusVariant(status: UtilizationStatus): 'success' | 'danger' | 'warning' {
  const map: Record<UtilizationStatus, 'success' | 'danger' | 'warning'> = {
    OPTIMAL: 'success',
    OVER_UTILIZED: 'danger',
    UNDER_UTILIZED: 'warning',
  };
  return map[status] ?? 'warning';
}

function statusLabel(status: UtilizationStatus): string {
  const map: Record<UtilizationStatus, string> = {
    OPTIMAL: 'Optimal',
    OVER_UTILIZED: 'Over-utilized',
    UNDER_UTILIZED: 'Under-utilized',
  };
  return map[status] ?? status;
}

export function UtilizationPage() {
  const queryClient = useQueryClient();
  const defaults = getDefaultDateRange();
  const [startDate, setStartDate] = useState(defaults.startDate);
  const [endDate, setEndDate] = useState(defaults.endDate);
  const { data: report, isLoading } = useUtilization(startDate, endDate);

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: intelligenceKeys.all });
  }, [queryClient]);

  const { containerRef, PullIndicator } = usePullToRefresh({ onRefresh: handleRefresh });

  return (
    <>
      <PageHeader title="Utilization" backTo="/app/dashboard" />
      <div className="page-content" ref={containerRef}>
        <PullIndicator />

        {/* Date range filter */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-helper-01 text-gray-40 block mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              max={endDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-body-01 bg-white border border-gray-20 rounded-lg text-gray-100 focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-helper-01 text-gray-40 block mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 text-body-01 bg-white border border-gray-20 rounded-lg text-gray-100 focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : !report ? (
          <EmptyState
            icon={UsersIcon}
            title="No utilization data"
            description="Track team time on projects to see utilization metrics."
          />
        ) : (
          <>
            {/* Summary stats */}
            <div className="space-y-3 mb-4">
              {/* Overall Utilization - large card */}
              <Card>
                <p className="text-helper-01 text-gray-40">Overall Utilization</p>
                <div className="flex items-end gap-2 mt-1">
                  <p
                    className={clsx(
                      'text-[2rem] font-bold tabular-nums leading-tight',
                      report.overallUtilization >= 70
                        ? 'text-green-600'
                        : report.overallUtilization >= 50
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    )}
                  >
                    {report.overallUtilization.toFixed(1)}%
                  </p>
                  <p className="text-helper-01 text-gray-40 pb-1">
                    vs {report.benchmarkUtilization}% benchmark
                  </p>
                </div>
                <div className="w-full h-2 bg-gray-10 rounded-full overflow-hidden mt-2">
                  <div
                    className={clsx(
                      'h-full rounded-full transition-all',
                      report.overallUtilization >= 70
                        ? 'bg-green-500'
                        : report.overallUtilization >= 50
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    )}
                    style={{ width: `${Math.min(report.overallUtilization, 100)}%` }}
                  />
                </div>
              </Card>

              <div className="grid grid-cols-3 gap-3">
                <Card>
                  <p className="text-helper-01 text-gray-40">Team Size</p>
                  <p className="text-heading-03 font-semibold text-gray-100">
                    {report.teamSize}
                  </p>
                </Card>
                <Card>
                  <p className="text-helper-01 text-gray-40">Billable Hrs</p>
                  <p className="text-heading-03 font-semibold text-gray-100">
                    {report.totalBillableHours.toFixed(0)}
                  </p>
                </Card>
                <Card>
                  <p className="text-helper-01 text-gray-40">Eff. Rate</p>
                  <p className="text-heading-03 font-semibold text-gray-100">
                    {formatCurrency(report.effectiveBillingRate)}
                  </p>
                </Card>
              </div>
            </div>

            {/* Team member cards */}
            {report.teamMembers.length === 0 ? (
              <EmptyState
                icon={UsersIcon}
                title="No team members"
                description="Add team members and log time to see individual utilization."
              />
            ) : (
              <div className="space-y-3">
                <h3 className="text-label-01 font-medium text-gray-60">Team Members</h3>
                {report.teamMembers.map((member: TeamMemberUtilization) => (
                  <Card key={member.teamMemberId}>
                    <div className="space-y-2.5">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-body-01 font-medium text-gray-100 truncate">
                            {member.name}
                          </p>
                          {member.roleTitle && (
                            <p className="text-helper-01 text-gray-40 truncate">
                              {member.roleTitle}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={clsx(
                              'text-heading-03 font-bold tabular-nums',
                              member.utilizationPercent > 85
                                ? 'text-red-600'
                                : member.utilizationPercent >= 50
                                ? 'text-green-600'
                                : 'text-gray-40'
                            )}
                          >
                            {member.utilizationPercent.toFixed(0)}%
                          </span>
                        </div>
                      </div>

                      {/* Utilization bar */}
                      <div className="w-full h-1.5 bg-gray-10 rounded-full overflow-hidden">
                        <div
                          className={clsx(
                            'h-full rounded-full transition-all',
                            utilizationBarColor(member.utilizationPercent)
                          )}
                          style={{
                            width: `${Math.min(member.utilizationPercent, 100)}%`,
                          }}
                        />
                      </div>

                      {/* Status + Metrics */}
                      <div className="flex items-center justify-between">
                        <Badge variant={statusVariant(member.status)}>
                          {statusLabel(member.status)}
                        </Badge>
                        <div className="flex items-center gap-3">
                          <span className="text-helper-01 text-gray-40">
                            {formatCurrency(member.effectiveRate)}/hr
                          </span>
                          <span className="text-helper-01 text-gray-50 font-medium">
                            {formatCurrency(member.revenueGenerated)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
