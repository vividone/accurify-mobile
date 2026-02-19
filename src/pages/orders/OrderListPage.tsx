import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders, useOrderSearch } from '@/queries';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useQueryClient } from '@tanstack/react-query';
import {
  OrderStatus,
  ORDER_STATUS_META,
  ORDER_SOURCE_META,
} from '@/types/store.types';
import { ShoppingBagIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

const statusFilters: { label: string; value: OrderStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: OrderStatus.PENDING },
  { label: 'Confirmed', value: OrderStatus.CONFIRMED },
  { label: 'Processing', value: OrderStatus.PROCESSING },
  { label: 'Ready', value: OrderStatus.READY },
  { label: 'Completed', value: OrderStatus.COMPLETED },
  { label: 'Cancelled', value: OrderStatus.CANCELLED },
];

const orderStatusVariant: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'gray' | 'purple'> = {
  PENDING: 'gray',
  CONFIRMED: 'info',
  PROCESSING: 'purple',
  READY: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

const paymentVariant: Record<string, 'success' | 'warning' | 'danger' | 'gray'> = {
  UNPAID: 'danger',
  PARTIAL: 'warning',
  PAID: 'success',
  REFUNDED: 'gray',
};

export function OrderListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [page] = useState(0);
  const status = activeFilter === 'ALL' ? undefined : activeFilter;

  const { data: ordersData, isLoading } = useOrders(page, 50, status);
  const { data: searchData, isLoading: isSearching } = useOrderSearch(search, 0, 50);

  const isSearchActive = search.length >= 2;
  const orders = isSearchActive ? (searchData?.content ?? []) : (ordersData?.content ?? []);

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['orders'] });
  }, [queryClient]);

  const { containerRef, PullIndicator } = usePullToRefresh({ onRefresh: handleRefresh });

  return (
    <>
      <PageHeader title="Orders" backTo="/app/dashboard" />
      <div className="page-content" ref={containerRef}>
        <PullIndicator />

        {/* Search */}
        <div className="relative mb-3">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-40" />
          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Filter chips */}
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

        {/* Order list */}
        {(isLoading || (isSearchActive && isSearching)) ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={ShoppingBagIcon}
            title="No orders yet"
            description={
              activeFilter !== 'ALL'
                ? `No ${ORDER_STATUS_META[activeFilter]?.displayName.toLowerCase()} orders.`
                : 'Orders from your POS and store will appear here.'
            }
          />
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
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
                <div className="flex items-center gap-2 mb-2">
                  {order.customerName && (
                    <p className="text-label-01 text-gray-50 truncate">
                      {order.customerName}
                    </p>
                  )}
                  <Badge variant="gray">
                    {ORDER_SOURCE_META[order.source]?.displayName ?? order.source}
                  </Badge>
                  <Badge variant={paymentVariant[order.paymentStatus] ?? 'gray'}>
                    {order.paymentStatus}
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
                {order.items.length > 0 && (
                  <p className="text-helper-01 text-gray-40 mt-1 truncate">
                    {order.items.map((item) => `${item.productName} x${item.quantity}`).join(', ')}
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
