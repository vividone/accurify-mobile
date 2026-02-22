import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import {
  useProjectsProfitability,
  useClientsProfitability,
  profitabilityKeys,
} from '@/queries';
import type { ProjectProfitability, ClientProfitability } from '@/types';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { formatCurrency } from '@/utils/currency';

type TabType = 'projects' | 'clients';

export function ProfitabilityPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('projects');

  const {
    data: projectsData,
    isLoading: projectsLoading,
  } = useProjectsProfitability(activeTab === 'projects');

  const {
    data: clientsData,
    isLoading: clientsLoading,
  } = useClientsProfitability(activeTab === 'clients');

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: profitabilityKeys.all });
  }, [queryClient]);

  const { containerRef, PullIndicator } = usePullToRefresh({ onRefresh: handleRefresh });

  const isLoading = activeTab === 'projects' ? projectsLoading : clientsLoading;

  return (
    <>
      <PageHeader
        title="Profitability"
        backTo="/app/dashboard"
      />
      <div className="page-content" ref={containerRef}>
        <PullIndicator />

        {/* Tab toggle */}
        <div className="flex bg-gray-10 rounded-lg p-1 mb-4">
          <button
            onClick={() => setActiveTab('projects')}
            className={clsx(
              'flex-1 py-2 text-label-01 font-medium rounded-md transition-colors',
              activeTab === 'projects'
                ? 'bg-white text-gray-100 shadow-sm'
                : 'text-gray-50'
            )}
          >
            By Project
          </button>
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
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : activeTab === 'projects' ? (
          <ProjectProfitabilityList data={projectsData ?? []} />
        ) : (
          <ClientProfitabilityList data={clientsData ?? []} />
        )}
      </div>
    </>
  );
}

// Backend returns amounts in naira (already converted from kobo)
function ProjectProfitabilityList({ data }: { data: ProjectProfitability[] }) {
  if (data.length === 0) {
    return (
      <EmptyState
        icon={ChartBarIcon}
        title="No profitability data"
        description="Create projects and log time entries to see profitability metrics."
      />
    );
  }

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <Card key={item.projectId}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-body-01 font-medium text-gray-100 truncate">
                  {item.projectName}
                </p>
                {item.clientName && (
                  <p className="text-helper-01 text-gray-40 truncate">
                    {item.clientName}
                  </p>
                )}
              </div>
              <Badge variant={item.status === 'ACTIVE' ? 'success' : 'gray'}>
                {item.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <p className="text-helper-01 text-gray-40">Revenue</p>
                <p className="text-body-01 font-medium text-gray-100">
                  {formatCurrency(item.revenue)}
                </p>
              </div>
              <div>
                <p className="text-helper-01 text-gray-40">Total COS</p>
                <p className="text-body-01 font-medium text-gray-100">
                  {formatCurrency(item.totalCos)}
                </p>
              </div>
              <div>
                <p className="text-helper-01 text-gray-40">Gross Margin</p>
                <p
                  className={clsx(
                    'text-body-01 font-medium',
                    item.grossMargin >= 0 ? 'text-success-dark' : 'text-danger'
                  )}
                >
                  {formatCurrency(item.grossMargin)}
                </p>
              </div>
              <div>
                <p className="text-helper-01 text-gray-40">Margin %</p>
                <p
                  className={clsx(
                    'text-body-01 font-medium',
                    item.grossMarginPercent >= 0 ? 'text-success-dark' : 'text-danger'
                  )}
                >
                  {item.grossMarginPercent.toFixed(1)}%
                </p>
              </div>
            </div>

            {item.budget != null && item.budgetUsedPercent != null && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-helper-01 text-gray-40">Budget Used</p>
                  <p className="text-helper-01 text-gray-50">
                    {item.budgetUsedPercent.toFixed(0)}%
                  </p>
                </div>
                <div className="w-full h-1.5 bg-gray-10 rounded-full overflow-hidden">
                  <div
                    className={clsx(
                      'h-full rounded-full transition-all',
                      item.budgetUsedPercent > 100 ? 'bg-danger' :
                      item.budgetUsedPercent > 80 ? 'bg-warning-dark' : 'bg-primary'
                    )}
                    style={{ width: `${Math.min(item.budgetUsedPercent, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

function ClientProfitabilityList({ data }: { data: ClientProfitability[] }) {
  if (data.length === 0) {
    return (
      <EmptyState
        icon={ChartBarIcon}
        title="No client data"
        description="Assign clients to projects to see profitability by client."
      />
    );
  }

  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <Card key={item.clientId ?? index}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-body-01 font-medium text-gray-100 truncate">
                {item.clientName}
              </p>
              <Badge variant="info">
                {item.projectCount} {item.projectCount === 1 ? 'project' : 'projects'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <p className="text-helper-01 text-gray-40">Revenue</p>
                <p className="text-body-01 font-medium text-gray-100">
                  {formatCurrency(item.revenue)}
                </p>
              </div>
              <div>
                <p className="text-helper-01 text-gray-40">Total COS</p>
                <p className="text-body-01 font-medium text-gray-100">
                  {formatCurrency(item.totalCos)}
                </p>
              </div>
              <div>
                <p className="text-helper-01 text-gray-40">Gross Margin</p>
                <p
                  className={clsx(
                    'text-body-01 font-medium',
                    item.grossMargin >= 0 ? 'text-success-dark' : 'text-danger'
                  )}
                >
                  {formatCurrency(item.grossMargin)}
                </p>
              </div>
              <div>
                <p className="text-helper-01 text-gray-40">Margin %</p>
                <p
                  className={clsx(
                    'text-body-01 font-medium',
                    item.grossMarginPercent >= 0 ? 'text-success-dark' : 'text-danger'
                  )}
                >
                  {item.grossMarginPercent.toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-helper-01 text-gray-40 pt-1 border-t border-gray-10">
              <span>{item.totalHours.toFixed(1)} total hrs</span>
              <span>{item.billableHours.toFixed(1)} billable hrs</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
