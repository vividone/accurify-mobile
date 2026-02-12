import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStockHistory, useStockSummary, useRecordStockMovement, useProducts } from '@/queries';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatDate, getTodayString } from '@/utils/date';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useQueryClient } from '@tanstack/react-query';
import { useUIStore } from '@/store/ui.store';
import { StockMovementType, STOCK_MOVEMENT_META } from '@/types/enums';
import {
  ArchiveBoxIcon,
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

type FilterValue = 'ALL' | StockMovementType;

const filters: { label: string; value: FilterValue }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Purchases', value: StockMovementType.PURCHASE },
  { label: 'Sales', value: StockMovementType.SALE },
  { label: 'Adjustments', value: StockMovementType.ADJUSTMENT_IN },
  { label: 'Returns', value: StockMovementType.RETURN_FROM_CUSTOMER },
];

export function StockPage() {
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const showNotification = useUIStore((s) => s.showNotification);
  const [activeFilter, setActiveFilter] = useState<FilterValue>('ALL');
  const [page] = useState(0);
  const [showAddMovement, setShowAddMovement] = useState(false);

  const { data: stockData, isLoading } = useStockHistory(page, 50);
  const { data: summary } = useStockSummary();
  const { data: productsData } = useProducts(0, 200, { active: true });
  const recordMovement = useRecordStockMovement();

  let movements = stockData?.content ?? [];
  const products = productsData?.content ?? [];

  // Client-side filter
  if (activeFilter !== 'ALL') {
    if (activeFilter === StockMovementType.ADJUSTMENT_IN) {
      movements = movements.filter(
        (m) => m.movementType === StockMovementType.ADJUSTMENT_IN || m.movementType === StockMovementType.ADJUSTMENT_OUT
      );
    } else if (activeFilter === StockMovementType.RETURN_FROM_CUSTOMER) {
      movements = movements.filter(
        (m) => m.movementType === StockMovementType.RETURN_FROM_CUSTOMER || m.movementType === StockMovementType.RETURN_TO_SUPPLIER
      );
    } else {
      movements = movements.filter((m) => m.movementType === activeFilter);
    }
  }

  // Filter by productId from query param
  const productIdFilter = searchParams.get('productId');
  if (productIdFilter) {
    movements = movements.filter((m) => m.productId === productIdFilter);
  }

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['stock'] });
  }, [queryClient]);

  const { handlers, PullIndicator } = usePullToRefresh({ onRefresh: handleRefresh });

  // Movement form state
  const [movProductId, setMovProductId] = useState('');
  const [movType, setMovType] = useState<StockMovementType>(StockMovementType.PURCHASE);
  const [movQty, setMovQty] = useState(1);
  const [movPrice, setMovPrice] = useState(0);
  const [movNotes, setMovNotes] = useState('');

  const handleRecordMovement = async () => {
    try {
      await recordMovement.mutateAsync({
        productId: movProductId,
        movementType: movType,
        quantity: movQty,
        date: getTodayString(),
        unitPrice: movPrice > 0 ? movPrice : undefined,
        notes: movNotes || undefined,
      });
      showNotification('Success', 'Stock movement recorded', 'success');
      setShowAddMovement(false);
      setMovProductId('');
      setMovQty(1);
      setMovPrice(0);
      setMovNotes('');
    } catch {
      showNotification('Error', 'Failed to record movement', 'error');
    }
  };

  return (
    <>
      <PageHeader
        title={productIdFilter ? 'Stock History' : 'Inventory'}
        backTo={productIdFilter ? `/app/products/${productIdFilter}` : '/app/dashboard'}
        actions={
          <button
            onClick={() => setShowAddMovement(true)}
            className="p-1.5 text-primary active:bg-primary-50 rounded-full"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        }
      />
      <div className="page-content" {...handlers}>
        <PullIndicator />

        {/* Summary */}
        {summary && !productIdFilter && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            <Card>
              <p className="text-helper-01 text-gray-50">Purchases</p>
              <p className="text-heading-03 text-success tabular-nums">{summary.purchaseCount}</p>
            </Card>
            <Card>
              <p className="text-helper-01 text-gray-50">Sales</p>
              <p className="text-heading-03 text-primary tabular-nums">{summary.saleCount}</p>
            </Card>
            <Card>
              <p className="text-helper-01 text-gray-50">Total</p>
              <p className="text-heading-03 text-gray-100 tabular-nums">{summary.totalMovements}</p>
            </Card>
          </div>
        )}

        {/* Filter chips */}
        {!productIdFilter && (
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
        )}

        {/* Stock history */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : movements.length === 0 ? (
          <EmptyState
            icon={ArchiveBoxIcon}
            title="No stock movements"
            description="Record purchases, sales, and adjustments to track inventory."
            action={
              <button
                onClick={() => setShowAddMovement(true)}
                className="px-4 py-2 bg-primary text-white text-body-01 font-medium rounded-lg"
              >
                Add Movement
              </button>
            }
          />
        ) : (
          <div className="space-y-3">
            {movements.map((m) => {
              const meta = STOCK_MOVEMENT_META[m.movementType as StockMovementType];
              const adds = meta?.addsStock;
              return (
                <Card key={m.id}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${adds ? 'bg-success-light' : 'bg-danger-light'}`}>
                      {adds ? (
                        <ArrowDownIcon className="w-4 h-4 text-success" />
                      ) : (
                        <ArrowUpIcon className="w-4 h-4 text-danger" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-body-01 font-medium text-gray-100 truncate">
                        {m.productName}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant={adds ? 'success' : 'danger'}>
                          {meta?.displayName ?? m.movementType}
                        </Badge>
                        <span className="text-helper-01 text-gray-40">{formatDate(m.date)}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-body-01 font-medium tabular-nums ${adds ? 'text-success' : 'text-danger'}`}>
                        {adds ? '+' : '-'}{m.quantity}
                      </p>
                      <p className="text-helper-01 text-gray-40 tabular-nums">
                        Bal: {m.balanceAfter}
                      </p>
                    </div>
                  </div>
                  {m.notes && (
                    <p className="text-helper-01 text-gray-40 mt-2 truncate">{m.notes}</p>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add movement modal */}
      {showAddMovement && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setShowAddMovement(false)}>
          <div
            className="w-full max-h-[85vh] bg-white rounded-t-2xl overflow-y-auto p-5 space-y-4"
            style={{ paddingBottom: 'calc(var(--safe-area-bottom) + 1.5rem)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-heading-02 text-gray-100">Record Stock Movement</h3>

            <div>
              <label className="block text-label-01 text-gray-70 mb-1.5">Product</label>
              <select
                value={movProductId}
                onChange={(e) => setMovProductId(e.target.value)}
                className="w-full h-12 px-4 bg-gray-10 border border-gray-30 text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-label-01 text-gray-70 mb-1.5">Movement Type</label>
              <select
                value={movType}
                onChange={(e) => setMovType(e.target.value as StockMovementType)}
                className="w-full h-12 px-4 bg-gray-10 border border-gray-30 text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {Object.entries(STOCK_MOVEMENT_META).map(([key, meta]) => (
                  <option key={key} value={key}>{meta.displayName}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-label-01 text-gray-70 mb-1.5">Quantity</label>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={movQty}
                  onChange={(e) => setMovQty(Number(e.target.value) || 1)}
                  className="w-full h-12 px-4 bg-gray-10 border border-gray-30 text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-label-01 text-gray-70 mb-1.5">Unit Price</label>
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.01}
                  value={movPrice}
                  onChange={(e) => setMovPrice(Number(e.target.value) || 0)}
                  className="w-full h-12 px-4 bg-gray-10 border border-gray-30 text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-label-01 text-gray-70 mb-1.5">Notes (optional)</label>
              <textarea
                rows={2}
                placeholder="Additional notes..."
                value={movNotes}
                onChange={(e) => setMovNotes(e.target.value)}
                className="w-full px-3 py-2 bg-gray-10 border border-gray-30 text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAddMovement(false)}
                className="flex-1 h-12 border border-gray-30 text-gray-70 font-medium rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordMovement}
                disabled={!movProductId || movQty < 1 || recordMovement.isPending}
                className="flex-1 h-12 bg-primary text-white font-medium rounded-lg disabled:opacity-50"
              >
                {recordMovement.isPending ? 'Recording...' : 'Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
