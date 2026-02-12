import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBills } from '@/queries';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useQueryClient } from '@tanstack/react-query';
import { BillStatus } from '@/types';
import { ClipboardDocumentListIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

const statusFilters: { label: string; value: BillStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Draft', value: BillStatus.DRAFT },
  { label: 'Approved', value: BillStatus.APPROVED },
  { label: 'Paid', value: BillStatus.PAID },
  { label: 'Cancelled', value: BillStatus.CANCELLED },
];

export function BillListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<BillStatus | 'ALL'>('ALL');
  const status = activeFilter === 'ALL' ? undefined : activeFilter;

  const { data: billsData, isLoading } = useBills(0, 50, status);
  const bills = billsData?.content ?? [];

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['bills'] });
  }, [queryClient]);

  const { containerRef, PullIndicator } = usePullToRefresh({ onRefresh: handleRefresh });

  return (
    <div className="page-content" ref={containerRef}>
      <PullIndicator />
      {/* Search bar */}
      <div className="relative mb-4">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-40" />
        <input
          type="text"
          placeholder="Search bills..."
          className="w-full h-10 pl-10 pr-4 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

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

      {/* Bill list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : bills.length === 0 ? (
        <EmptyState
          icon={ClipboardDocumentListIcon}
          title="No bills found"
          description={
            activeFilter !== 'ALL'
              ? `No ${activeFilter.toLowerCase()} bills.`
              : 'Record your first bill to get started.'
          }
          action={
            <button
              onClick={() => navigate('/app/bills/new')}
              className="px-4 py-2 bg-primary text-white text-body-01 font-medium rounded-lg"
            >
              Create Bill
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {bills.map((bill) => (
            <Card
              key={bill.id}
              onClick={() => navigate(`/app/bills/${bill.id}`)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-body-01 font-medium text-gray-100">
                  {bill.billNumber || 'Bill'}
                </span>
                <StatusBadge status={bill.status} />
              </div>
              <p className="text-label-01 text-gray-50 mb-2">
                {bill.supplier?.name || 'Unknown Supplier'}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-heading-02 tabular-nums text-gray-100">
                  {formatCurrency(bill.total)}
                </span>
                <span className="text-helper-01 text-gray-40">
                  {bill.dueDate ? `Due ${formatDate(bill.dueDate)}` : formatDate(bill.billDate)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
