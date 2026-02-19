import { useState, useCallback } from 'react';
import { useFixedAssets } from '@/queries';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useQueryClient } from '@tanstack/react-query';
import type { FixedAssetStatus } from '@/types';
import { CubeIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

const statusFilters: { label: string; value: FixedAssetStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Depreciated', value: 'FULLY_DEPRECIATED' },
  { label: 'Disposed', value: 'DISPOSED' },
];

export function AssetListPage() {
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<FixedAssetStatus | 'ALL'>('ALL');
  const [page] = useState(0);

  const PAGE_SIZE = 100;
  const { data, isLoading, isError } = useFixedAssets(page, PAGE_SIZE);
  const allAssets = data?.content ?? [];
  const assets = activeFilter === 'ALL'
    ? allAssets
    : allAssets.filter((a) => a.status === activeFilter);

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['fixed-assets'] });
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

      {/* Error state */}
      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-body-01 text-red-700">
            Unable to load assets. Please try again.
          </p>
        </div>
      )}

      {/* Asset list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : assets.length === 0 ? (
        <EmptyState
          icon={CubeIcon}
          title="No assets found"
          description={
            activeFilter !== 'ALL'
              ? `No ${activeFilter.toLowerCase().replace('_', ' ')} assets.`
              : 'Your fixed assets will appear here.'
          }
        />
      ) : (
        <div className="space-y-3">
          {assets.map((asset) => (
            <Card
              key={asset.id}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-body-01 font-medium text-gray-100">
                  {asset.name}
                </span>
                <StatusBadge status={asset.status} />
              </div>
              <p className="text-label-01 text-gray-50 mb-2">
                {asset.categoryDisplayName}
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-heading-02 tabular-nums text-gray-100">
                    {formatCurrency(asset.netBookValue)}
                  </span>
                  <span className="text-helper-01 text-gray-40 ml-1">NBV</span>
                </div>
                <span className="text-helper-01 text-gray-40">
                  {formatDate(asset.purchaseDate)}
                </span>
              </div>
              {asset.status === 'ACTIVE' && asset.monthlyDepreciation > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-10">
                  <div className="flex justify-between text-helper-01 text-gray-40">
                    <span>Monthly dep: {formatCurrency(asset.monthlyDepreciation)}</span>
                    <span>
                      {asset.depreciableAmount > 0 ? ((asset.accumulatedDepreciation / asset.depreciableAmount) * 100).toFixed(0) : '0'}% depreciated
                    </span>
                  </div>
                </div>
              )}
            </Card>
          ))}
          {data && data.totalElements > PAGE_SIZE && (
            <p className="text-center text-helper-01 text-gray-40 py-4">
              Showing {PAGE_SIZE} of {data.totalElements} assets
            </p>
          )}
        </div>
      )}
    </div>
  );
}
