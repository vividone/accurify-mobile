import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreditNotes } from '@/queries';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useQueryClient } from '@tanstack/react-query';
import { CreditNoteStatus } from '@/types';
import { DocumentMinusIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

const statusFilters: { label: string; value: CreditNoteStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Draft', value: CreditNoteStatus.DRAFT },
  { label: 'Issued', value: CreditNoteStatus.ISSUED },
  { label: 'Applied', value: CreditNoteStatus.APPLIED },
  { label: 'Voided', value: CreditNoteStatus.VOIDED },
];

export function CreditNoteListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<CreditNoteStatus | 'ALL'>('ALL');

  const { data, isLoading } = useCreditNotes(0, 50);
  const allNotes = data?.content ?? [];
  const creditNotes = activeFilter === 'ALL'
    ? allNotes
    : allNotes.filter((cn) => cn.status === activeFilter);

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['credit-notes'] });
  }, [queryClient]);

  const { containerRef, PullIndicator } = usePullToRefresh({ onRefresh: handleRefresh });

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

      {/* Credit note list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : creditNotes.length === 0 ? (
        <EmptyState
          icon={DocumentMinusIcon}
          title="No credit notes"
          description={
            activeFilter !== 'ALL'
              ? `No ${activeFilter.toLowerCase()} credit notes.`
              : 'Issue credit notes against invoices when needed.'
          }
          action={
            <button
              onClick={() => navigate('/app/credit-notes/new')}
              className="px-4 py-2 bg-primary text-white text-body-01 font-medium rounded-lg"
            >
              Create Credit Note
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {creditNotes.map((cn) => (
            <Card
              key={cn.id}
              onClick={() => navigate(`/app/credit-notes/${cn.id}`)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-body-01 font-medium text-gray-100">
                  {cn.creditNoteNumber}
                </span>
                <StatusBadge status={cn.status} />
              </div>
              <p className="text-label-01 text-gray-50 mb-2">
                {cn.clientName} &middot; {cn.invoiceNumber}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-heading-02 tabular-nums text-gray-100">
                  {formatCurrency(cn.total)}
                </span>
                <span className="text-helper-01 text-gray-40">
                  {formatDate(cn.issueDate)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
