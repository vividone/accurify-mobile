import { useCallback } from 'react';
import { useTaxDashboard } from '@/queries';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatCurrency } from '@/utils/currency';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ScaleIcon,
  ReceiptPercentIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';

export function TaxOverviewPage() {
  const queryClient = useQueryClient();
  const { data: summary, isLoading } = useTaxDashboard();

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['tax'] });
  }, [queryClient]);

  const { containerRef, PullIndicator } = usePullToRefresh({ onRefresh: handleRefresh });

  if (isLoading || !summary) {
    return (
      <>
        <PageHeader title="Tax Overview" backTo="/app/dashboard" />
        <DashboardSkeleton />
      </>
    );
  }

  const isVatRefundable = summary.netVatPayable < 0;

  return (
    <>
      <PageHeader title="Tax Overview" backTo="/app/dashboard" />
      <div className="page-content space-y-4" ref={containerRef}>
        <PullIndicator />

        {/* VAT Section */}
        <div>
          <h2 className="text-heading-01 text-gray-100 mb-3">VAT</h2>
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-primary-50 rounded-lg flex items-center justify-center">
                  <ArrowUpIcon className="w-4 h-4 text-primary" />
                </div>
              </div>
              <p className="text-helper-01 text-gray-50">Output VAT</p>
              <p className="text-heading-03 tabular-nums text-gray-100">
                {formatCurrency(summary.outputVat)}
              </p>
              <p className="text-helper-01 text-gray-40 mt-0.5">Collected from clients</p>
            </Card>
            <Card>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-warning-light rounded-lg flex items-center justify-center">
                  <ArrowDownIcon className="w-4 h-4 text-warning-dark" />
                </div>
              </div>
              <p className="text-helper-01 text-gray-50">Input VAT</p>
              <p className="text-heading-03 tabular-nums text-gray-100">
                {formatCurrency(summary.inputVat)}
              </p>
              <p className="text-helper-01 text-gray-40 mt-0.5">Paid to suppliers</p>
            </Card>
          </div>
          <Card className="mt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isVatRefundable ? 'bg-success-light' : 'bg-danger-light'}`}>
                  <ScaleIcon className={`w-4 h-4 ${isVatRefundable ? 'text-success' : 'text-danger'}`} />
                </div>
                <div>
                  <p className="text-label-01 text-gray-70">Net VAT</p>
                  <Badge variant={isVatRefundable ? 'success' : 'warning'}>
                    {isVatRefundable ? 'Refundable' : 'Payable'}
                  </Badge>
                </div>
              </div>
              <p className={`text-heading-03 tabular-nums ${isVatRefundable ? 'text-success' : 'text-danger'}`}>
                {formatCurrency(Math.abs(summary.netVatPayable))}
              </p>
            </div>
          </Card>
        </div>

        {/* WHT Section */}
        <div>
          <h2 className="text-heading-01 text-gray-100 mb-3">Withholding Tax</h2>
          <Card>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-warning-light rounded-lg flex items-center justify-center">
                  <ReceiptPercentIcon className="w-4 h-4 text-warning-dark" />
                </div>
                <div>
                  <p className="text-label-01 text-gray-70">WHT Payable</p>
                  <p className="text-helper-01 text-gray-40">Tax withheld at source</p>
                </div>
              </div>
              <p className="text-heading-03 tabular-nums text-gray-100">
                {formatCurrency(summary.whtPayable)}
              </p>
            </div>
          </Card>
        </div>

        {/* Account Summary */}
        <div>
          <h2 className="text-heading-01 text-gray-100 mb-3">Account Summary</h2>
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <div className="flex items-center gap-2 mb-2">
                <DocumentTextIcon className="w-4 h-4 text-primary" />
                <span className="text-helper-01 text-gray-50">Receivable</span>
              </div>
              <p className="text-heading-03 tabular-nums text-gray-100">
                {formatCurrency(summary.accountsReceivable)}
              </p>
              <p className="text-helper-01 text-gray-40 mt-0.5">
                {summary.unpaidInvoicesCount} unpaid invoice{summary.unpaidInvoicesCount !== 1 ? 's' : ''}
              </p>
            </Card>
            <Card>
              <div className="flex items-center gap-2 mb-2">
                <ClipboardDocumentListIcon className="w-4 h-4 text-warning-dark" />
                <span className="text-helper-01 text-gray-50">Payable</span>
              </div>
              <p className="text-heading-03 tabular-nums text-gray-100">
                {formatCurrency(summary.accountsPayable)}
              </p>
              <p className="text-helper-01 text-gray-40 mt-0.5">
                {summary.unpaidBillsCount} unpaid bill{summary.unpaidBillsCount !== 1 ? 's' : ''}
              </p>
            </Card>
          </div>
        </div>

        {/* Info */}
        <Card>
          <p className="text-helper-01 text-gray-50 leading-relaxed">
            This is a summary of your current tax position based on posted journal entries.
            Output VAT is collected from invoices you send. Input VAT is from bills you receive.
            WHT is withholding tax deducted at source. Consult a tax professional for filing guidance.
          </p>
        </Card>
      </div>
    </>
  );
}
