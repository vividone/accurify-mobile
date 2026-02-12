import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useInvoice, useSendInvoice, useDeleteInvoice, useCancelInvoice, useResendInvoice, useMarkInvoicePaid, useSendReceipt, useConvertToInvoice } from '@/queries';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import { InvoiceStatus, InvoiceType } from '@/types';
import { useUIStore } from '@/store/ui.store';
import { useBusinessStore } from '@/store/business.store';
import { getWhatsAppInvoiceLink, getWhatsAppReceiptLink } from '@/utils/whatsapp';

export function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: invoice, isLoading } = useInvoice(id!);
  const sendInvoice = useSendInvoice();
  const deleteInvoice = useDeleteInvoice();
  const cancelInvoice = useCancelInvoice();
  const resendInvoice = useResendInvoice();
  const markPaid = useMarkInvoicePaid();
  const sendReceipt = useSendReceipt();
  const convertToInvoice = useConvertToInvoice();
  const showNotification = useUIStore((s) => s.showNotification);
  const business = useBusinessStore((s) => s.business);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  if (isLoading || !invoice) {
    return <DashboardSkeleton />;
  }

  const handleAction = async (action: string, fn: () => Promise<unknown>) => {
    setActionLoading(action);
    try {
      await fn();
      showNotification('Success', `Invoice ${action} successfully`, 'success');
      if (action === 'deleted') navigate('/app/invoices', { replace: true });
    } catch {
      showNotification('Error', `Failed to ${action} invoice`, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <>
      <PageHeader
        title={`${invoice.type === InvoiceType.PROFORMA ? 'Proforma ' : ''}${invoice.invoiceNumber}`}
        backTo="/app/invoices"
      />
      <div className="page-content space-y-4">
        {/* Header card */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <StatusBadge status={invoice.status} />
            <span className="text-helper-01 text-gray-40">
              {formatDate(invoice.invoiceDate)}
            </span>
          </div>
          <p className="text-heading-04 tabular-nums text-gray-100 mb-1">
            {formatCurrency(invoice.total)}
          </p>
          <p className="text-body-01 text-gray-50">
            Due {formatDate(invoice.dueDate)}
          </p>
        </Card>

        {/* Client */}
        <Card>
          <p className="text-label-01 text-gray-50 mb-1">Client</p>
          <p className="text-body-01 font-medium text-gray-100">
            {invoice.client.name}
          </p>
          <p className="text-label-01 text-gray-50">{invoice.client.email}</p>
        </Card>

        {/* Line items */}
        <Card>
          <p className="text-label-01 text-gray-50 mb-3">Items</p>
          <div className="space-y-3">
            {invoice.items.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-body-01 text-gray-100">
                    {item.description}
                  </p>
                  <p className="text-helper-01 text-gray-40">
                    {item.quantity} x {formatCurrency(item.unitPrice)}
                  </p>
                </div>
                <span className="text-body-01 tabular-nums text-gray-100 ml-3">
                  {formatCurrency(item.amount)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-20 mt-3 pt-3">
            <div className="flex justify-between text-body-01">
              <span className="text-gray-50">Subtotal</span>
              <span className="tabular-nums">{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.vatAmount > 0 && (
              <div className="flex justify-between text-body-01 mt-1">
                <span className="text-gray-50">VAT ({invoice.vatRate}%)</span>
                <span className="tabular-nums">{formatCurrency(invoice.vatAmount)}</span>
              </div>
            )}
            {invoice.whtAmount && invoice.whtAmount > 0 && (
              <div className="flex justify-between text-body-01 mt-1">
                <span className="text-gray-50">WHT ({invoice.whtRate}%)</span>
                <span className="tabular-nums text-danger">-{formatCurrency(invoice.whtAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-heading-02 mt-2 pt-2 border-t border-gray-20">
              <span>Total</span>
              <span className="tabular-nums">{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </Card>

        {/* Notes */}
        {invoice.notes && (
          <Card>
            <p className="text-label-01 text-gray-50 mb-1">Notes</p>
            <p className="text-body-01 text-gray-70">{invoice.notes}</p>
          </Card>
        )}

        {/* Actions */}
        <div className="space-y-2 pt-2">
          {invoice.status === InvoiceStatus.DRAFT && (
            <>
              <button
                onClick={() => navigate(`/app/invoices/${invoice.id}`)}
                className="hidden"
              />
              <button
                onClick={() => handleAction('sent', () => sendInvoice.mutateAsync(invoice.id))}
                disabled={actionLoading === 'sent'}
                className="w-full h-12 bg-primary text-white font-medium text-body-01 rounded-lg disabled:opacity-50"
              >
                {actionLoading === 'sent' ? 'Sending...' : 'Send Invoice'}
              </button>
              <button
                onClick={() => handleAction('deleted', () => deleteInvoice.mutateAsync(invoice.id))}
                disabled={actionLoading === 'deleted'}
                className="w-full h-12 border border-danger text-danger font-medium text-body-01 rounded-lg disabled:opacity-50"
              >
                {actionLoading === 'deleted' ? 'Deleting...' : 'Delete Invoice'}
              </button>
            </>
          )}

          {(invoice.status === InvoiceStatus.SENT || invoice.status === InvoiceStatus.OVERDUE) && (
            <>
              <button
                onClick={() => handleAction('resent', () => resendInvoice.mutateAsync(invoice.id))}
                disabled={actionLoading === 'resent'}
                className="w-full h-12 bg-primary text-white font-medium text-body-01 rounded-lg disabled:opacity-50"
              >
                {actionLoading === 'resent' ? 'Resending...' : 'Resend Invoice'}
              </button>
              <a
                href={getWhatsAppInvoiceLink(invoice, business?.name || '')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full h-12 bg-[#25D366] text-white font-medium text-body-01 rounded-lg"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Share via WhatsApp
              </a>
              {invoice.type !== InvoiceType.PROFORMA && (
                <button
                  onClick={() => handleAction('marked as paid', () => markPaid.mutateAsync({ id: invoice.id, data: { paidAt: new Date().toISOString() } }))}
                  disabled={actionLoading === 'marked as paid'}
                  className="w-full h-12 bg-success text-white font-medium text-body-01 rounded-lg disabled:opacity-50"
                >
                  {actionLoading === 'marked as paid' ? 'Processing...' : 'Mark as Paid'}
                </button>
              )}
              {invoice.type === InvoiceType.PROFORMA && (
                <button
                  onClick={() => handleAction('converted', async () => {
                    const newInvoice = await convertToInvoice.mutateAsync(invoice.id);
                    navigate(`/app/invoices/${newInvoice.id}`);
                  })}
                  disabled={actionLoading === 'converted'}
                  className="w-full h-12 bg-success text-white font-medium text-body-01 rounded-lg disabled:opacity-50"
                >
                  {actionLoading === 'converted' ? 'Converting...' : 'Convert to Invoice'}
                </button>
              )}
              <button
                onClick={() => handleAction('cancelled', () => cancelInvoice.mutateAsync(invoice.id))}
                disabled={actionLoading === 'cancelled'}
                className="w-full h-12 border border-danger text-danger font-medium text-body-01 rounded-lg disabled:opacity-50"
              >
                {actionLoading === 'cancelled' ? 'Cancelling...' : 'Cancel Invoice'}
              </button>
            </>
          )}

          {invoice.status === InvoiceStatus.PAID && invoice.type !== InvoiceType.PROFORMA && (
            <>
              <button
                onClick={() => handleAction('receipt sent', () => sendReceipt.mutateAsync(invoice.id))}
                disabled={actionLoading === 'receipt sent'}
                className="w-full h-12 bg-primary text-white font-medium text-body-01 rounded-lg disabled:opacity-50"
              >
                {actionLoading === 'receipt sent' ? 'Sending...' : 'Send Receipt'}
              </button>
              <a
                href={getWhatsAppReceiptLink(invoice, business?.name || '')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full h-12 bg-[#25D366] text-white font-medium text-body-01 rounded-lg"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Send Receipt via WhatsApp
              </a>
            </>
          )}

          {/* Convert to Invoice button for draft proforma */}
          {invoice.type === InvoiceType.PROFORMA &&
            invoice.status === InvoiceStatus.DRAFT && (
            <button
              onClick={() => handleAction('converted', async () => {
                const newInvoice = await convertToInvoice.mutateAsync(invoice.id);
                navigate(`/app/invoices/${newInvoice.id}`);
              })}
              disabled={actionLoading === 'converted'}
              className="w-full h-12 border border-primary text-primary font-medium text-body-01 rounded-lg disabled:opacity-50"
            >
              {actionLoading === 'converted' ? 'Converting...' : 'Convert to Invoice'}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
