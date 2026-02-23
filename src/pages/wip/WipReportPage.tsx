import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  DocumentChartBarIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useWipSummary, useRecognizeRevenue, wipKeys } from '@/queries';
import type { ProjectWipResponse } from '@/types';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { formatCurrency } from '@/utils/currency';

function billingModelVariant(model: string): 'info' | 'success' | 'warning' | 'gray' {
  const map: Record<string, 'info' | 'success' | 'warning' | 'gray'> = {
    TIME_AND_MATERIALS: 'info',
    FIXED_PRICE: 'success',
    MILESTONE: 'warning',
    RETAINER: 'gray',
  };
  return map[model] || 'gray';
}

export function WipReportPage() {
  const queryClient = useQueryClient();
  const { data: summary, isLoading } = useWipSummary();
  const recognizeRevenue = useRecognizeRevenue();

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: wipKeys.all });
  }, [queryClient]);

  const { containerRef, PullIndicator } = usePullToRefresh({ onRefresh: handleRefresh });

  const handleRecognize = async (projectId: string) => {
    try {
      await recognizeRevenue.mutateAsync(projectId);
    } catch {
      // Error handled by React Query
    }
  };

  return (
    <>
      <PageHeader title="WIP Report" backTo="/app/dashboard" />
      <div className="page-content" ref={containerRef}>
        <PullIndicator />

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : !summary ? (
          <EmptyState
            icon={DocumentChartBarIcon}
            title="No WIP data"
            description="Create projects and log time or expenses to see WIP balances."
          />
        ) : (
          <>
            {/* Summary stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Card>
                <p className="text-helper-01 text-gray-40">WIP Balance</p>
                <p className="text-heading-03 font-semibold text-gray-100">
                  {formatCurrency(summary.totalWipBalance)}
                </p>
              </Card>
              <Card>
                <p className="text-helper-01 text-gray-40">Projects</p>
                <p className="text-heading-03 font-semibold text-gray-100">
                  {summary.projectCount}
                </p>
              </Card>
              <Card>
                <p className="text-helper-01 text-gray-40">Overbilling</p>
                <p className="text-heading-03 font-semibold text-danger">
                  {formatCurrency(summary.totalOverbilling)}
                </p>
              </Card>
              <Card>
                <p className="text-helper-01 text-gray-40">Underbilling</p>
                <p className="text-heading-03 font-semibold text-primary">
                  {formatCurrency(summary.totalUnderbilling)}
                </p>
              </Card>
            </div>

            {/* Age Buckets */}
            {summary.ageBuckets.length > 0 && (
              <div className="mb-4">
                <h3 className="text-label-01 font-medium text-gray-60 mb-2">
                  WIP Age Distribution
                </h3>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {summary.ageBuckets.map((bucket) => (
                    <Card key={bucket.label} className="min-w-[140px] flex-shrink-0">
                      <p className="text-helper-01 text-gray-40">{bucket.label}</p>
                      <p className="text-body-01 font-medium text-gray-100">
                        {formatCurrency(bucket.amount)}
                      </p>
                      <p className="text-helper-01 text-gray-40">
                        {bucket.projectCount} {bucket.projectCount === 1 ? 'project' : 'projects'}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Project Cards */}
            {summary.projects.length === 0 ? (
              <EmptyState
                icon={DocumentChartBarIcon}
                title="No projects with WIP"
                description="Projects with work-in-progress will appear here."
              />
            ) : (
              <div className="space-y-3">
                {summary.projects.map((project: ProjectWipResponse) => (
                  <Card key={project.projectId}>
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-body-01 font-medium text-gray-100 truncate">
                            {project.projectName}
                          </p>
                          {project.clientName && (
                            <p className="text-helper-01 text-gray-40 truncate">
                              {project.clientName}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Badge variant={billingModelVariant(project.billingModel)}>
                            {project.billingModel.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                      </div>

                      {/* Metrics grid */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <div>
                          <p className="text-helper-01 text-gray-40">WIP Balance</p>
                          <p className="text-body-01 font-medium text-gray-100">
                            {formatCurrency(project.wipBalance)}
                          </p>
                        </div>
                        <div>
                          <p className="text-helper-01 text-gray-40">Billed</p>
                          <p className="text-body-01 font-medium text-gray-100">
                            {formatCurrency(project.totalBilled)}
                          </p>
                        </div>
                        <div>
                          <p className="text-helper-01 text-gray-40">Recognized</p>
                          <p className="text-body-01 font-medium text-gray-100">
                            {formatCurrency(project.totalRecognizedRevenue)}
                          </p>
                        </div>
                        <div>
                          <p className="text-helper-01 text-gray-40">Over/Under</p>
                          <p
                            className={clsx(
                              'text-body-01 font-medium',
                              project.overbillingAmount > 0
                                ? 'text-danger'
                                : project.underbillingAmount > 0
                                ? 'text-primary'
                                : 'text-gray-50'
                            )}
                          >
                            {project.overbillingAmount > 0
                              ? `Over ${formatCurrency(project.overbillingAmount)}`
                              : project.underbillingAmount > 0
                              ? `Under ${formatCurrency(project.underbillingAmount)}`
                              : 'Balanced'}
                          </p>
                        </div>
                      </div>

                      {/* Completion bar for fixed-price */}
                      {project.percentComplete != null && (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-helper-01 text-gray-40">
                              % Complete
                            </p>
                            <p className="text-helper-01 text-gray-50">
                              {project.percentComplete.toFixed(0)}%
                            </p>
                          </div>
                          <div className="w-full h-1.5 bg-gray-10 rounded-full overflow-hidden">
                            <div
                              className={clsx(
                                'h-full rounded-full transition-all',
                                project.percentComplete > 100
                                  ? 'bg-danger'
                                  : project.percentComplete > 80
                                  ? 'bg-warning-dark'
                                  : 'bg-primary'
                              )}
                              style={{
                                width: `${Math.min(project.percentComplete, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Recognize Revenue button for fixed-price */}
                      {project.billingModel === 'FIXED_PRICE' && (
                        <button
                          onClick={() => handleRecognize(project.projectId)}
                          disabled={recognizeRevenue.isPending}
                          className="flex items-center gap-1 px-3 py-1.5 text-label-01 font-medium text-primary active:bg-gray-10 rounded-lg border border-primary/20"
                        >
                          <ArrowPathIcon className="w-4 h-4" />
                          Recognize Revenue
                        </button>
                      )}
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
