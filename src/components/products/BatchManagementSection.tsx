import { useState } from 'react';
import { useBatches, useCreateBatch } from '@/queries';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/utils/date';
import { formatCurrency } from '@/utils/currency';
import {
  BeakerIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface BatchManagementSectionProps {
  productId: string;
  enableBatchTracking?: boolean;
}

export function BatchManagementSection({ productId, enableBatchTracking }: BatchManagementSectionProps) {
  const { data: batchData } = useBatches(productId, 0, 20);
  const createBatch = useCreateBatch(productId);
  const [showAddBatch, setShowAddBatch] = useState(false);

  // Form state
  const [batchNumber, setBatchNumber] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [expiryDate, setExpiryDate] = useState('');
  const [costPrice, setCostPrice] = useState(0);
  const [supplierName, setSupplierName] = useState('');
  const [notes, setNotes] = useState('');

  if (!enableBatchTracking) return null;

  const batches = batchData?.content ?? [];

  const handleCreateBatch = async () => {
    try {
      await createBatch.mutateAsync({
        batchNumber,
        quantity,
        expiryDate: expiryDate || undefined,
        costPrice: costPrice > 0 ? costPrice : undefined,
        supplierName: supplierName || undefined,
        notes: notes || undefined,
      });
      setShowAddBatch(false);
      setBatchNumber('');
      setQuantity(1);
      setExpiryDate('');
      setCostPrice(0);
      setSupplierName('');
      setNotes('');
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-heading-01 text-gray-100">Batch Tracking</p>
        <button
          onClick={() => setShowAddBatch(true)}
          className="flex items-center gap-1 text-label-01 text-primary"
        >
          <PlusIcon className="w-4 h-4" />
          Add Batch
        </button>
      </div>

      {batches.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center py-4 text-center">
            <BeakerIcon className="w-8 h-8 text-gray-30 mb-2" />
            <p className="text-body-01 text-gray-50">No batches yet</p>
            <p className="text-helper-01 text-gray-40">Add a batch to track expiry dates</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {batches.map((batch) => (
            <Card key={batch.id}>
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-body-01 font-medium text-gray-100">
                      {batch.batchNumber}
                    </p>
                    {batch.isExpired && (
                      <Badge variant="danger">Expired</Badge>
                    )}
                    {batch.isExpiringSoon && !batch.isExpired && (
                      <Badge variant="warning">Expiring Soon</Badge>
                    )}
                    {!batch.isActive && !batch.isExpired && (
                      <Badge variant="gray">Inactive</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-helper-01 text-gray-50">
                      Qty: {batch.quantity}
                    </span>
                    {batch.costPrice != null && batch.costPrice > 0 && (
                      <span className="text-helper-01 text-gray-50">
                        Cost: {formatCurrency(batch.costPrice)}
                      </span>
                    )}
                    {batch.supplierName && (
                      <span className="text-helper-01 text-gray-40 truncate">
                        {batch.supplierName}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  {batch.expiryDate && (
                    <div className="flex items-center gap-1">
                      {batch.isExpired ? (
                        <ExclamationTriangleIcon className="w-3.5 h-3.5 text-danger" />
                      ) : batch.isExpiringSoon ? (
                        <ClockIcon className="w-3.5 h-3.5 text-warning-dark" />
                      ) : (
                        <ClockIcon className="w-3.5 h-3.5 text-gray-40" />
                      )}
                      <span className={`text-helper-01 tabular-nums ${
                        batch.isExpired ? 'text-danger' : batch.isExpiringSoon ? 'text-warning-dark' : 'text-gray-50'
                      }`}>
                        {formatDate(batch.expiryDate)}
                      </span>
                    </div>
                  )}
                  {batch.daysUntilExpiry != null && batch.daysUntilExpiry > 0 && (
                    <p className="text-helper-01 text-gray-40 tabular-nums">
                      {batch.daysUntilExpiry}d left
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Batch Modal */}
      {showAddBatch && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setShowAddBatch(false)}>
          <div
            className="w-full max-h-[85vh] bg-white rounded-t-2xl overflow-y-auto p-5 space-y-4"
            style={{ paddingBottom: 'calc(var(--safe-area-bottom) + 1.5rem)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-heading-02 text-gray-100">Add Batch</h3>

            <div>
              <label className="block text-label-01 text-gray-70 mb-1.5">Batch Number</label>
              <input
                placeholder="e.g. B-2026-001"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                className="w-full h-12 px-4 bg-gray-10 border border-gray-30 text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-label-01 text-gray-70 mb-1.5">Quantity</label>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                  className="w-full h-12 px-4 bg-gray-10 border border-gray-30 text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-label-01 text-gray-70 mb-1.5">Cost Price</label>
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.01}
                  value={costPrice}
                  onChange={(e) => setCostPrice(Number(e.target.value) || 0)}
                  className="w-full h-12 px-4 bg-gray-10 border border-gray-30 text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-label-01 text-gray-70 mb-1.5">Expiry Date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full h-12 px-4 bg-gray-10 border border-gray-30 text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-label-01 text-gray-70 mb-1.5">Supplier (optional)</label>
              <input
                placeholder="Supplier name"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                className="w-full h-12 px-4 bg-gray-10 border border-gray-30 text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-label-01 text-gray-70 mb-1.5">Notes (optional)</label>
              <textarea
                rows={2}
                placeholder="Additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-gray-10 border border-gray-30 text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAddBatch(false)}
                className="flex-1 h-12 border border-gray-30 text-gray-70 font-medium rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBatch}
                disabled={!batchNumber || quantity < 1 || createBatch.isPending}
                className="flex-1 h-12 bg-primary text-white font-medium rounded-lg disabled:opacity-50"
              >
                {createBatch.isPending ? 'Adding...' : 'Add Batch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
