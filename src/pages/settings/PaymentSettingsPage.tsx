import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoicePaymentApi } from '@/services/api/invoice-payment.api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { PageHeader } from '@/components/ui/PageHeader';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useUIStore } from '@/store/ui.store';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  BuildingLibraryIcon,
} from '@heroicons/react/24/outline';
import type { Bank, BusinessPaymentSetupRequest } from '@/types/payment.types';

export function PaymentSettingsPage() {
  const queryClient = useQueryClient();
  const showNotification = useUIStore((s) => s.showNotification);

  const { data: setup, isLoading: setupLoading } = useQuery({
    queryKey: ['payment-setup'],
    queryFn: () => invoicePaymentApi.getPaymentSetup(),
  });

  const { data: banks } = useQuery({
    queryKey: ['banks'],
    queryFn: () => invoicePaymentApi.getBanks(),
  });

  const setupMutation = useMutation({
    mutationFn: (data: BusinessPaymentSetupRequest) =>
      invoicePaymentApi.setupPaymentAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-setup'] });
      showNotification('Success', 'Payment account updated', 'success');
      setEditing(false);
    },
    onError: () => {
      showNotification('Error', 'Failed to update payment account', 'error');
    },
  });

  const resolveMutation = useMutation({
    mutationFn: ({ accountNumber, bankCode }: { accountNumber: string; bankCode: string }) =>
      invoicePaymentApi.resolveBankAccount(accountNumber, bankCode),
  });

  const [editing, setEditing] = useState(false);
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [resolvedName, setResolvedName] = useState('');

  useEffect(() => {
    if (setup && !editing) {
      setBankCode(setup.bankCode || '');
      setAccountNumber(setup.accountNumber || '');
      setBusinessName(setup.businessName || '');
    }
  }, [setup, editing]);

  // Resolve account when bank + account number are filled
  useEffect(() => {
    if (bankCode && accountNumber.length === 10) {
      resolveMutation.mutate(
        { accountNumber, bankCode },
        {
          onSuccess: (data) => setResolvedName(data.accountName),
          onError: () => setResolvedName(''),
        }
      );
    } else {
      setResolvedName('');
    }
  }, [bankCode, accountNumber]);

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['payment-setup'] });
  }, [queryClient]);

  const { containerRef, PullIndicator } = usePullToRefresh({ onRefresh: handleRefresh });

  const handleSave = () => {
    if (!bankCode || accountNumber.length !== 10 || !businessName.trim()) return;
    setupMutation.mutate({
      bankCode,
      accountNumber,
      businessName: businessName.trim(),
    });
  };

  if (setupLoading) {
    return (
      <>
        <PageHeader title="Payment Settings" backTo="/app/settings" />
        <DashboardSkeleton />
      </>
    );
  }

  const isSetup = setup?.isSetup;
  const bankName = banks?.find((b: Bank) => b.code === setup?.bankCode)?.name;

  return (
    <>
      <PageHeader title="Payment Settings" backTo="/app/settings" />
      <div className="page-content space-y-4" ref={containerRef}>
        <PullIndicator />

        {/* Current status */}
        <Card>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSetup ? 'bg-success-light' : 'bg-gray-10'}`}>
              {isSetup ? (
                <CheckCircleIcon className="w-5 h-5 text-success" />
              ) : (
                <ExclamationCircleIcon className="w-5 h-5 text-gray-40" />
              )}
            </div>
            <div>
              <p className="text-body-01 font-medium text-gray-100">
                Accurify Pay
              </p>
              <Badge variant={isSetup ? 'success' : 'gray'}>
                {isSetup ? 'Active' : 'Not Setup'}
              </Badge>
            </div>
          </div>
          <p className="text-helper-01 text-gray-50">
            Accept payments directly on your invoices via Paystack. Customers can pay online and funds go to your bank account.
          </p>
        </Card>

        {/* Current account details (if set up and not editing) */}
        {isSetup && !editing && (
          <Card>
            <div className="flex items-center gap-3 mb-3">
              <BuildingLibraryIcon className="w-5 h-5 text-primary" />
              <p className="text-label-01 text-gray-70 font-medium">Bank Account</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-body-01 text-gray-50">Bank</span>
                <span className="text-body-01 text-gray-100">{bankName || setup?.bankCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-body-01 text-gray-50">Account</span>
                <span className="text-body-01 text-gray-100 tabular-nums">{setup?.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-body-01 text-gray-50">Name</span>
                <span className="text-body-01 text-gray-100">{setup?.accountName}</span>
              </div>
            </div>
            <button
              onClick={() => setEditing(true)}
              className="w-full mt-4 h-10 border border-gray-30 text-gray-70 font-medium text-body-01 rounded-lg"
            >
              Update Account
            </button>
          </Card>
        )}

        {/* Setup / Edit form */}
        {(!isSetup || editing) && (
          <Card>
            <p className="text-heading-02 text-gray-100 mb-4">
              {isSetup ? 'Update Bank Account' : 'Setup Payment Account'}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-label-01 text-gray-70 mb-1.5">Bank</label>
                <select
                  value={bankCode}
                  onChange={(e) => setBankCode(e.target.value)}
                  className="w-full h-12 px-4 bg-gray-10 border border-gray-30 text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
                >
                  <option value="">Select bank</option>
                  {banks?.map((bank: Bank) => (
                    <option key={bank.code} value={bank.code}>{bank.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-label-01 text-gray-70 mb-1.5">Account Number</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10-digit account number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                  className="w-full h-12 px-4 bg-gray-10 border border-gray-30 text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
                />
                {resolveMutation.isPending && (
                  <p className="mt-1 text-helper-01 text-gray-40">Verifying account...</p>
                )}
                {resolvedName && (
                  <p className="mt-1 text-helper-01 text-success">{resolvedName}</p>
                )}
                {resolveMutation.isError && accountNumber.length === 10 && (
                  <p className="mt-1 text-helper-01 text-danger">Could not verify account</p>
                )}
              </div>

              <div>
                <label className="block text-label-01 text-gray-70 mb-1.5">Business Name</label>
                <input
                  type="text"
                  placeholder="Your business name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full h-12 px-4 bg-gray-10 border border-gray-30 text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
                />
              </div>

              <div className="flex gap-3">
                {editing && (
                  <button
                    onClick={() => setEditing(false)}
                    className="flex-1 h-12 border border-gray-30 text-gray-70 font-medium rounded-lg"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={!bankCode || accountNumber.length !== 10 || !businessName.trim() || setupMutation.isPending}
                  className="flex-1 h-12 bg-primary text-white font-medium rounded-lg disabled:opacity-50"
                >
                  {setupMutation.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* Platform fee info */}
        <Card>
          <p className="text-helper-01 text-gray-50 leading-relaxed">
            Accurify Pay uses Paystack to process payments. A small platform fee ({setup?.platformFeePercent ?? 1.5}%) is applied per transaction. Funds are settled to your bank account according to Paystack's payout schedule.
          </p>
        </Card>
      </div>
    </>
  );
}
