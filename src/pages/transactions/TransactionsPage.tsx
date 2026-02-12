import { useState, useCallback } from 'react';
import { useTransactions } from '@/queries';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  TransactionType,
  CATEGORY_META,
} from '@/types/enums';
import type { TransactionFilters } from '@/types';
import {
  BanknotesIcon,
  PlusIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

type TypeFilter = 'ALL' | TransactionType;

const typeFilters: { label: string; value: TypeFilter }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Income', value: TransactionType.INFLOW },
  { label: 'Expenses', value: TransactionType.OUTFLOW },
];

export function TransactionsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<TypeFilter>('ALL');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page] = useState(0);

  const filters: TransactionFilters = {};
  if (activeFilter !== 'ALL') filters.type = activeFilter;
  if (startDate) filters.startDate = startDate;
  if (endDate) filters.endDate = endDate;

  const { data: txData, isLoading } = useTransactions(page, 50, filters);
  const transactions = txData?.content ?? [];

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['transactions'] });
  }, [queryClient]);

  const { containerRef, PullIndicator } = usePullToRefresh({ onRefresh: handleRefresh });

  const clearDateFilter = () => {
    setStartDate('');
    setEndDate('');
    setShowDateFilter(false);
  };

  return (
    <>
      <PageHeader
        title="Transactions"
        backTo="/app/dashboard"
        actions={
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowDateFilter(!showDateFilter)}
              className={clsx(
                'p-1.5 rounded-full',
                (startDate || endDate) ? 'text-primary bg-primary-50' : 'text-gray-60'
              )}
            >
              <FunnelIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/app/transactions/new')}
              className="p-1.5 text-primary active:bg-primary-50 rounded-full"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>
        }
      />
      <div className="page-content" ref={containerRef}>
        <PullIndicator />

        {/* Date filter */}
        {showDateFilter && (
          <Card className="mb-4">
            <p className="text-label-01 text-gray-70 mb-2">Filter by Date</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-helper-01 text-gray-50 mb-1">From</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-10 px-3 bg-gray-10 border border-gray-30 rounded-lg text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-helper-01 text-gray-50 mb-1">To</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full h-10 px-3 bg-gray-10 border border-gray-30 rounded-lg text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            {(startDate || endDate) && (
              <button
                onClick={clearDateFilter}
                className="text-label-01 text-primary font-medium"
              >
                Clear dates
              </button>
            )}
          </Card>
        )}

        {/* Type filter chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4 -mx-4 px-4">
          {typeFilters.map((filter) => (
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

        {/* Transactions list */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <EmptyState
            icon={BanknotesIcon}
            title="No transactions"
            description="Record your income and expenses to track your business finances."
            action={
              <button
                onClick={() => navigate('/app/transactions/new')}
                className="px-4 py-2 bg-primary text-white text-body-01 font-medium rounded-lg"
              >
                Add Transaction
              </button>
            }
          />
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => {
              const isInflow = tx.type === TransactionType.INFLOW;
              const categoryMeta = CATEGORY_META[tx.category];
              return (
                <Card key={tx.id}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isInflow ? 'bg-success-light' : 'bg-danger-light'}`}>
                      {isInflow ? (
                        <ArrowDownIcon className="w-4 h-4 text-success" />
                      ) : (
                        <ArrowUpIcon className="w-4 h-4 text-danger" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-body-01 font-medium text-gray-100 truncate">
                        {tx.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant={isInflow ? 'success' : 'danger'}>
                          {categoryMeta?.displayName ?? tx.category}
                        </Badge>
                        <span className="text-helper-01 text-gray-40">{formatDate(tx.date)}</span>
                      </div>
                    </div>
                    <p className={`text-body-01 font-medium tabular-nums flex-shrink-0 ${isInflow ? 'text-success' : 'text-danger'}`}>
                      {isInflow ? '+' : '-'}{formatCurrency(tx.amount)}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
