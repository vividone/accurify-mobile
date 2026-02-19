import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMyStore, usePendingOrdersCount, useOrders, useProductSummary } from '@/queries';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useQueryClient } from '@tanstack/react-query';
import { ORDER_STATUS_META } from '@/types/store.types';
import {
  BuildingStorefrontIcon,
  ShoppingBagIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CubeIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';

const orderStatusVariant: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'gray' | 'purple'> = {
  PENDING: 'gray',
  CONFIRMED: 'info',
  PROCESSING: 'purple',
  READY: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

export function StoreDashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: store, isLoading: storeLoading } = useMyStore();
  const { data: pendingCount } = usePendingOrdersCount(!!store);
  const { data: recentOrdersData } = useOrders(0, 5);
  const { data: productSummary } = useProductSummary();

  const recentOrders = recentOrdersData?.content ?? [];

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['store'] });
    await queryClient.invalidateQueries({ queryKey: ['products'] });
  }, [queryClient]);

  const { containerRef, PullIndicator } = usePullToRefresh({ onRefresh: handleRefresh });

  if (storeLoading) {
    return <DashboardSkeleton />;
  }

  if (!store) {
    return (
      <>
        <PageHeader title="Store" backTo="/app/dashboard" />
        <div className="page-content">
          <EmptyState
            icon={BuildingStorefrontIcon}
            title="No store yet"
            description="Set up your QuickStore to start selling online and managing orders."
            action={
              <button
                onClick={() => navigate('/app/settings')}
                className="px-4 py-2 bg-primary text-white text-body-01 font-medium rounded-lg"
              >
                Set Up Store
              </button>
            }
          />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Store" backTo="/app/dashboard" />
      <div className="page-content space-y-4" ref={containerRef}>
        <PullIndicator />

        {/* Store info */}
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden bg-primary-50">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={store.storeName} className="w-full h-full object-cover" />
              ) : (
                <BuildingStorefrontIcon className="w-6 h-6 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-heading-02 text-gray-100 truncate">{store.storeName}</p>
                <Badge variant={store.isActive ? 'success' : 'gray'}>
                  {store.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <LinkIcon className="w-3.5 h-3.5 text-gray-40" />
                <p className="text-helper-01 text-primary truncate">{store.publicUrl}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card onClick={() => navigate('/app/orders')}>
            <div className="flex items-center gap-2 mb-1">
              <ClockIcon className="w-4 h-4 text-warning-dark" />
              <span className="text-helper-01 text-gray-50">Pending Orders</span>
            </div>
            <p className="text-heading-03 text-warning-dark tabular-nums">
              {pendingCount ?? 0}
            </p>
          </Card>
          <Card onClick={() => navigate('/app/products')}>
            <div className="flex items-center gap-2 mb-1">
              <CubeIcon className="w-4 h-4 text-primary" />
              <span className="text-helper-01 text-gray-50">Active Products</span>
            </div>
            <p className="text-heading-03 text-gray-100 tabular-nums">
              {productSummary?.activeProducts ?? 0}
            </p>
          </Card>
          {productSummary && (
            <>
              <Card>
                <div className="flex items-center gap-2 mb-1">
                  <CurrencyDollarIcon className="w-4 h-4 text-success" />
                  <span className="text-helper-01 text-gray-50">Inventory Value</span>
                </div>
                <p className="text-heading-03 text-success tabular-nums text-[13px]">
                  {formatCurrency(productSummary.totalInventoryValue)}
                </p>
              </Card>
              <Card onClick={() => navigate('/app/stock')}>
                <div className="flex items-center gap-2 mb-1">
                  <CubeIcon className="w-4 h-4 text-danger" />
                  <span className="text-helper-01 text-gray-50">Low Stock</span>
                </div>
                <p className="text-heading-03 text-danger tabular-nums">
                  {productSummary.lowStockProducts}
                </p>
              </Card>
            </>
          )}
        </div>

        {/* Store settings toggles */}
        <Card>
          <p className="text-label-01 text-gray-70 mb-3">Store Settings</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-body-01 text-gray-100">Accepting Orders</span>
              <Badge variant={store.acceptOrders ? 'success' : 'gray'}>
                {store.acceptOrders ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-01 text-gray-100">Pickup Available</span>
              <Badge variant={store.pickupAvailable ? 'success' : 'gray'}>
                {store.pickupAvailable ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-01 text-gray-100">Delivery Available</span>
              <Badge variant={store.deliveryAvailable ? 'success' : 'gray'}>
                {store.deliveryAvailable ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Recent orders */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-heading-01 text-gray-100">Recent Orders</p>
            <button
              onClick={() => navigate('/app/orders')}
              className="text-label-01 text-primary"
            >
              View All
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <Card>
              <div className="flex flex-col items-center py-4 text-center">
                <ShoppingBagIcon className="w-8 h-8 text-gray-30 mb-2" />
                <p className="text-body-01 text-gray-50">No orders yet</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((order) => (
                <Card
                  key={order.id}
                  onClick={() => navigate(`/app/orders/${order.id}`)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-body-01 font-medium text-gray-100">
                      {order.orderNumber}
                    </span>
                    <Badge variant={orderStatusVariant[order.status] ?? 'gray'}>
                      {ORDER_STATUS_META[order.status]?.displayName ?? order.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-heading-02 tabular-nums text-gray-100">
                      {formatCurrency(order.totalKobo / 100)}
                    </span>
                    <span className="text-helper-01 text-gray-40">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="space-y-2 pb-4">
          <button
            onClick={() => navigate('/app/pos')}
            className="w-full h-12 bg-primary text-white font-medium text-body-01 rounded-lg"
          >
            Open POS
          </button>
          <button
            onClick={() => navigate('/app/products/new')}
            className="w-full h-12 border border-gray-30 text-gray-70 font-medium text-body-01 rounded-lg"
          >
            Add Product
          </button>
        </div>
      </div>
    </>
  );
}
