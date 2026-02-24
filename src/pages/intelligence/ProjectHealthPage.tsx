import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { HeartIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useProjectHealth, intelligenceKeys } from '@/queries/intelligence.queries';
import type { ProjectHealthItem, HealthStatus } from '@/types';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { formatCurrency } from '@/utils/currency';

function healthVariant(status: HealthStatus): 'success' | 'warning' | 'danger' {
  const map: Record<HealthStatus, 'success' | 'warning' | 'danger'> = {
    GREEN: 'success',
    YELLOW: 'warning',
    RED: 'danger',
  };
  return map[status] ?? 'warning';
}

function healthLabel(status: HealthStatus): string {
  const map: Record<HealthStatus, string> = {
    GREEN: 'Healthy',
    YELLOW: 'Warning',
    RED: 'Critical',
  };
  return map[status] ?? status;
}

function HealthDot({ status, label }: { status: HealthStatus; label: string }) {
  const colorMap: Record<HealthStatus, string> = {
    GREEN: 'bg-green-500',
    YELLOW: 'bg-yellow-500',
    RED: 'bg-red-500',
  };
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className={clsx('w-2.5 h-2.5 rounded-full', colorMap[status])} />
      <span className="text-[10px] text-gray-40">{label}</span>
    </div>
  );
}

export function ProjectHealthPage() {
  const queryClient = useQueryClient();
  const { data: report, isLoading } = useProjectHealth();

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: intelligenceKeys.all });
  }, [queryClient]);

  const { containerRef, PullIndicator } = usePullToRefresh({ onRefresh: handleRefresh });

  return (
    <>
      <PageHeader title="Project Health" backTo="/app/dashboard" />
      <div className="page-content" ref={containerRef}>
        <PullIndicator />

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : !report || report.totalProjects === 0 ? (
          <EmptyState
            icon={HeartIcon}
            title="No project health data"
            description="Create service projects to see health metrics and status indicators."
          />
        ) : (
          <>
            {/* Summary stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Card>
                <p className="text-helper-01 text-gray-40">Total Projects</p>
                <p className="text-heading-03 font-semibold text-gray-100">
                  {report.totalProjects}
                </p>
              </Card>
              <Card>
                <p className="text-helper-01 text-gray-40">Healthy</p>
                <p className="text-heading-03 font-semibold text-green-600">
                  {report.healthyCount}
                </p>
              </Card>
              <Card>
                <p className="text-helper-01 text-gray-40">Warning</p>
                <p className="text-heading-03 font-semibold text-yellow-600">
                  {report.warningCount}
                </p>
              </Card>
              <Card>
                <p className="text-helper-01 text-gray-40">Critical</p>
                <p className="text-heading-03 font-semibold text-red-600">
                  {report.criticalCount}
                </p>
              </Card>
            </div>

            {/* Project Cards */}
            <div className="space-y-3">
              {report.projects.map((project: ProjectHealthItem) => (
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
                      <Badge variant={healthVariant(project.overallHealth)}>
                        {healthLabel(project.overallHealth)}
                      </Badge>
                    </div>

                    {/* Traffic light row */}
                    <div className="flex items-center gap-4 justify-center py-1">
                      <HealthDot status={project.budgetHealth} label="Budget" />
                      <HealthDot status={project.marginHealth} label="Margin" />
                      <HealthDot status={project.scheduleHealth} label="Schedule" />
                      <HealthDot status={project.wipAgeHealth} label="WIP Age" />
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <div>
                        <p className="text-helper-01 text-gray-40">Revenue</p>
                        <p className="text-body-01 font-medium text-gray-100">
                          {formatCurrency(project.revenue)}
                        </p>
                      </div>
                      <div>
                        <p className="text-helper-01 text-gray-40">Cost</p>
                        <p className="text-body-01 font-medium text-gray-100">
                          {formatCurrency(project.totalCost)}
                        </p>
                      </div>
                      <div>
                        <p className="text-helper-01 text-gray-40">Margin</p>
                        <p
                          className={clsx(
                            'text-body-01 font-medium',
                            project.grossMarginPercent != null && project.grossMarginPercent >= 30
                              ? 'text-green-600'
                              : project.grossMarginPercent != null && project.grossMarginPercent >= 15
                              ? 'text-yellow-600'
                              : 'text-red-600'
                          )}
                        >
                          {project.grossMarginPercent != null
                            ? `${project.grossMarginPercent.toFixed(1)}%`
                            : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-helper-01 text-gray-40">WIP Balance</p>
                        <p className="text-body-01 font-medium text-gray-100">
                          {formatCurrency(project.wipBalance)}
                        </p>
                      </div>
                    </div>

                    {/* Completion bar */}
                    {project.percentComplete != null && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-helper-01 text-gray-40">% Complete</p>
                          <p className="text-helper-01 text-gray-50">
                            {project.percentComplete.toFixed(0)}%
                          </p>
                        </div>
                        <div className="w-full h-1.5 bg-gray-10 rounded-full overflow-hidden">
                          <div
                            className={clsx(
                              'h-full rounded-full transition-all',
                              project.percentComplete > 100
                                ? 'bg-red-500'
                                : project.percentComplete > 80
                                ? 'bg-yellow-500'
                                : 'bg-primary'
                            )}
                            style={{
                              width: `${Math.min(project.percentComplete, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
