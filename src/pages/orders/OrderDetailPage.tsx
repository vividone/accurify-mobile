import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  useOrder,
  useConfirmOrder,
  useMarkOrderProcessing,
  useMarkOrderReady,
  useCompleteOrder,
  useCancelOrder,
} from '@/queries';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useQueryClient } from '@tanstack/react-query';
import { useUIStore } from '@/store/ui.store';
import {
  OrderStatus,
  ORDER_STATUS_META,
  ORDER_SOURCE_META,
  PAYMENT_STATUS_META,
} from '@/types/store.types';

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'gray' | 'purple'> = {
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

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const showNotification = useUIStore((s) => s.showNotification);
  const { data: order, isLoading } = useOrder(id!);
  const confirmOrder = useConfirmOrder();
  const markProcessing = useMarkOrderProcessing();
  const markReady = useMarkOrderReady();
  const completeOrder = useCompleteOrder();
  const cancelOrder = useCancelOrder();
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['orders', id] });
  }, [queryClient, id]);

  const { handlers, PullIndicator } = usePullToRefresh({ onRefresh: handleRefresh });

  const handleAction = async (action: string) => {
    if (!order) return;
    try {
      switch (action) {
        case 'confirm':
          await confirmOrder.mutateAsync(order.id);
          break;
        case 'processing':
          await markProcessing.mutateAsync(order.id);
          break;
        case 'ready':
          await markReady.mutateAsync(order.id);
          break;
        case 'complete':
          await completeOrder.mutateAsync(order.id);
          break;
      }
      showNotification('Success', 'Order updated', 'success');
    } catch {
      showNotification('Error', 'Failed to update order', 'error');
    }
  };

  const handleCancel = async () => {
    if (!order) return;
    try {
      await cancelOrder.mutateAsync({ orderId: order.id, reason: cancelReason || undefined });
      showNotification('Success', 'Order cancelled', 'success');
      setShowCancel(false);
    } catch {
      showNotification('Error', 'Failed to cancel order', 'error');
    }
  };

  if (isLoading || !order) {
    return <DashboardSkeleton />;
  }

  const nextAction: Record<string, { label: string; action: string } | undefined> = {
    [OrderStatus.PENDING]: { label: 'Confirm Order', action: 'confirm' },
    [OrderStatus.CONFIRMED]: { label: 'Mark Processing', action: 'processing' },
    [OrderStatus.PROCESSING]: { label: 'Mark Ready', action: 'ready' },
    [OrderStatus.READY]: { label: 'Complete Order', action: 'complete' },
  };

  const next = nextAction[order.status];
  const canCancel = order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.CANCELLED;

  return (
    <>
      <PageHeader title={order.orderNumber} backTo="/app/orders" />
      <div className="page-content space-y-4" {...handlers}>
        <PullIndicator />

        {/* Status + source */}
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Badge variant={statusVariant[order.status] ?? 'gray'}>
              {ORDER_STATUS_META[order.status]?.displayName ?? order.status}
            </Badge>
            <Badge variant="gray">
              {ORDER_SOURCE_META[order.source]?.displayName ?? order.source}
            </Badge>
            <Badge variant={paymentVariant[order.paymentStatus] ?? 'gray'}>
              {PAYMENT_STATUS_META[order.paymentStatus]?.displayName ?? order.paymentStatus}
            </Badge>
          </div>
          <p className="text-helper-01 text-gray-40">Created {formatDate(order.createdAt)}</p>
        </Card>

        {/* Customer info */}
        {(order.customerName || order.customerPhone || order.customerEmail) && (
          <Card>
            <p className="text-label-01 text-gray-50 mb-2">Customer</p>
            {order.customerName && (
              <p className="text-body-01 text-gray-100">{order.customerName}</p>
            )}
            {order.customerPhone && (
              <a href={`tel:${order.customerPhone}`} className="text-body-01 text-primary block">
                {order.customerPhone}
              </a>
            )}
            {order.customerEmail && (
              <a href={`mailto:${order.customerEmail}`} className="text-body-01 text-primary block truncate">
                {order.customerEmail}
              </a>
            )}
            {order.customerAddress && (
              <p className="text-body-01 text-gray-70 mt-1">{order.customerAddress}</p>
            )}
          </Card>
        )}

        {/* Order items */}
        <Card padding={false}>
          <div className="px-4 py-3 border-b border-gray-10">
            <p className="text-label-01 text-gray-50 font-medium">
              Items ({order.items.length})
            </p>
          </div>
          <div className="divide-y divide-gray-10">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-body-01 text-gray-100 truncate">{item.productName}</p>
                  <p className="text-helper-01 text-gray-40">
                    {formatCurrency(item.unitPriceKobo / 100)} x {item.quantity}
                  </p>
                </div>
                <p className="text-body-01 font-medium tabular-nums text-gray-100">
                  {formatCurrency(item.totalKobo / 100)}
                </p>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-gray-20 space-y-1">
            <div className="flex justify-between text-body-01 text-gray-70">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatCurrency(order.subtotalKobo / 100)}</span>
            </div>
            {order.taxKobo > 0 && (
              <div className="flex justify-between text-body-01 text-gray-70">
                <span>Tax</span>
                <span className="tabular-nums">{formatCurrency(order.taxKobo / 100)}</span>
              </div>
            )}
            {order.discountKobo > 0 && (
              <div className="flex justify-between text-body-01 text-gray-70">
                <span>Discount</span>
                <span className="tabular-nums">-{formatCurrency(order.discountKobo / 100)}</span>
              </div>
            )}
            {order.deliveryFeeKobo > 0 && (
              <div className="flex justify-between text-body-01 text-gray-70">
                <span>Delivery Fee</span>
                <span className="tabular-nums">{formatCurrency(order.deliveryFeeKobo / 100)}</span>
              </div>
            )}
            <div className="flex justify-between text-heading-02 text-gray-100 pt-1">
              <span>Total</span>
              <span className="tabular-nums">{formatCurrency(order.totalKobo / 100)}</span>
            </div>
          </div>
        </Card>

        {/* Notes */}
        {order.notes && (
          <Card>
            <p className="text-label-01 text-gray-50 mb-1">Notes</p>
            <p className="text-body-01 text-gray-70">{order.notes}</p>
          </Card>
        )}

        {/* Cancellation info */}
        {order.status === OrderStatus.CANCELLED && order.cancellationReason && (
          <Card>
            <p className="text-label-01 text-danger mb-1">Cancellation Reason</p>
            <p className="text-body-01 text-gray-70">{order.cancellationReason}</p>
          </Card>
        )}

        {/* Action buttons */}
        <div className="space-y-2 pt-2 pb-4">
          {next && (
            <button
              onClick={() => handleAction(next.action)}
              className="w-full h-12 bg-primary text-white font-medium text-body-01 rounded-lg"
            >
              {next.label}
            </button>
          )}
          {canCancel && (
            <button
              onClick={() => setShowCancel(true)}
              className="w-full h-12 border border-danger text-danger font-medium text-body-01 rounded-lg"
            >
              Cancel Order
            </button>
          )}
        </div>

        {/* Cancel modal */}
        {showCancel && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setShowCancel(false)}>
            <div
              className="w-full bg-white rounded-t-2xl p-5 space-y-4"
              style={{ paddingBottom: 'calc(var(--safe-area-bottom) + 1.5rem)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-heading-02 text-gray-100">Cancel Order</h3>
              <div>
                <label className="block text-label-01 text-gray-70 mb-1.5">Reason (optional)</label>
                <textarea
                  rows={3}
                  placeholder="Why is this order being cancelled?"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-10 border border-gray-30 text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancel(false)}
                  className="flex-1 h-12 border border-gray-30 text-gray-70 font-medium rounded-lg"
                >
                  Keep Order
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelOrder.isPending}
                  className="flex-1 h-12 bg-danger text-white font-medium rounded-lg disabled:opacity-50"
                >
                  {cancelOrder.isPending ? 'Cancelling...' : 'Cancel Order'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
