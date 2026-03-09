import { useState, useCallback } from 'react';
import { useFiscalPeriods, useClosePeriod, useReopenPeriod, useYearEndClose } from '@/queries';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useQueryClient } from '@tanstack/react-query';
import { useUIStore } from '@/store/ui.store';
import { LockClosedIcon, LockOpenIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function FiscalPeriodsPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const queryClient = useQueryClient();
  const showNotification = useUIStore((s) => s.showNotification);
  const { data: periods, isLoading } = useFiscalPeriods(year);
  const closeMutation = useClosePeriod();
  const reopenMutation = useReopenPeriod();
  const yearEndMutation = useYearEndClose();

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['fiscal-periods'] });
  }, [queryClient]);

  const { containerRef, PullIndicator } = usePullToRefresh({ onRefresh: handleRefresh });

  const handleClose = async (id: string) => {
    try {
      await closeMutation.mutateAsync(id);
      showNotification('Period closed', '', 'success');
    } catch {
      showNotification('Failed to close period', '', 'error');
    }
  };

  const handleReopen = async (id: string) => {
    try {
      await reopenMutation.mutateAsync(id);
      showNotification('Period reopened', '', 'success');
    } catch {
      showNotification('Failed to reopen period', '', 'error');
    }
  };

  const handleYearEndClose = async () => {
    if (!confirm(`Perform year-end closing for ${year}? This will create closing journal entries.`)) return;
    try {
      await yearEndMutation.mutateAsync(year);
      showNotification(`Year-end closing completed for ${year}`, '', 'success');
    } catch {
      showNotification('Year-end closing failed', '', 'error');
    }
  };

  return (
    <div className="page-content" ref={containerRef}>
      <PullIndicator />

      {/* Year selector */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setYear((y) => y - 1)}
            className="p-2 rounded-lg bg-white border border-gray-20 active:bg-gray-10"
          >
            <ChevronLeftIcon className="w-4 h-4 text-gray-60" />
          </button>
          <span className="text-heading-02 text-gray-100 w-16 text-center">{year}</span>
          <button
            onClick={() => setYear((y) => y + 1)}
            className="p-2 rounded-lg bg-white border border-gray-20 active:bg-gray-10"
          >
            <ChevronRightIcon className="w-4 h-4 text-gray-60" />
          </button>
        </div>
        <button
          onClick={handleYearEndClose}
          disabled={yearEndMutation.isPending}
          className="px-3 py-2 bg-primary text-white text-label-01 font-medium rounded-lg disabled:opacity-50"
        >
          Year-End Close
        </button>
      </div>

      {/* Periods grid */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {(periods || []).map((period) => (
            <div
              key={period.id}
              className="bg-white rounded-xl p-3 border border-gray-20"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-label-01 font-medium text-gray-100">
                  {MONTH_NAMES[period.month - 1]}
                </span>
                <StatusBadge status={period.status} />
              </div>
              {period.closedAt && (
                <p className="text-helper-01 text-gray-40 mb-2">
                  Closed {new Date(period.closedAt).toLocaleDateString('en-NG')}
                </p>
              )}
              {period.status === 'OPEN' && (
                <button
                  onClick={() => handleClose(period.id)}
                  disabled={closeMutation.isPending}
                  className="flex items-center gap-1 px-2 py-1 text-helper-01 text-gray-60 bg-gray-10 rounded active:bg-gray-20 disabled:opacity-50"
                >
                  <LockClosedIcon className="w-3 h-3" />
                  Close
                </button>
              )}
              {period.status === 'CLOSED' && (
                <button
                  onClick={() => handleReopen(period.id)}
                  disabled={reopenMutation.isPending}
                  className="flex items-center gap-1 px-2 py-1 text-helper-01 text-gray-60 bg-gray-10 rounded active:bg-gray-20 disabled:opacity-50"
                >
                  <LockOpenIcon className="w-3 h-3" />
                  Reopen
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
