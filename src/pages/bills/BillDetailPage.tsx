import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBill, useApproveBill, useMarkBillPaid, useCancelBill, useDeleteBill } from '@/queries';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import { BillStatus, BillCategoryLabels } from '@/types/bill.types';
import { useUIStore } from '@/store/ui.store';

export function BillDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: bill, isLoading } = useBill(id!);
  const approveBill = useApproveBill();
  const markPaid = useMarkBillPaid();
  const cancelBill = useCancelBill();
  const deleteBill = useDeleteBill();
  const showNotification = useUIStore((s) => s.showNotification);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  if (isLoading || !bill) {
    return <DashboardSkeleton />;
  }

  const handleAction = async (action: string, fn: () => Promise<unknown>) => {
    setActionLoading(action);
    try {
      await fn();
      showNotification('Success', `Bill ${action} successfully`, 'success');
      if (action === 'deleted') navigate('/app/bills', { replace: true });
    } catch {
      showNotification('Error', `Failed to ${action} bill`, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <>
      <PageHeader title={bill.billNumber || 'Bill'} backTo="/app/bills" />
      <div className="page-content space-y-4">
        {/* Header */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <StatusBadge status={bill.status} />
            <span className="text-helper-01 text-gray-40">
              {formatDate(bill.billDate)}
            </span>
          </div>
          <p className="text-heading-04 tabular-nums text-gray-100 mb-1">
            {formatCurrency(bill.total)}
          </p>
          {bill.dueDate && (
            <p className="text-body-01 text-gray-50">
              Due {formatDate(bill.dueDate)}
            </p>
          )}
        </Card>

        {/* Supplier */}
        <Card>
          <p className="text-label-01 text-gray-50 mb-1">Supplier</p>
          <p className="text-body-01 font-medium text-gray-100">
            {bill.supplier?.name || 'Unknown Supplier'}
          </p>
          {bill.supplier?.email && (
            <p className="text-label-01 text-gray-50">{bill.supplier.email}</p>
          )}
        </Card>

        {/* Line Items */}
        <Card>
          <p className="text-label-01 text-gray-50 mb-3">Items</p>
          <div className="space-y-3">
            {bill.items.map((item, idx) => (
              <div key={idx} className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-body-01 text-gray-100">
                    {item.description}
                  </p>
                  <p className="text-helper-01 text-gray-40">
                    {item.quantity} x {formatCurrency(item.unitPrice)}
                    {item.category && ` · ${BillCategoryLabels[item.category] || item.category}`}
                  </p>
                </div>
                <span className="text-body-01 tabular-nums text-gray-100 ml-3">
                  {formatCurrency(item.amount)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-20 mt-3 pt-3 flex justify-between text-heading-02">
            <span>Total</span>
            <span className="tabular-nums">{formatCurrency(bill.total)}</span>
          </div>
        </Card>

        {/* Notes */}
        {bill.notes && (
          <Card>
            <p className="text-label-01 text-gray-50 mb-1">Notes</p>
            <p className="text-body-01 text-gray-70">{bill.notes}</p>
          </Card>
        )}

        {/* Actions */}
        <div className="space-y-2 pt-2">
          {bill.status === BillStatus.DRAFT && (
            <>
              <button
                onClick={() => handleAction('approved', () => approveBill.mutateAsync(bill.id))}
                disabled={actionLoading === 'approved'}
                className="w-full h-12 bg-primary text-white font-medium text-body-01 rounded-lg disabled:opacity-50"
              >
                {actionLoading === 'approved' ? 'Approving...' : 'Approve Bill'}
              </button>
              <button
                onClick={() => handleAction('deleted', () => deleteBill.mutateAsync(bill.id))}
                disabled={actionLoading === 'deleted'}
                className="w-full h-12 border border-danger text-danger font-medium text-body-01 rounded-lg disabled:opacity-50"
              >
                {actionLoading === 'deleted' ? 'Deleting...' : 'Delete Bill'}
              </button>
            </>
          )}

          {bill.status === BillStatus.APPROVED && (
            <>
              <button
                onClick={() => handleAction('marked as paid', () => markPaid.mutateAsync({ id: bill.id, data: { paidAt: new Date().toISOString() } }))}
                disabled={actionLoading === 'marked as paid'}
                className="w-full h-12 bg-success text-white font-medium text-body-01 rounded-lg disabled:opacity-50"
              >
                {actionLoading === 'marked as paid' ? 'Processing...' : 'Mark as Paid'}
              </button>
              <button
                onClick={() => handleAction('cancelled', () => cancelBill.mutateAsync({ id: bill.id }))}
                disabled={actionLoading === 'cancelled'}
                className="w-full h-12 border border-danger text-danger font-medium text-body-01 rounded-lg disabled:opacity-50"
              >
                {actionLoading === 'cancelled' ? 'Cancelling...' : 'Cancel Bill'}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
