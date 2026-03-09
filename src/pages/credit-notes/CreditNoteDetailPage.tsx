import { useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCreditNote, useIssueCreditNote, useVoidCreditNote } from '@/queries';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useQueryClient } from '@tanstack/react-query';
import { useUIStore } from '@/store/ui.store';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export function CreditNoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const showNotification = useUIStore((s) => s.showNotification);
  const { data: cn, isLoading } = useCreditNote(id!);
  const issueMutation = useIssueCreditNote();
  const voidMutation = useVoidCreditNote();

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['credit-notes'] });
  }, [queryClient]);

  const { containerRef, PullIndicator } = usePullToRefresh({ onRefresh: handleRefresh });

  const handleIssue = async () => {
    if (!id) return;
    try {
      await issueMutation.mutateAsync(id);
      showNotification('Credit note issued', '', 'success');
    } catch {
      showNotification('Failed to issue credit note', '', 'error');
    }
  };

  const handleVoid = async () => {
    if (!id || !confirm('Are you sure you want to void this credit note?')) return;
    try {
      await voidMutation.mutateAsync({ id });
      showNotification('Credit note voided', '', 'success');
    } catch {
      showNotification('Failed to void credit note', '', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="page-content">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!cn) {
    return (
      <div className="page-content">
        <p className="text-body-01 text-gray-50">Credit note not found.</p>
      </div>
    );
  }

  return (
    <div className="page-content" ref={containerRef}>
      <PullIndicator />

      {/* Back button */}
      <button
        onClick={() => navigate('/app/credit-notes')}
        className="flex items-center gap-2 text-body-01 text-primary mb-4"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Credit Notes
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl p-4 border border-gray-20 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-heading-02 text-gray-100">{cn.creditNoteNumber}</h2>
          <StatusBadge status={cn.status} />
        </div>
        <div className="space-y-2 text-label-01 text-gray-50">
          <div className="flex justify-between">
            <span>Client</span>
            <span className="text-gray-100">{cn.clientName}</span>
          </div>
          <div className="flex justify-between">
            <span>Invoice</span>
            <span className="text-gray-100">{cn.invoiceNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>Issue Date</span>
            <span className="text-gray-100">{formatDate(cn.issueDate)}</span>
          </div>
          {cn.reason && (
            <div className="flex justify-between">
              <span>Reason</span>
              <span className="text-gray-100">{cn.reason}</span>
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl p-4 border border-gray-20 mb-4">
        <h3 className="text-label-01 font-medium text-gray-100 mb-3">Items</h3>
        <div className="space-y-3">
          {cn.items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <div>
                <p className="text-body-01 text-gray-100">{item.description}</p>
                <p className="text-helper-01 text-gray-40">
                  {item.quantity} x {formatCurrency(item.unitPrice)}
                </p>
              </div>
              <span className="text-body-01 tabular-nums text-gray-100">
                {formatCurrency(item.amount)}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-10 mt-3 pt-3 space-y-1">
          <div className="flex justify-between text-label-01">
            <span className="text-gray-50">Subtotal</span>
            <span className="text-gray-100 tabular-nums">{formatCurrency(cn.subtotal)}</span>
          </div>
          {cn.vatAmount > 0 && (
            <div className="flex justify-between text-label-01">
              <span className="text-gray-50">VAT ({cn.vatRate}%)</span>
              <span className="text-gray-100 tabular-nums">{formatCurrency(cn.vatAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-body-01 font-medium">
            <span className="text-gray-100">Total</span>
            <span className="text-gray-100 tabular-nums">{formatCurrency(cn.total)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      {cn.status === 'DRAFT' && (
        <button
          onClick={handleIssue}
          disabled={issueMutation.isPending}
          className="w-full py-3 bg-primary text-white text-body-01 font-medium rounded-lg disabled:opacity-50 mb-3"
        >
          {issueMutation.isPending ? 'Issuing...' : 'Issue Credit Note'}
        </button>
      )}
      {(cn.status === 'DRAFT' || cn.status === 'ISSUED') && (
        <button
          onClick={handleVoid}
          disabled={voidMutation.isPending}
          className="w-full py-3 bg-white text-danger text-body-01 font-medium rounded-lg border border-danger disabled:opacity-50"
        >
          {voidMutation.isPending ? 'Voiding...' : 'Void Credit Note'}
        </button>
      )}
    </div>
  );
}
