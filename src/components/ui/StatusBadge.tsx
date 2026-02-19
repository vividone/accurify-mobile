import { InvoiceStatus, BillStatus } from '@/types';
import { Badge } from './Badge';

type StatusType = InvoiceStatus | BillStatus | string;

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'gray' | 'purple' }> = {
  // Invoice statuses
  DRAFT: { label: 'Draft', variant: 'gray' },
  SENT: { label: 'Sent', variant: 'info' },
  OVERDUE: { label: 'Overdue', variant: 'danger' },
  PAID: { label: 'Paid', variant: 'success' },
  CANCELLED: { label: 'Cancelled', variant: 'gray' },
  CONVERTED: { label: 'Converted', variant: 'purple' },
  PARTIALLY_PAID: { label: 'Partial', variant: 'warning' },

  // Bill statuses
  RECEIVED: { label: 'Received', variant: 'info' },
  APPROVED: { label: 'Approved', variant: 'purple' },

  // Fixed asset statuses
  ACTIVE: { label: 'Active', variant: 'success' },
  FULLY_DEPRECIATED: { label: 'Fully Depreciated', variant: 'gray' },
  DISPOSED: { label: 'Disposed', variant: 'danger' },
};

interface StatusBadgeProps {
  status: StatusType;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, variant: 'gray' as const };

  return (
    <Badge variant={config.variant}>
      {status === 'CANCELLED' ? <s>{config.label}</s> : config.label}
    </Badge>
  );
}
