import { Fragment, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import {
  BanknotesIcon,
  DocumentIcon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import {
  useOrder,
  useConfirmOrder,
  useMarkOrderProcessing,
  useMarkOrderReady,
  useCompleteOrder,
  useCancelOrder,
  useUpdateOrderPayment,
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
  OrderPaymentStatus,
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

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CARD', label: 'Card' },
  { value: 'MOBILE_MONEY', label: 'Mobile Money' },
  { value: 'ONLINE', label: 'Online (Paystack)' },
] as const;

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
  const updatePayment = useUpdateOrderPayment();
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Mark as Paid state
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [paymentReference, setPaymentReference] = useState('');

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['orders', id] });
  }, [queryClient, id]);

  const { containerRef, PullIndicator } = usePullToRefresh({ onRefresh: handleRefresh });

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

  const handleMarkAsPaid = async () => {
    if (!order) return;
    try {
      await updatePayment.mutateAsync({
        orderId: order.id,
        status: OrderPaymentStatus.PAID,
        method: paymentMethod,
        reference: paymentReference || undefined,
      });
      showNotification('Success', 'Payment recorded successfully', 'success');
      setShowPayment(false);
      setPaymentMethod('CASH');
      setPaymentReference('');
    } catch {
      showNotification('Error', 'Failed to record payment', 'error');
    }
  };

  const openPaymentSheet = () => {
    setPaymentMethod('CASH');
    setPaymentReference('');
    setShowPayment(true);
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
  const canMarkPaid =
    order.paymentStatus !== OrderPaymentStatus.PAID &&
    order.paymentStatus !== OrderPaymentStatus.REFUNDED &&
    order.status !== OrderStatus.CANCELLED;

  return (
    <>
      <PageHeader title={order.orderNumber} backTo="/app/orders" />
      <div className="page-content space-y-4" ref={containerRef}>
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

        {/* Payment Proof */}
        {order.paymentProofUrl && (
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <DocumentIcon className="w-5 h-5 text-gray-50" />
              <p className="text-label-01 text-gray-50 font-medium">Payment Proof</p>
            </div>
            <div className="flex items-start gap-3">
              <a
                href={order.paymentProofUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 w-16 h-16 bg-gray-10 rounded-lg border border-gray-20 overflow-hidden flex items-center justify-center"
              >
                <img
                  src={order.paymentProofUrl}
                  alt="Payment proof"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // If image fails to load, show a document icon fallback
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.classList.add('flex', 'items-center', 'justify-center');
                    const icon = document.createElement('span');
                    icon.textContent = 'PDF';
                    icon.className = 'text-helper-01 text-gray-40 font-medium';
                    target.parentElement!.appendChild(icon);
                  }}
                />
              </a>
              <div className="flex-1 min-w-0">
                <a
                  href={order.paymentProofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-body-01 text-primary font-medium"
                >
                  View Proof
                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                </a>
                {order.paymentProofSubmittedAt && (
                  <p className="text-helper-01 text-gray-40 mt-1">
                    Submitted {formatDate(order.paymentProofSubmittedAt)}
                  </p>
                )}
                {order.paymentProofNote && (
                  <p className="text-body-01 text-gray-70 mt-1">{order.paymentProofNote}</p>
                )}
              </div>
            </div>
          </Card>
        )}

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
          {canMarkPaid && (
            <button
              onClick={openPaymentSheet}
              className="w-full h-12 flex items-center justify-center gap-2 bg-green-600 text-white font-medium text-body-01 rounded-lg active:bg-green-700 transition-colors"
            >
              <BanknotesIcon className="w-5 h-5" />
              Mark as Paid
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

      {/* Mark as Paid bottom sheet */}
      <Transition show={showPayment} as={Fragment}>
        <Dialog onClose={() => setShowPayment(false)} className="relative z-[60]">
          {/* Backdrop */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40" />
          </Transition.Child>

          {/* Panel */}
          <div className="fixed inset-x-0 bottom-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="translate-y-full"
              enterTo="translate-y-0"
              leave="ease-in duration-150"
              leaveFrom="translate-y-0"
              leaveTo="translate-y-full"
            >
              <Dialog.Panel
                className="bg-white rounded-t-2xl"
                style={{ paddingBottom: 'calc(var(--safe-area-bottom) + 1rem)' }}
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-20">
                  <Dialog.Title className="text-heading-02 text-gray-100">
                    Mark as Paid
                  </Dialog.Title>
                  <button
                    onClick={() => setShowPayment(false)}
                    className="p-1 text-gray-50 active:bg-gray-10 rounded-full"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  {/* Amount display */}
                  <div className="bg-gray-10 rounded-lg p-4 text-center">
                    <p className="text-helper-01 text-gray-50 mb-1">Amount</p>
                    <p className="text-heading-01 text-gray-100 tabular-nums">
                      {formatCurrency(order.totalKobo / 100)}
                    </p>
                  </div>

                  {/* Payment method */}
                  <div>
                    <label className="block text-label-01 text-gray-70 mb-1.5">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full h-12 px-3 bg-gray-10 border border-gray-30 rounded-lg text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                    >
                      {PAYMENT_METHODS.map((method) => (
                        <option key={method.value} value={method.value}>
                          {method.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Payment reference */}
                  <div>
                    <label className="block text-label-01 text-gray-70 mb-1.5">
                      Payment Reference (optional)
                    </label>
                    <input
                      type="text"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      placeholder="e.g. transaction ID, receipt number"
                      className="w-full h-12 px-3 bg-gray-10 border border-gray-30 rounded-lg text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowPayment(false)}
                      className="flex-1 h-12 border border-gray-30 text-gray-70 font-medium rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleMarkAsPaid}
                      disabled={updatePayment.isPending}
                      className="flex-1 h-12 bg-green-600 text-white font-medium rounded-lg disabled:opacity-50 active:bg-green-700 transition-colors"
                    >
                      {updatePayment.isPending ? 'Confirming...' : 'Confirm Payment'}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
