import { Fragment, useState, useCallback } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useQueryClient } from '@tanstack/react-query';
import {
  ClipboardDocumentListIcon,
  PlusIcon,
  XMarkIcon,
  PauseCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import {
  useRetainers,
  useCreateRetainer,
  usePauseRetainer,
  useCancelRetainer,
  useRecordRetainerHours,
  useRetainerPeriods,
  useCreateRetainerPeriod,
  useCloseRetainerPeriod,
  useProjects,
  retainerKeys,
} from '@/queries';
import type { RetainerRequest, RetainerResponse, RetainerPeriodResponse, RolloverPolicy } from '@/types';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';

function statusVariant(status: string): 'success' | 'gray' | 'danger' | 'info' {
  const map: Record<string, 'success' | 'gray' | 'danger' | 'info'> = {
    ACTIVE: 'success',
    PAUSED: 'gray',
    CANCELLED: 'danger',
    COMPLETED: 'info',
  };
  return map[status] || 'gray';
}

// ===== Retainer Periods Expandable Section =====
function RetainerPeriodsSection({ retainerId }: { retainerId: string }) {
  const { data: periods, isLoading } = useRetainerPeriods(retainerId);
  const createPeriod = useCreateRetainerPeriod();
  const closePeriod = useCloseRetainerPeriod();

  if (isLoading) return <p className="text-helper-01 text-gray-40 py-2">Loading periods...</p>;

  return (
    <div className="mt-3 pt-3 border-t border-gray-10 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-label-01 font-medium text-gray-60">Periods</p>
        <button
          onClick={() => createPeriod.mutate(retainerId)}
          disabled={createPeriod.isPending}
          className="text-label-01 font-medium text-primary active:opacity-70"
        >
          + New Period
        </button>
      </div>
      {(!periods || periods.length === 0) ? (
        <p className="text-helper-01 text-gray-40">No periods yet.</p>
      ) : (
        periods.map((period: RetainerPeriodResponse) => (
          <div key={period.id} className="bg-gray-10/50 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-helper-01 text-gray-50">
                {formatDate(period.periodStart)} - {formatDate(period.periodEnd)}
              </p>
              <Badge variant={period.status === 'CLOSED' ? 'gray' : 'success'}>
                {period.status}
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-helper-01 text-gray-40">Used</p>
                <p className="text-label-01 font-medium text-gray-100">
                  {period.usedHours.toFixed(1)}h
                </p>
              </div>
              <div>
                <p className="text-helper-01 text-gray-40">Allocated</p>
                <p className="text-label-01 font-medium text-gray-100">
                  {period.allocatedHours.toFixed(1)}h
                </p>
              </div>
              <div>
                <p className="text-helper-01 text-gray-40">Recognized</p>
                <p className="text-label-01 font-medium text-gray-100">
                  {formatCurrency(period.amountRecognized)}
                </p>
              </div>
            </div>
            {/* Utilization bar */}
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-helper-01 text-gray-40">Utilization</span>
                <span className="text-helper-01 text-gray-50">
                  {period.utilizationPercent.toFixed(0)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-10 rounded-full overflow-hidden">
                <div
                  className={clsx(
                    'h-full rounded-full transition-all',
                    period.utilizationPercent > 100
                      ? 'bg-danger'
                      : period.utilizationPercent > 80
                      ? 'bg-warning-dark'
                      : 'bg-primary'
                  )}
                  style={{
                    width: `${Math.min(period.utilizationPercent, 100)}%`,
                  }}
                />
              </div>
            </div>
            {period.status !== 'CLOSED' && (
              <button
                onClick={() => closePeriod.mutate(period.id)}
                disabled={closePeriod.isPending}
                className="text-label-01 font-medium text-danger active:opacity-70"
              >
                Close Period
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}

// ===== Retainer Card =====
function RetainerCard({
  retainer,
  onRecordHours,
}: {
  retainer: RetainerResponse;
  onRecordHours: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const pauseRetainer = usePauseRetainer();
  const cancelRetainer = useCancelRetainer();

  return (
    <>
    <Card>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-body-01 font-medium text-gray-100 truncate">
              {retainer.name}
            </p>
            <p className="text-helper-01 text-gray-40 truncate">
              {retainer.projectName}
              {retainer.clientName ? ` - ${retainer.clientName}` : ''}
            </p>
          </div>
          <Badge variant={statusVariant(retainer.status)}>
            {retainer.status}
          </Badge>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <div>
            <p className="text-helper-01 text-gray-40">Monthly Amount</p>
            <p className="text-body-01 font-medium text-gray-100">
              {formatCurrency(retainer.monthlyAmount)}
            </p>
          </div>
          <div>
            <p className="text-helper-01 text-gray-40">Monthly Hours</p>
            <p className="text-body-01 font-medium text-gray-100">
              {retainer.monthlyHours} hrs
            </p>
          </div>
        </div>

        {/* Date range & rollover */}
        <div className="flex items-center gap-4 text-helper-01 text-gray-40">
          <span>From {formatDate(retainer.startDate)}</span>
          <span>Rollover: {retainer.rolloverPolicy.replace(/_/g, ' ')}</span>
        </div>

        {/* Action buttons */}
        {retainer.status === 'ACTIVE' && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onRecordHours(retainer.id)}
              className="flex items-center gap-1 px-3 py-1.5 text-label-01 font-medium text-primary active:bg-gray-10 rounded-lg border border-primary/20"
            >
              <ClockIcon className="w-4 h-4" />
              Record Hours
            </button>
            <button
              onClick={() => pauseRetainer.mutate(retainer.id)}
              disabled={pauseRetainer.isPending}
              className="flex items-center gap-1 px-3 py-1.5 text-label-01 font-medium text-gray-50 active:bg-gray-10 rounded-lg border border-gray-20"
            >
              <PauseCircleIcon className="w-4 h-4" />
              Pause
            </button>
            <button
              onClick={() => setShowCancelConfirm(true)}
              disabled={cancelRetainer.isPending}
              className="flex items-center gap-1 px-3 py-1.5 text-label-01 font-medium text-danger active:bg-gray-10 rounded-lg border border-danger/20"
            >
              <XCircleIcon className="w-4 h-4" />
              Cancel
            </button>
          </div>
        )}

        {/* Expand for periods */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-label-01 font-medium text-primary active:opacity-70"
        >
          {expanded ? (
            <>
              <ChevronUpIcon className="w-4 h-4" /> Hide Periods
            </>
          ) : (
            <>
              <ChevronDownIcon className="w-4 h-4" /> Show Periods
            </>
          )}
        </button>

        {expanded && <RetainerPeriodsSection retainerId={retainer.id} />}
      </div>
    </Card>

    {/* Cancel Confirmation Dialog */}
    <Transition show={showCancelConfirm} as={Fragment}>
      <Dialog onClose={() => setShowCancelConfirm(false)} className="relative z-[70]">
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
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-4">
              <Dialog.Title className="text-heading-02 text-gray-100">
                Cancel Retainer
              </Dialog.Title>
              <p className="text-body-01 text-gray-50">
                Are you sure you want to cancel this retainer agreement? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 h-11 border border-gray-20 text-gray-70 font-medium text-body-01 rounded-lg active:bg-gray-10"
                >
                  Keep
                </button>
                <button
                  onClick={() => {
                    cancelRetainer.mutate(retainer.id);
                    setShowCancelConfirm(false);
                  }}
                  disabled={cancelRetainer.isPending}
                  className="flex-1 h-11 bg-danger text-white font-medium text-body-01 rounded-lg disabled:opacity-50"
                >
                  {cancelRetainer.isPending ? 'Cancelling...' : 'Cancel Retainer'}
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
    </>
  );
}

// ===== Main Page =====
export function RetainersPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useRetainers(0, 100);
  const retainers = data?.content ?? [];
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [recordHoursSheet, setRecordHoursSheet] = useState<string | null>(null);
  const [hoursToRecord, setHoursToRecord] = useState('1');
  const recordHours = useRecordRetainerHours();

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: retainerKeys.all });
  }, [queryClient]);

  const { containerRef, PullIndicator } = usePullToRefresh({ onRefresh: handleRefresh });

  const handleRecordHours = async () => {
    if (!recordHoursSheet) return;
    const hrs = parseFloat(hoursToRecord);
    if (isNaN(hrs) || hrs <= 0) return;
    try {
      await recordHours.mutateAsync({ id: recordHoursSheet, hours: hrs });
      setRecordHoursSheet(null);
      setHoursToRecord('1');
    } catch {
      // Error handled by React Query
    }
  };

  return (
    <>
      <PageHeader
        title="Retainers"
        backTo="/app/dashboard"
        actions={
          <button
            onClick={() => setShowCreateSheet(true)}
            className="p-1.5 text-primary active:bg-gray-10 rounded-full"
          >
            <PlusIcon className="w-6 h-6" />
          </button>
        }
      />
      <div className="page-content" ref={containerRef}>
        <PullIndicator />

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : retainers.length === 0 ? (
          <EmptyState
            icon={ClipboardDocumentListIcon}
            title="No retainer agreements"
            description="Create a retainer agreement to track recurring client work."
            action={
              <button
                onClick={() => setShowCreateSheet(true)}
                className="px-4 py-2 bg-primary text-white text-body-01 font-medium rounded-lg"
              >
                Add Retainer
              </button>
            }
          />
        ) : (
          <div className="space-y-3">
            {retainers.map((retainer: RetainerResponse) => (
              <RetainerCard
                key={retainer.id}
                retainer={retainer}
                onRecordHours={(id) => {
                  setRecordHoursSheet(id);
                  setHoursToRecord('1');
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Retainer Bottom Sheet */}
      <CreateRetainerSheet
        open={showCreateSheet}
        onClose={() => setShowCreateSheet(false)}
      />

      {/* Record Hours Bottom Sheet */}
      <Transition show={!!recordHoursSheet} as={Fragment}>
        <Dialog onClose={() => setRecordHoursSheet(null)} className="relative z-[60]">
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
                    Record Hours
                  </Dialog.Title>
                  <button
                    onClick={() => setRecordHoursSheet(null)}
                    className="p-1 text-gray-50 active:bg-gray-10 rounded-full"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
                <div className="px-5 py-4 space-y-4">
                  <div>
                    <label className="block text-label-01 text-gray-70 mb-1">
                      Hours
                    </label>
                    <input
                      type="number"
                      value={hoursToRecord}
                      onChange={(e) => setHoursToRecord(e.target.value)}
                      min="0.25"
                      step="0.25"
                      className="w-full h-11 px-3 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={handleRecordHours}
                    disabled={recordHours.isPending}
                    className="w-full h-12 bg-primary text-white font-medium text-body-01 rounded-lg disabled:opacity-50"
                  >
                    {recordHours.isPending ? 'Recording...' : 'Record Hours'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

// ===== Create Retainer Bottom Sheet =====
function CreateRetainerSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const createRetainer = useCreateRetainer();
  const { data: projectsData } = useProjects(0, 100);
  const projects = projectsData?.content ?? [];

  const [projectId, setProjectId] = useState('');
  const [name, setName] = useState('');
  const [monthlyAmount, setMonthlyAmount] = useState('');
  const [monthlyHours, setMonthlyHours] = useState('');
  const [rolloverPolicy, setRolloverPolicy] = useState<RolloverPolicy>('EXPIRE');
  const [startDate, setStartDate] = useState('');

  const handleSubmit = async () => {
    if (!projectId || !name.trim() || !monthlyAmount || !monthlyHours || !startDate) return;

    const data: RetainerRequest = {
      projectId,
      name: name.trim(),
      monthlyAmount: parseFloat(monthlyAmount),
      monthlyHours: parseFloat(monthlyHours),
      rolloverPolicy,
      startDate,
    };

    try {
      await createRetainer.mutateAsync(data);
      // Reset
      setProjectId('');
      setName('');
      setMonthlyAmount('');
      setMonthlyHours('');
      setRolloverPolicy('EXPIRE');
      setStartDate('');
      onClose();
    } catch {
      // Error handled by React Query
    }
  };

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-[60]">
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
              className="bg-white rounded-t-2xl max-h-[85vh] flex flex-col"
              style={{ paddingBottom: 'calc(var(--safe-area-bottom) + 1rem)' }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-20 flex-shrink-0">
                <Dialog.Title className="text-heading-02 text-gray-100">
                  Create Retainer
                </Dialog.Title>
                <button
                  onClick={onClose}
                  className="p-1 text-gray-50 active:bg-gray-10 rounded-full"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
                {/* Project */}
                <div>
                  <label className="block text-label-01 text-gray-70 mb-1">
                    Project *
                  </label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full h-11 px-3 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select a project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-label-01 text-gray-70 mb-1">
                    Agreement Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Monthly IT Support"
                    className="w-full h-11 px-3 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Monthly Amount & Hours */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-label-01 text-gray-70 mb-1">
                      Monthly Amount (NGN) *
                    </label>
                    <input
                      type="number"
                      value={monthlyAmount}
                      onChange={(e) => setMonthlyAmount(e.target.value)}
                      placeholder="0"
                      min="0"
                      className="w-full h-11 px-3 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-label-01 text-gray-70 mb-1">
                      Monthly Hours *
                    </label>
                    <input
                      type="number"
                      value={monthlyHours}
                      onChange={(e) => setMonthlyHours(e.target.value)}
                      placeholder="0"
                      min="0"
                      className="w-full h-11 px-3 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Rollover Policy */}
                <div>
                  <label className="block text-label-01 text-gray-70 mb-1">
                    Rollover Policy
                  </label>
                  <select
                    value={rolloverPolicy}
                    onChange={(e) => setRolloverPolicy(e.target.value as RolloverPolicy)}
                    className="w-full h-11 px-3 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="EXPIRE">Expire</option>
                    <option value="ROLLOVER">Rollover</option>
                    <option value="REFUND">Refund</option>
                  </select>
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-label-01 text-gray-70 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full h-11 px-3 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div className="px-5 pt-3 flex-shrink-0">
                <button
                  onClick={handleSubmit}
                  disabled={
                    !projectId ||
                    !name.trim() ||
                    !monthlyAmount ||
                    !monthlyHours ||
                    !startDate ||
                    createRetainer.isPending
                  }
                  className="w-full h-12 bg-primary text-white font-medium text-body-01 rounded-lg disabled:opacity-50"
                >
                  {createRetainer.isPending ? 'Creating...' : 'Create Retainer'}
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
