import { useState, useCallback } from 'react';
import { useProductProfitability } from '@/queries/gl.queries';
import { Card } from '@/components/ui/Card';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatCurrency } from '@/utils/currency';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useQueryClient } from '@tanstack/react-query';
import { format, startOfYear } from 'date-fns';
import { ExclamationTriangleIcon, DocumentChartBarIcon } from '@heroicons/react/24/outline';
import type { ProductProfitabilityLine } from '@/queries/gl.queries';

function formatDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

function getMarginColor(margin: number): { text: string; bg: string } {
  if (margin >= 20) return { text: 'text-green-700', bg: 'bg-green-50' };
  if (margin >= 0) return { text: 'text-yellow-700', bg: 'bg-yellow-50' };
  return { text: 'text-red-700', bg: 'bg-red-50' };
}

function ProductCard({ product }: { product: ProductProfitabilityLine }) {
  const marginColor = getMarginColor(product.grossMarginPercent);

  return (
    <Card>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0 mr-3">
          <p className="text-body-01 font-medium text-gray-100 truncate">
            {product.productName}
          </p>
          {product.sku && (
            <p className="text-helper-01 text-gray-40">{product.sku}</p>
          )}
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${marginColor.bg} ${marginColor.text}`}>
          {product.grossMarginPercent.toFixed(1)}%
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-helper-01 text-gray-40">Revenue</p>
          <p className="text-body-01 font-medium tabular-nums text-gray-100">
            {formatCurrency(product.revenue)}
          </p>
        </div>
        <div>
          <p className="text-helper-01 text-gray-40">COGS</p>
          <p className="text-body-01 font-medium tabular-nums text-gray-100">
            {formatCurrency(product.costOfGoodsSold)}
          </p>
        </div>
        <div>
          <p className="text-helper-01 text-gray-40">Gross Profit</p>
          <p className={`text-body-01 font-medium tabular-nums ${product.grossProfit >= 0 ? 'text-success' : 'text-danger'}`}>
            {formatCurrency(product.grossProfit)}
          </p>
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-gray-10 flex items-center justify-between text-helper-01 text-gray-50">
        <span>Qty sold: {product.quantitySold}</span>
        <span>
          Avg sell: {formatCurrency(product.averageSellPrice)} / Cost: {formatCurrency(product.averageCostPrice)}
        </span>
      </div>
    </Card>
  );
}

export function ProductProfitabilityPage() {
  const queryClient = useQueryClient();
  const now = new Date();
  const [startDate, setStartDate] = useState(formatDate(startOfYear(now)));
  const [endDate, setEndDate] = useState(formatDate(now));

  const { data: report, isLoading, isError, error } = useProductProfitability(startDate, endDate);

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['gl'] });
  }, [queryClient]);

  const { containerRef, PullIndicator } = usePullToRefresh({ onRefresh: handleRefresh });

  const hasData = report && report.products.length > 0;

  return (
    <>
      <PageHeader title="Product Profitability" backTo="/app/dashboard" />
      <div className="page-content space-y-4" ref={containerRef}>
        <PullIndicator />

        {/* Date range */}
        <Card>
          <p className="text-label-01 text-gray-70 mb-2">Period</p>
          <div className="grid grid-cols-2 gap-3">
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
        </Card>

        {isLoading && <DashboardSkeleton />}

        {isError && (
          <Card>
            <div className="flex flex-col items-center py-6 text-center">
              <ExclamationTriangleIcon className="w-10 h-10 text-gray-40 mb-3" />
              <p className="text-body-01 text-gray-70 mb-1">
                Failed to load product profitability report
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
                No product data for this period
              </p>
              <p className="text-helper-01 text-gray-50">
                Create invoices with products to see profitability analysis.
              </p>
            </div>
          </Card>
        )}

        {!isLoading && !isError && report && hasData && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <p className="text-label-01 text-gray-50">Total Revenue</p>
                <p className="text-heading-03 font-semibold tabular-nums text-gray-100">
                  {formatCurrency(report.totalRevenue)}
                </p>
              </Card>
              <Card>
                <p className="text-label-01 text-gray-50">Total COGS</p>
                <p className="text-heading-03 font-semibold tabular-nums text-gray-100">
                  {formatCurrency(report.totalCogs)}
                </p>
              </Card>
              <Card>
                <p className="text-label-01 text-gray-50">Gross Profit</p>
                <p className={`text-heading-03 font-semibold tabular-nums ${report.totalGrossProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                  {formatCurrency(report.totalGrossProfit)}
                </p>
              </Card>
              <Card>
                <p className="text-label-01 text-gray-50">Avg Margin</p>
                <p className={`text-heading-03 font-semibold tabular-nums ${report.averageGrossMargin >= 20 ? 'text-success' : report.averageGrossMargin >= 0 ? 'text-warning-dark' : 'text-danger'}`}>
                  {report.averageGrossMargin.toFixed(1)}%
                </p>
              </Card>
            </div>

            {/* Product list */}
            <div className="space-y-3">
              <p className="text-label-01 text-gray-50 font-medium px-1">
                Products ({report.totalProducts})
              </p>
              {report.products
                .slice()
                .sort((a, b) => b.grossProfit - a.grossProfit)
                .map((product) => (
                  <ProductCard key={product.productId} product={product} />
                ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
