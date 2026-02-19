import { useState, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useProduct,
  useDeactivateProduct,
  useActivateProduct,
  useRecordProductSale,
  useStockHistoryByProduct,
  useUploadProductImage,
} from '@/queries';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { formatCurrency, formatNumber } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useQueryClient } from '@tanstack/react-query';
import { useUIStore } from '@/store/ui.store';
import { BatchManagementSection } from '@/components/products/BatchManagementSection';
import { PRODUCT_CATEGORY_META, STOCK_MOVEMENT_META } from '@/types/enums';
import type { StockMovementType } from '@/types/enums';
import {
  CubeIcon,
  TagIcon,
  ChartBarIcon,
  CameraIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const showNotification = useUIStore((s) => s.showNotification);
  const { data: product, isLoading } = useProduct(id!);
  const { data: stockData } = useStockHistoryByProduct(id!, 0, 10);
  const deactivate = useDeactivateProduct();
  const activateProduct = useActivateProduct();
  const recordSale = useRecordProductSale();
  const uploadImage = useUploadProductImage();
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [showSaleModal, setShowSaleModal] = useState(false);
  const [saleQty, setSaleQty] = useState(1);

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['products'] });
    await queryClient.invalidateQueries({ queryKey: ['stock'] });
  }, [queryClient]);

  const { containerRef, PullIndicator } = usePullToRefresh({ onRefresh: handleRefresh });

  const handleRecordSale = async () => {
    if (!product) return;
    try {
      await recordSale.mutateAsync({
        productId: product.id,
        quantity: saleQty,
        date: new Date().toISOString().split('T')[0],
        unitPrice: product.unitPrice,
        createTransaction: true,
      });
      showNotification('Success', `Sold ${saleQty} ${product.unit || 'pcs'}`, 'success');
      setShowSaleModal(false);
      setSaleQty(1);
    } catch {
      showNotification('Error', 'Failed to record sale', 'error');
    }
  };

  const handleToggleActive = async () => {
    if (!product) return;
    try {
      if (product.active) {
        await deactivate.mutateAsync(product.id);
        showNotification('Info', 'Product deactivated', 'success');
      } else {
        await activateProduct.mutateAsync(product.id);
        showNotification('Success', 'Product activated', 'success');
      }
    } catch {
      showNotification('Error', 'Action failed', 'error');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !product) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showNotification('Error', 'Only JPEG, PNG, GIF, and WebP images are allowed', 'error');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showNotification('Error', 'Image must be less than 2MB', 'error');
      return;
    }

    try {
      await uploadImage.mutateAsync({ productId: product.id, file });
      showNotification('Success', 'Product image updated', 'success');
    } catch {
      showNotification('Error', 'Failed to upload image', 'error');
    }

    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  if (isLoading || !product) {
    return <DashboardSkeleton />;
  }

  const stockHistory = stockData?.content ?? [];
  // Use WAC (averageCostPrice) for margin if available, otherwise fall back to static costPrice
  const effectiveCost = (product.averageCostPrice && product.averageCostPrice > 0)
    ? product.averageCostPrice
    : product.costPrice;
  const margin = effectiveCost && effectiveCost > 0
    ? (((product.unitPrice - effectiveCost) / product.unitPrice) * 100).toFixed(1)
    : null;
  const inventoryValue = effectiveCost && effectiveCost > 0
    ? effectiveCost * product.stockQuantity
    : null;

  return (
    <>
      <PageHeader
        title={product.name}
        backTo="/app/products"
        actions={
          <button
            onClick={() => navigate(`/app/products/${id}/edit`)}
            className="p-1.5 text-primary active:bg-primary-50 rounded-full"
          >
            <PencilSquareIcon className="w-5 h-5" />
          </button>
        }
      />
      <div className="page-content space-y-4" ref={containerRef}>
        <PullIndicator />

        {/* Product header */}
        <Card>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={uploadImage.isPending}
              className="relative w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden bg-primary-50 border-0 cursor-pointer"
            >
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <CubeIcon className="w-7 h-7 text-primary" />
              )}
              <div className="absolute inset-0 bg-black/0 hover:bg-black/20 active:bg-black/30 transition-colors flex items-center justify-center">
                <CameraIcon className="w-5 h-5 text-white opacity-0 hover:opacity-100" />
              </div>
              {uploadImage.isPending && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={handleImageUpload}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-heading-03 text-gray-100 truncate">{product.name}</p>
                {!product.active && <Badge variant="gray">Inactive</Badge>}
              </div>
              <p className="text-label-01 text-gray-50">
                {PRODUCT_CATEGORY_META[product.category]?.displayName ?? product.category}
              </p>
              {product.sku && (
                <p className="text-helper-01 text-gray-40">SKU: {product.sku}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <div className="flex items-center gap-2 mb-1">
              <TagIcon className="w-4 h-4 text-primary" />
              <span className="text-helper-01 text-gray-50">Selling Price</span>
            </div>
            <p className="text-heading-03 text-gray-100 tabular-nums">
              {formatCurrency(product.unitPrice)}
            </p>
          </Card>
          <Card>
            <div className="flex items-center gap-2 mb-1">
              <CubeIcon className="w-4 h-4 text-primary" />
              <span className="text-helper-01 text-gray-50">In Stock</span>
            </div>
            <p className="text-heading-03 text-gray-100 tabular-nums">
              {formatNumber(product.stockQuantity)} {product.unit || 'pcs'}
            </p>
            {product.outOfStock && <Badge variant="danger">Out of stock</Badge>}
            {product.lowStock && !product.outOfStock && <Badge variant="warning">Low stock</Badge>}
          </Card>
          {effectiveCost != null && effectiveCost > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-1">
                <TagIcon className="w-4 h-4 text-gray-50" />
                <span className="text-helper-01 text-gray-50">
                  {product.averageCostPrice && product.averageCostPrice > 0 ? 'Avg Cost (WAC)' : 'Cost Price'}
                </span>
              </div>
              <p className="text-heading-03 text-gray-100 tabular-nums">
                {formatCurrency(effectiveCost)}
              </p>
            </Card>
          )}
          {margin && (
            <Card>
              <div className="flex items-center gap-2 mb-1">
                <ChartBarIcon className={`w-4 h-4 ${Number(margin) >= 0 ? 'text-success' : 'text-danger'}`} />
                <span className="text-helper-01 text-gray-50">Margin</span>
              </div>
              <p className={`text-heading-03 tabular-nums ${Number(margin) >= 0 ? 'text-success' : 'text-danger'}`}>
                {margin}%
              </p>
            </Card>
          )}
          {inventoryValue != null && inventoryValue > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-1">
                <CubeIcon className="w-4 h-4 text-primary" />
                <span className="text-helper-01 text-gray-50">Inventory Value</span>
              </div>
              <p className="text-heading-03 text-primary tabular-nums text-[13px]">
                {formatCurrency(inventoryValue)}
              </p>
            </Card>
          )}
        </div>

        {/* Tax info */}
        {product.taxable && (
          <Card>
            <p className="text-label-01 text-gray-70 mb-1">Tax</p>
            <p className="text-body-01 text-gray-100">
              VAT {product.vatRate}% — Price with VAT: {formatCurrency(product.priceWithVat)}
            </p>
          </Card>
        )}

        {/* Recent stock movements */}
        {stockHistory.length > 0 && (
          <div>
            <p className="text-heading-01 text-gray-100 mb-3">Recent Stock Movements</p>
            <Card padding={false}>
              <div className="divide-y divide-gray-10">
                {stockHistory.slice(0, 5).map((m) => {
                  const meta = STOCK_MOVEMENT_META[m.movementType as StockMovementType];
                  return (
                    <div key={m.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-body-01 text-gray-100">{meta?.displayName ?? m.movementType}</p>
                        <p className="text-helper-01 text-gray-40">{formatDate(m.date)}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-body-01 font-medium tabular-nums ${meta?.addsStock ? 'text-success' : 'text-danger'}`}>
                          {meta?.addsStock ? '+' : '-'}{m.quantity}
                        </p>
                        <p className="text-helper-01 text-gray-40 tabular-nums">
                          Bal: {m.balanceAfter}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {/* Batch tracking */}
        <BatchManagementSection
          productId={product.id}
          enableBatchTracking={product.enableBatchTracking}
        />

        {/* Action buttons */}
        <div className="space-y-2 pt-2 pb-4">
          <button
            onClick={() => setShowSaleModal(true)}
            disabled={product.outOfStock || !product.active}
            className="w-full h-12 bg-primary text-white font-medium text-body-01 rounded-lg disabled:opacity-50"
          >
            Record Sale
          </button>
          <button
            onClick={() => navigate(`/app/products/${id}/edit`)}
            className="w-full h-12 border border-primary text-primary font-medium text-body-01 rounded-lg"
          >
            Edit Product
          </button>
          <button
            onClick={() => navigate(`/app/stock?productId=${product.id}`)}
            className="w-full h-12 border border-gray-30 text-gray-70 font-medium text-body-01 rounded-lg"
          >
            View Stock History
          </button>
          <button
            onClick={handleToggleActive}
            className="w-full h-12 border border-gray-30 text-gray-70 font-medium text-body-01 rounded-lg"
          >
            {product.active ? 'Deactivate Product' : 'Activate Product'}
          </button>
        </div>

        {/* Sale modal */}
        {showSaleModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setShowSaleModal(false)}>
            <div
              className="w-full bg-white rounded-t-2xl p-5 space-y-4"
              style={{ paddingBottom: 'calc(var(--safe-area-bottom) + 1.5rem)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-heading-02 text-gray-100">Record Sale</h3>
              <p className="text-body-01 text-gray-70">
                {product.name} — {formatCurrency(product.unitPrice)}/{product.unit || 'pcs'}
              </p>
              <div>
                <label className="block text-label-01 text-gray-70 mb-1.5">Quantity</label>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={product.stockQuantity}
                  value={saleQty}
                  onChange={(e) => setSaleQty(Number(e.target.value) || 1)}
                  className="w-full h-12 px-4 bg-gray-10 border border-gray-30 text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="mt-1 text-helper-01 text-gray-50">
                  Available: {product.stockQuantity} {product.unit || 'pcs'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-heading-02 text-gray-100">
                  Total: {formatCurrency(saleQty * product.unitPrice)}
                </p>
                {effectiveCost != null && effectiveCost > 0 && (
                  <p className="text-helper-01 text-gray-50">
                    COGS: {formatCurrency(saleQty * effectiveCost)} · Profit:{' '}
                    <span className={saleQty * product.unitPrice - saleQty * effectiveCost >= 0 ? 'text-success' : 'text-danger'}>
                      {formatCurrency(saleQty * product.unitPrice - saleQty * effectiveCost)}
                    </span>
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSaleModal(false)}
                  className="flex-1 h-12 border border-gray-30 text-gray-70 font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRecordSale}
                  disabled={saleQty < 1 || saleQty > product.stockQuantity || recordSale.isPending}
                  className="flex-1 h-12 bg-primary text-white font-medium rounded-lg disabled:opacity-50"
                >
                  {recordSale.isPending ? 'Recording...' : 'Confirm Sale'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
