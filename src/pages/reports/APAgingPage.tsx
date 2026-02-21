import { useState, useCallback } from 'react';
import { useApAging } from '@/queries/gl.queries';
import { Card } from '@/components/ui/Card';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatCurrency } from '@/utils/currency';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ExclamationTriangleIcon, DocumentChartBarIcon } from '@heroicons/react/24/outline';
import type { AgingBucket, AgingPartyTotal } from '@/queries/gl.queries';

function formatDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

const BUCKET_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  'Current': { bg: 'bg-green-50', text: 'text-green-700', bar: 'bg-green-500' },
  '1-30 Days': { bg: 'bg-yellow-50', text: 'text-yellow-700', bar: 'bg-yellow-500' },
  '31-60 Days': { bg: 'bg-orange-50', text: 'text-orange-700', bar: 'bg-orange-500' },
  '61-90 Days': { bg: 'bg-red-50', text: 'text-red-600', bar: 'bg-red-400' },
  'Over 90 Days': { bg: 'bg-red-100', text: 'text-red-800', bar: 'bg-red-600' },
};

function getBucketColor(label: string) {
  return BUCKET_COLORS[label] || { bg: 'bg-gray-50', text: 'text-gray-700', bar: 'bg-gray-500' };
}

function BucketCard({ bucket, totalOutstanding }: { bucket: AgingBucket; totalOutstanding: number }) {
  const color = getBucketColor(bucket.label);
  const percentage = totalOutstanding > 0 ? (bucket.amount / totalOutstanding) * 100 : 0;

  return (
    <div className={`rounded-lg p-3 ${color.bg}`}>
      <div className="flex items-center justify-between mb-1">
        <p className={`text-label-01 font-medium ${color.text}`}>{bucket.label}</p>
        <p className={`text-label-01 ${color.text}`}>{bucket.count} items</p>
      </div>
      <p className={`text-heading-02 font-semibold tabular-nums ${color.text}`}>
        {formatCurrency(bucket.amount)}
      </p>
      <div className="mt-2 h-1.5 bg-white/50 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color.bar}`}
          style={{ width: `${Math.max(percentage, 1)}%` }}
        />
      </div>
      <p className={`text-helper-01 mt-1 ${color.text} opacity-70`}>
        {percentage.toFixed(1)}% of total
      </p>
    </div>
  );
}

function PartyRow({ party }: { party: AgingPartyTotal }) {
  return (
    <div className="px-4 py-3 border-b border-gray-10 last:border-b-0">
      <div className="flex items-center justify-between mb-2">
        <p className="text-body-01 font-medium text-gray-100 truncate flex-1 mr-3">
          {party.partyName}
        </p>
        <p className="text-body-01 font-semibold tabular-nums text-gray-100 flex-shrink-0">
          {formatCurrency(party.totalAmount)}
        </p>
      </div>
      <div className="flex items-center gap-1.5 text-helper-01 tabular-nums">
        {party.currentAmount > 0 && (
          <span className="px-1.5 py-0.5 rounded bg-green-50 text-green-700">
            {formatCurrency(party.currentAmount)}
          </span>
        )}
        {party.days1to30 > 0 && (
          <span className="px-1.5 py-0.5 rounded bg-yellow-50 text-yellow-700">
            {formatCurrency(party.days1to30)}
          </span>
        )}
        {party.days31to60 > 0 && (
          <span className="px-1.5 py-0.5 rounded bg-orange-50 text-orange-700">
            {formatCurrency(party.days31to60)}
          </span>
        )}
        {party.days61to90 > 0 && (
          <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-600">
            {formatCurrency(party.days61to90)}
          </span>
        )}
        {party.over90 > 0 && (
          <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-800">
            {formatCurrency(party.over90)}
          </span>
        )}
      </div>
    </div>
  );
}

export function APAgingPage() {
  const queryClient = useQueryClient();
  const [asOfDate, setAsOfDate] = useState(formatDate(new Date()));

  const { data: report, isLoading, isError, error } = useApAging(asOfDate);

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['gl'] });
  }, [queryClient]);

  const { containerRef, PullIndicator } = usePullToRefresh({ onRefresh: handleRefresh });

  const hasData = report && report.buckets.length > 0;

  return (
    <>
      <PageHeader title="AP Aging Report" backTo="/app/dashboard" />
      <div className="page-content space-y-4" ref={containerRef}>
        <PullIndicator />

        {/* Date picker */}
        <Card>
          <p className="text-label-01 text-gray-70 mb-2">As of Date</p>
          <input
            type="date"
            value={asOfDate}
            onChange={(e) => setAsOfDate(e.target.value)}
            className="w-full h-10 px-3 bg-gray-10 border border-gray-30 rounded-lg text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </Card>

        {isLoading && <DashboardSkeleton />}

        {isError && (
          <Card>
            <div className="flex flex-col items-center py-6 text-center">
              <ExclamationTriangleIcon className="w-10 h-10 text-gray-40 mb-3" />
              <p className="text-body-01 text-gray-70 mb-1">
                Failed to load AP aging report
              </p>
              <p className="text-helper-01 text-gray-50 mb-4">
                {(error as Error)?.message || 'Please try again later.'}
              </p>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-primary text-white text-body-01 font-medium rounded-lg"
              >
                Retry
              </button>
            </div>
          </Card>
        )}

        {!isLoading && !isError && report && !hasData && (
          <Card>
            <div className="flex flex-col items-center py-8 text-center">
              <DocumentChartBarIcon className="w-10 h-10 text-gray-30 mb-3" />
              <p className="text-body-01 font-medium text-gray-70 mb-1">
                No outstanding payables
              </p>
              <p className="text-helper-01 text-gray-50">
                Record bills to see your AP aging breakdown.
              </p>
            </div>
          </Card>
        )}

        {!isLoading && !isError && report && hasData && (
          <>
            {/* Summary card */}
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-label-01 text-gray-50">Total Outstanding</p>
                  <p className="text-heading-03 font-semibold tabular-nums text-gray-100">
                    {formatCurrency(report.totalOutstanding)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-label-01 text-gray-50">Total Bills</p>
                  <p className="text-heading-03 font-semibold tabular-nums text-gray-100">
                    {report.totalCount}
                  </p>
                </div>
              </div>
            </Card>

            {/* Aging buckets */}
            <div className="space-y-2">
              <p className="text-label-01 text-gray-50 font-medium px-1">Aging Buckets</p>
              {report.buckets.map((bucket) => (
                <BucketCard
                  key={bucket.label}
                  bucket={bucket}
                  totalOutstanding={report.totalOutstanding}
                />
              ))}
            </div>

            {/* Party breakdown */}
            {report.partyTotals.length > 0 && (
              <Card padding={false}>
                <div className="px-4 py-3 border-b border-gray-10">
                  <p className="text-label-01 text-gray-50 font-medium">
                    By Supplier ({report.partyTotals.length})
                  </p>
                </div>
                {report.partyTotals
                  .slice()
                  .sort((a, b) => b.totalAmount - a.totalAmount)
                  .map((party) => (
                    <PartyRow key={party.partyId} party={party} />
                  ))}
              </Card>
            )}
          </>
        )}
      </div>
    </>
  );
}
