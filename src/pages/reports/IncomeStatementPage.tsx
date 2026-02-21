import { useState, useCallback } from 'react';
import { useIncomeStatement } from '@/queries/gl.queries';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatCurrency } from '@/utils/currency';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useQueryClient } from '@tanstack/react-query';
import { format, startOfYear, endOfYear } from 'date-fns';
import { ExclamationTriangleIcon, DocumentChartBarIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import type { IncomeStatementSection, AccountingBasis } from '@/queries/gl.queries';

function formatDateRange(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

function Section({ section, label }: { section: IncomeStatementSection; label: string }) {
  if (section.lines.length === 0) return null;
  return (
    <Card padding={false}>
      <div className="px-4 py-3 border-b border-gray-10">
        <p className="text-label-01 text-gray-50 font-medium">{label}</p>
      </div>
      <div className="divide-y divide-gray-10">
        {section.lines.map((line) => (
          <div key={line.code} className="flex items-center justify-between px-4 py-2.5">
            <div className="flex-1 min-w-0">
              <p className="text-body-01 text-gray-100 truncate">{line.name}</p>
              <p className="text-helper-01 text-gray-40">{line.code}</p>
            </div>
            <p className="text-body-01 font-medium tabular-nums text-gray-100 flex-shrink-0">
              {formatCurrency(line.amount)}
            </p>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-20 bg-gray-10">
        <p className="text-label-01 font-medium text-gray-70">Total {label}</p>
        <p className="text-body-01 font-semibold tabular-nums text-gray-100">
          {formatCurrency(section.total)}
        </p>
      </div>
    </Card>
  );
}

export function IncomeStatementPage() {
  const queryClient = useQueryClient();
  const now = new Date();
  const [startDate, setStartDate] = useState(formatDateRange(startOfYear(now)));
  const [endDate, setEndDate] = useState(formatDateRange(endOfYear(now)));
  const [basis, setBasis] = useState<AccountingBasis>('ACCRUAL');

  const { data: report, isLoading, isError, error } = useIncomeStatement(startDate, endDate, basis);

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['gl'] });
  }, [queryClient]);

  const { containerRef, PullIndicator } = usePullToRefresh({ onRefresh: handleRefresh });

  const hasData = report && (
    report.revenue.lines.length > 0 ||
    report.costOfSales.lines.length > 0 ||
    report.operatingExpenses.lines.length > 0 ||
    report.otherIncomeExpenses.lines.length > 0
  );

  return (
    <>
      <PageHeader title="Income Statement" backTo="/app/dashboard" />
      <div className="page-content space-y-4" ref={containerRef}>
        <PullIndicator />

        {/* Date range */}
        <Card>
          <p className="text-label-01 text-gray-70 mb-2">Period</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-helper-01 text-gray-50 mb-1">From</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-10 px-3 bg-gray-10 border border-gray-30 rounded-lg text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-helper-01 text-gray-50 mb-1">To</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full h-10 px-3 bg-gray-10 border border-gray-30 rounded-lg text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </Card>

        {/* Accounting Basis Toggle */}
        <Card>
          <p className="text-label-01 text-gray-70 mb-2">Accounting Basis</p>
          <div className="flex rounded-lg bg-gray-10 p-1">
            <button
              onClick={() => setBasis('ACCRUAL')}
              className={`flex-1 py-2 text-body-01 font-medium rounded-md transition-colors ${
                basis === 'ACCRUAL'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-50'
              }`}
            >
              Accrual
            </button>
            <button
              onClick={() => setBasis('CASH')}
              className={`flex-1 py-2 text-body-01 font-medium rounded-md transition-colors ${
                basis === 'CASH'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-50'
              }`}
            >
              Cash
            </button>
          </div>
        </Card>

        {basis === 'CASH' && (
          <div className="bg-blue-50 rounded-lg px-3 py-2.5 flex items-start gap-2">
            <InformationCircleIcon className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-helper-01 text-blue-700">
              Cash basis — for management purposes only. Does not comply with IFRS.
            </p>
          </div>
        )}

        {isLoading && <DashboardSkeleton />}

        {isError && (
          <Card>
            <div className="flex flex-col items-center py-6 text-center">
              <ExclamationTriangleIcon className="w-10 h-10 text-gray-40 mb-3" />
              <p className="text-body-01 text-gray-70 mb-1">
                Failed to load income statement
              </p>
              <p className="text-helper-01 text-gray-50 mb-4">
                {(error as Error)?.message || 'Please try again later.'}
              </p>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-primary text-white text-body-01 font-medium rounded-lg"
              >
                Retry
              </button>
            </div>
          </Card>
        )}

        {!isLoading && !isError && report && !hasData && (
          <Card>
            <div className="flex flex-col items-center py-8 text-center">
              <DocumentChartBarIcon className="w-10 h-10 text-gray-30 mb-3" />
              <p className="text-body-01 font-medium text-gray-70 mb-1">
                No data for this period
              </p>
              <p className="text-helper-01 text-gray-50">
                Create invoices and record expenses to see your income statement.
              </p>
            </div>
          </Card>
        )}

        {!isLoading && !isError && report && hasData && (
          <>
            {/* Revenue */}
            <Section section={report.revenue} label="Revenue" />

            {/* Cost of Sales */}
            <Section section={report.costOfSales} label="Cost of Sales" />

            {/* Gross Profit */}
            <Card>
              <div className="flex items-center justify-between">
                <p className="text-heading-02 text-gray-100">Gross Profit</p>
                <p className={`text-heading-02 tabular-nums ${report.grossProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                  {formatCurrency(report.grossProfit)}
                </p>
              </div>
            </Card>

            {/* Operating Expenses */}
            <Section section={report.operatingExpenses} label="Operating Expenses" />

            {/* Operating Income */}
            <Card>
              <div className="flex items-center justify-between">
                <p className="text-heading-02 text-gray-100">Operating Income</p>
                <p className={`text-heading-02 tabular-nums ${report.operatingIncome >= 0 ? 'text-success' : 'text-danger'}`}>
                  {formatCurrency(report.operatingIncome)}
                </p>
              </div>
            </Card>

            {/* Other Income/Expenses */}
            <Section section={report.otherIncomeExpenses} label="Other Income/Expenses" />

            {/* Net Income */}
            <Card className="border-2 border-primary">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-heading-02 text-gray-100">Net Income</p>
                  <Badge variant={report.netIncome >= 0 ? 'success' : 'danger'}>
                    {report.netIncome >= 0 ? 'Profit' : 'Loss'}
                  </Badge>
                </div>
                <p className={`text-heading-03 tabular-nums ${report.netIncome >= 0 ? 'text-success' : 'text-danger'}`}>
                  {formatCurrency(report.netIncome)}
                </p>
              </div>
            </Card>
          </>
        )}
      </div>
    </>
  );
}
