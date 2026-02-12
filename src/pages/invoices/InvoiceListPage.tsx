import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInvoices } from '@/queries';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import { InvoiceStatus } from '@/types';
import { DocumentTextIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

const statusFilters: { label: string; value: InvoiceStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Draft', value: InvoiceStatus.DRAFT },
  { label: 'Sent', value: InvoiceStatus.SENT },
  { label: 'Overdue', value: InvoiceStatus.OVERDUE },
  { label: 'Paid', value: InvoiceStatus.PAID },
  { label: 'Cancelled', value: InvoiceStatus.CANCELLED },
];

export function InvoiceListPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<InvoiceStatus | 'ALL'>('ALL');
  const [page] = useState(0);
  const status = activeFilter === 'ALL' ? undefined : activeFilter;

  const { data: invoicesData, isLoading } = useInvoices(page, 50, status ? { status } : undefined);
  const invoices = invoicesData?.content ?? [];

  return (
    <div className="page-content">
      {/* Search bar */}
      <div className="relative mb-4">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-40" />
        <input
          type="text"
          placeholder="Search invoices..."
          className="w-full h-10 pl-10 pr-4 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Status filter chips */}
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

      {/* Invoice list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : invoices.length === 0 ? (
        <EmptyState
          icon={DocumentTextIcon}
          title="No invoices found"
          description={
            activeFilter !== 'ALL'
              ? `No ${activeFilter.toLowerCase()} invoices.`
              : 'Create your first invoice to get started.'
          }
          action={
            <button
              onClick={() => navigate('/app/invoices/new')}
              className="px-4 py-2 bg-primary text-white text-body-01 font-medium rounded-lg"
            >
              Create Invoice
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <Card
              key={invoice.id}
              onClick={() => navigate(`/app/invoices/${invoice.id}`)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-body-01 font-medium text-gray-100">
                  {invoice.invoiceNumber}
                </span>
                <StatusBadge status={invoice.status} />
              </div>
              <p className="text-label-01 text-gray-50 mb-2">
                {invoice.client.name}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-heading-02 tabular-nums text-gray-100">
                  {formatCurrency(invoice.total)}
                </span>
                <span className="text-helper-01 text-gray-40">
                  Due {formatDate(invoice.dueDate)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
