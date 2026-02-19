import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts, useProductSummary } from '@/queries';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatCurrency, formatNumber } from '@/utils/currency';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useQueryClient } from '@tanstack/react-query';
import { PRODUCT_CATEGORY_META } from '@/types/enums';
import {
  CubeIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

type FilterValue = 'ALL' | 'ACTIVE' | 'LOW_STOCK' | 'OUT_OF_STOCK';

const filters: { label: string; value: FilterValue }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Low Stock', value: 'LOW_STOCK' },
  { label: 'Out of Stock', value: 'OUT_OF_STOCK' },
];

export function ProductListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<FilterValue>('ALL');
  const [search, setSearch] = useState('');
  const [page] = useState(0);

  const activeParam = activeFilter === 'ACTIVE' ? true : undefined;
  const { data: productsData, isLoading } = useProducts(page, 100, {
    active: activeParam,
  });
  const { data: summary } = useProductSummary();

  let products = productsData?.content ?? [];

  // Client-side filtering for search, low stock, and out of stock
  if (search) {
    const q = search.toLowerCase();
    products = products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q)
    );
  }
  if (activeFilter === 'LOW_STOCK') {
    products = products.filter((p) => p.lowStock && !p.outOfStock);
  } else if (activeFilter === 'OUT_OF_STOCK') {
    products = products.filter((p) => p.outOfStock);
  }

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['products'] });
  }, [queryClient]);

  const { containerRef, PullIndicator } = usePullToRefresh({ onRefresh: handleRefresh });

  return (
    <>
      <PageHeader
        title="Products"
        backTo="/app/dashboard"
        actions={
          <button
            onClick={() => navigate('/app/products/new')}
            className="p-1.5 text-primary active:bg-primary-50 rounded-full"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        }
      />
      <div
        className="page-content"
        ref={containerRef}
      >
        <PullIndicator />

        {/* Summary cards */}
        {summary && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            <Card>
              <p className="text-helper-01 text-gray-50">Total</p>
              <p className="text-heading-03 text-gray-100 tabular-nums">{summary.activeProducts}</p>
            </Card>
            <Card>
              <p className="text-helper-01 text-gray-50">Low Stock</p>
              <p className="text-heading-03 text-warning-dark tabular-nums">{summary.lowStockProducts}</p>
            </Card>
            <Card>
              <p className="text-helper-01 text-gray-50">Value</p>
              <p className="text-heading-03 text-primary tabular-nums text-[13px]">
                {formatCurrency(summary.totalInventoryValue)}
              </p>
            </Card>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-3">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-40" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4 -mx-4 px-4">
          {filters.map((filter) => (
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

        {/* Product list */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={CubeIcon}
            title="No products found"
            description="Add your first product to start managing inventory."
            action={
              <button
                onClick={() => navigate('/app/products/new')}
                className="px-4 py-2 bg-primary text-white text-body-01 font-medium rounded-lg"
              >
                Add Product
              </button>
            }
          />
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <Card
                key={product.id}
                onClick={() => navigate(`/app/products/${product.id}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden bg-primary-50">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <CubeIcon className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-body-01 font-medium text-gray-100 truncate">
                        {product.name}
                      </p>
                      {product.outOfStock && (
                        <Badge variant="danger">Out</Badge>
                      )}
                      {product.lowStock && !product.outOfStock && (
                        <Badge variant="warning">Low</Badge>
                      )}
                    </div>
                    <p className="text-label-01 text-gray-50 truncate">
                      {product.sku ? `SKU: ${product.sku}` : PRODUCT_CATEGORY_META[product.category]?.displayName ?? product.category}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-body-01 font-medium tabular-nums text-gray-100">
                      {formatCurrency(product.unitPrice)}
                    </p>
                    <div className="flex items-center justify-end gap-1.5">
                      <p className="text-helper-01 text-gray-40 tabular-nums">
                        {formatNumber(product.stockQuantity)} in stock
                      </p>
                      {product.profitMargin != null && product.profitMargin > 0 && (
                        <span className={`text-helper-01 font-medium tabular-nums ${product.profitMargin >= 20 ? 'text-success' : product.profitMargin >= 10 ? 'text-warning-dark' : 'text-danger'}`}>
                          {product.profitMargin.toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
