import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecurringTemplates, usePauseRecurring, useResumeRecurring } from '@/queries';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useQueryClient } from '@tanstack/react-query';
import { RecurringTemplateStatus } from '@/types';
import { ArrowPathIcon, PauseIcon, PlayIcon } from '@heroicons/react/24/outline';
import { useUIStore } from '@/store/ui.store';
import clsx from 'clsx';

const statusFilters: { label: string; value: RecurringTemplateStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Active', value: RecurringTemplateStatus.ACTIVE },
  { label: 'Paused', value: RecurringTemplateStatus.PAUSED },
  { label: 'Completed', value: RecurringTemplateStatus.COMPLETED },
];

export function RecurringListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const showNotification = useUIStore((s) => s.showNotification);
  const [activeFilter, setActiveFilter] = useState<RecurringTemplateStatus | 'ALL'>('ALL');

  const { data, isLoading } = useRecurringTemplates(0, 50);
  const allTemplates = data?.content ?? [];
  const templates = activeFilter === 'ALL'
    ? allTemplates
    : allTemplates.filter((t) => t.status === activeFilter);

  const pauseMutation = usePauseRecurring();
  const resumeMutation = useResumeRecurring();

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['recurring'] });
  }, [queryClient]);

  const { containerRef, PullIndicator } = usePullToRefresh({ onRefresh: handleRefresh });

  const handlePause = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await pauseMutation.mutateAsync(id);
      showNotification('Template paused', '', 'success');
    } catch {
      showNotification('Failed to pause', '', 'error');
    }
  };

  const handleResume = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await resumeMutation.mutateAsync(id);
      showNotification('Template resumed', '', 'success');
    } catch {
      showNotification('Failed to resume', '', 'error');
    }
  };

  return (
    <div className="page-content" ref={containerRef}>
      <PullIndicator />

      {/* Status filter chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4 -mx-4 px-4">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            className={clsx(
              'px-3 py-1.5 rounded-full text-label-01 font-medium whitespace-nowrap transition-colors',
              activeFilter === filter.value
                ? 'bg-primary text-white'
                : 'bg-white text-gray-60 border border-gray-20'
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Template list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <EmptyState
          icon={ArrowPathIcon}
          title="No recurring invoices"
          description={
            activeFilter !== 'ALL'
              ? `No ${activeFilter.toLowerCase()} templates.`
              : 'Automate invoice generation on a schedule.'
          }
          action={
            <button
              onClick={() => navigate('/app/recurring/new')}
              className="px-4 py-2 bg-primary text-white text-body-01 font-medium rounded-lg"
            >
              Create Template
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {templates.map((template) => (
            <Card key={template.id}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-body-01 font-medium text-gray-100">
                  {template.templateName}
                </span>
                <StatusBadge status={template.status} />
              </div>
              <p className="text-label-01 text-gray-50 mb-2">
                {template.clientName || 'No client'} &middot; {template.frequency}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-heading-02 tabular-nums text-gray-100">
                  {formatCurrency(template.total)}
                </span>
                <div className="flex items-center gap-2">
                  {template.nextRunDate && (
                    <span className="text-helper-01 text-gray-40">
                      Next: {formatDate(template.nextRunDate)}
                    </span>
                  )}
                  {template.status === 'ACTIVE' && (
                    <button
                      onClick={(e) => handlePause(template.id, e)}
                      className="p-1.5 rounded-lg active:bg-gray-10"
                    >
                      <PauseIcon className="w-4 h-4 text-gray-50" />
                    </button>
                  )}
                  {template.status === 'PAUSED' && (
                    <button
                      onClick={(e) => handleResume(template.id, e)}
                      className="p-1.5 rounded-lg active:bg-gray-10"
                    >
                      <PlayIcon className="w-4 h-4 text-primary" />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
