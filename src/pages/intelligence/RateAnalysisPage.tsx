import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useRateAnalysis, intelligenceKeys } from '@/queries/intelligence.queries';
import type { ClientRateAnalysis, TeamMemberRateAnalysis } from '@/types';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { PageHeader } from '@/components/ui/PageHeader';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { formatCurrency } from '@/utils/currency';
import { toISODateString } from '@/utils/date';

type Tab = 'clients' | 'team';

function getDefaultDateRange(): { startDate: string; endDate: string } {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    startDate: toISODateString(startDate),
    endDate: toISODateString(endDate),
  };
}

export function RateAnalysisPage() {
  const queryClient = useQueryClient();
  const defaults = getDefaultDateRange();
  const [startDate, setStartDate] = useState(defaults.startDate);
  const [endDate, setEndDate] = useState(defaults.endDate);
  const [activeTab, setActiveTab] = useState<Tab>('clients');
  const { data: report, isLoading } = useRateAnalysis(startDate, endDate);

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: intelligenceKeys.all });
  }, [queryClient]);

  const { containerRef, PullIndicator } = usePullToRefresh({ onRefresh: handleRefresh });

  return (
    <>
      <PageHeader title="Rate Analysis" backTo="/app/dashboard" />
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
            icon={CurrencyDollarIcon}
            title="No rate data"
            description="Log billable time to clients and projects to see rate analysis."
          />
        ) : (
          <>
            {/* Summary stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Card>
                <p className="text-helper-01 text-gray-40">Standard Rate</p>
                <p className="text-heading-03 font-semibold text-gray-100">
                  {formatCurrency(report.averageStandardRate)}
                </p>
              </Card>
              <Card>
                <p className="text-helper-01 text-gray-40">Effective Rate</p>
                <p className="text-heading-03 font-semibold text-gray-100">
                  {formatCurrency(report.effectiveRate)}
                </p>
              </Card>
              <Card>
                <p className="text-helper-01 text-gray-40">Realization</p>
                <p
                  className={clsx(
                    'text-heading-03 font-semibold',
                    report.realizationRate >= 90
                      ? 'text-green-600'
                      : report.realizationRate >= 75
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  )}
                >
                  {report.realizationRate.toFixed(1)}%
                </p>
              </Card>
              <Card>
                <p className="text-helper-01 text-gray-40">Revenue Gap</p>
                <p className="text-heading-03 font-semibold text-red-600">
                  {formatCurrency(report.revenueGap)}
                </p>
              </Card>
            </div>

            {/* Tab toggle */}
            <div className="flex bg-gray-10 rounded-lg p-1 mb-4">
              <button
                onClick={() => setActiveTab('clients')}
                className={clsx(
                  'flex-1 py-2 text-label-01 font-medium rounded-md transition-colors',
                  activeTab === 'clients'
                    ? 'bg-white text-gray-100 shadow-sm'
                    : 'text-gray-50'
                )}
              >
                By Client
              </button>
              <button
                onClick={() => setActiveTab('team')}
                className={clsx(
                  'flex-1 py-2 text-label-01 font-medium rounded-md transition-colors',
                  activeTab === 'team'
                    ? 'bg-white text-gray-100 shadow-sm'
                    : 'text-gray-50'
                )}
              >
                By Team Member
              </button>
            </div>

            {/* Content */}
            {activeTab === 'clients' ? (
              report.byClient.length === 0 ? (
                <EmptyState
                  icon={CurrencyDollarIcon}
                  title="No client data"
                  description="Client rate breakdown will appear when billing data is available."
                />
              ) : (
                <div className="space-y-3">
                  {report.byClient.map((client: ClientRateAnalysis) => (
                    <Card key={client.clientId}>
                      <div className="space-y-2">
                        <p className="text-body-01 font-medium text-gray-100 truncate">
                          {client.clientName}
                        </p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                          <div>
                            <p className="text-helper-01 text-gray-40">Hours</p>
                            <p className="text-body-01 font-medium text-gray-100">
                              {client.hoursWorked.toFixed(1)}
                            </p>
                          </div>
                          <div>
                            <p className="text-helper-01 text-gray-40">Effective Rate</p>
                            <p className="text-body-01 font-medium text-gray-100">
                              {formatCurrency(client.effectiveRate)}/hr
                            </p>
                          </div>
                          <div>
                            <p className="text-helper-01 text-gray-40">Standard Amount</p>
                            <p className="text-body-01 font-medium text-gray-100">
                              {formatCurrency(client.standardAmount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-helper-01 text-gray-40">Actual Amount</p>
                            <p className="text-body-01 font-medium text-gray-100">
                              {formatCurrency(client.actualAmount)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-gray-10">
                          <span className="text-helper-01 text-gray-40">Realization</span>
                          <span
                            className={clsx(
                              'text-body-01 font-medium tabular-nums',
                              client.realizationRate >= 90
                                ? 'text-green-600'
                                : client.realizationRate >= 75
                                ? 'text-yellow-600'
                                : 'text-red-600'
                            )}
                          >
                            {client.realizationRate.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )
            ) : report.byTeamMember.length === 0 ? (
              <EmptyState
                icon={CurrencyDollarIcon}
                title="No team data"
                description="Team member rate breakdown will appear when time entries are logged."
              />
            ) : (
              <div className="space-y-3">
                {report.byTeamMember.map((member: TeamMemberRateAnalysis) => (
                  <Card key={member.teamMemberId}>
                    <div className="space-y-2">
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
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <div>
                          <p className="text-helper-01 text-gray-40">Hours</p>
                          <p className="text-body-01 font-medium text-gray-100">
                            {member.hoursWorked.toFixed(1)}
                          </p>
                        </div>
                        <div>
                          <p className="text-helper-01 text-gray-40">Revenue</p>
                          <p className="text-body-01 font-medium text-gray-100">
                            {formatCurrency(member.revenueGenerated)}
                          </p>
                        </div>
                        <div>
                          <p className="text-helper-01 text-gray-40">Effective Rate</p>
                          <p className="text-body-01 font-medium text-gray-100">
                            {formatCurrency(member.effectiveRate)}/hr
                          </p>
                        </div>
                        <div>
                          <p className="text-helper-01 text-gray-40">Cost Rate</p>
                          <p className="text-body-01 font-medium text-gray-100">
                            {formatCurrency(member.costRate)}/hr
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-gray-10">
                        <span className="text-helper-01 text-gray-40">Margin / Hour</span>
                        <span
                          className={clsx(
                            'text-body-01 font-medium tabular-nums',
                            member.marginPerHour >= 0 ? 'text-green-600' : 'text-red-600'
                          )}
                        >
                          {formatCurrency(member.marginPerHour)}
                        </span>
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
