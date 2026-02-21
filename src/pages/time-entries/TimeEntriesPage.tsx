import { Fragment, useState, useCallback, useMemo } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useQueryClient } from '@tanstack/react-query';
import {
  ClockIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useTimeEntries, useCreateTimeEntry, useProjects, timeEntryKeys } from '@/queries';
import type { TimeEntryRequest, TimeEntry } from '@/types';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { formatCurrency } from '@/utils/currency';
import { formatDate, formatDuration, getTodayString } from '@/utils/date';

export function TimeEntriesPage() {
  const queryClient = useQueryClient();
  const { data: entriesData, isLoading } = useTimeEntries(0, 100);
  const entries = entriesData?.content ?? [];
  const [showLogTimeSheet, setShowLogTimeSheet] = useState(false);

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: timeEntryKeys.lists() });
  }, [queryClient]);

  const { containerRef, PullIndicator } = usePullToRefresh({ onRefresh: handleRefresh });

  // Group entries by date
  const groupedEntries = useMemo(() => {
    const groups: Record<string, TimeEntry[]> = {};
    for (const entry of entries) {
      const dateKey = entry.entryDate;
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(entry);
    }
    // Sort dates descending
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [entries]);

  return (
    <>
      <PageHeader
        title="Time Tracking"
        backTo="/app/dashboard"
        actions={
          <button
            onClick={() => setShowLogTimeSheet(true)}
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
        ) : entries.length === 0 ? (
          <EmptyState
            icon={ClockIcon}
            title="No time entries"
            description="Log your first time entry to start tracking work."
            action={
              <button
                onClick={() => setShowLogTimeSheet(true)}
                className="px-4 py-2 bg-primary text-white text-body-01 font-medium rounded-lg"
              >
                Log Time
              </button>
            }
          />
        ) : (
          <div className="space-y-5">
            {groupedEntries.map(([date, dateEntries]) => {
              const totalMinutes = dateEntries.reduce(
                (sum, e) => sum + e.durationMinutes,
                0
              );
              return (
                <div key={date}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-label-01 font-medium text-gray-60">
                      {formatDate(date)}
                    </h3>
                    <span className="text-helper-01 text-gray-40 tabular-nums">
                      {formatDuration(totalMinutes)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {dateEntries.map((entry) => (
                      <Card key={entry.id}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-body-01 font-medium text-gray-100 truncate">
                              {entry.projectName}
                            </p>
                            <p className="text-label-01 text-gray-50 truncate">
                              {entry.description || 'No description'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                            {entry.billable && (
                              <Badge variant="success">Billable</Badge>
                            )}
                            <span className="text-body-01 font-medium text-gray-100 tabular-nums">
                              {formatDuration(entry.durationMinutes)}
                            </span>
                          </div>
                        </div>
                        {entry.amount != null && (
                          <p className="text-helper-01 text-gray-50 mt-1">
                            {formatCurrency(entry.amount)}
                          </p>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Log Time Bottom Sheet */}
      <LogTimeSheetGlobal
        open={showLogTimeSheet}
        onClose={() => setShowLogTimeSheet(false)}
      />
    </>
  );
}

function LogTimeSheetGlobal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const createTimeEntry = useCreateTimeEntry();
  const { data: projectsData } = useProjects(0, 100);
  const projects = projectsData?.content ?? [];

  const [projectId, setProjectId] = useState('');
  const [description, setDescription] = useState('');
  const [entryDate, setEntryDate] = useState(getTodayString());
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [billable, setBillable] = useState(true);
  const [rate, setRate] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    if (!projectId) return;
    const durationMinutes =
      (parseInt(hours || '0', 10) * 60) + parseInt(minutes || '0', 10);
    if (durationMinutes <= 0) return;

    const data: TimeEntryRequest = {
      projectId,
      description: description.trim() || undefined,
      entryDate,
      durationMinutes,
      billable,
      hourlyRate: rate ? parseFloat(rate) : undefined,
      notes: notes.trim() || undefined,
    };

    try {
      await createTimeEntry.mutateAsync(data);
      // Reset form
      setProjectId('');
      setDescription('');
      setEntryDate(getTodayString());
      setHours('');
      setMinutes('');
      setBillable(true);
      setRate('');
      setNotes('');
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
                  Log Time
                </Dialog.Title>
                <button
                  onClick={onClose}
                  className="p-1 text-gray-50 active:bg-gray-10 rounded-full"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
                {/* Project selector */}
                <div>
                  <label className="block text-label-01 text-gray-70 mb-1">
                    Project *
                  </label>
                  <select
                    value={projectId}
                    onChange={(e) => {
                      setProjectId(e.target.value);
                      const proj = projects.find((p) => p.id === e.target.value);
                      if (proj?.hourlyRate) {
                        setRate(proj.hourlyRate.toString());
                      }
                    }}
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

                {/* Description */}
                <div>
                  <label className="block text-label-01 text-gray-70 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What did you work on?"
                    className="w-full h-11 px-3 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-label-01 text-gray-70 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    className="w-full h-11 px-3 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-label-01 text-gray-70 mb-1">
                    Duration *
                  </label>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          type="number"
                          value={hours}
                          onChange={(e) => setHours(e.target.value)}
                          placeholder="0"
                          min="0"
                          className="w-full h-11 px-3 pr-8 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-helper-01 text-gray-40">
                          hr
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          type="number"
                          value={minutes}
                          onChange={(e) => setMinutes(e.target.value)}
                          placeholder="0"
                          min="0"
                          max="59"
                          className="w-full h-11 px-3 pr-10 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-helper-01 text-gray-40">
                          min
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Billable toggle */}
                <div className="flex items-center justify-between">
                  <label className="text-label-01 text-gray-70">Billable</label>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={billable}
                    onClick={() => setBillable(!billable)}
                    className={clsx(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      billable ? 'bg-primary' : 'bg-gray-30'
                    )}
                  >
                    <span
                      className={clsx(
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        billable ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>

                {/* Rate override */}
                {billable && (
                  <div>
                    <label className="block text-label-01 text-gray-70 mb-1">
                      Hourly Rate (NGN)
                    </label>
                    <input
                      type="number"
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                      placeholder="0.00"
                      className="w-full h-11 px-3 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-label-01 text-gray-70 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional notes"
                    rows={2}
                    className="w-full px-3 py-2 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  />
                </div>
              </div>

              <div className="px-5 pt-3 flex-shrink-0">
                <button
                  onClick={handleSubmit}
                  disabled={
                    !projectId ||
                    ((parseInt(hours || '0', 10) * 60) + parseInt(minutes || '0', 10)) <= 0 ||
                    createTimeEntry.isPending
                  }
                  className="w-full h-12 bg-primary text-white font-medium text-body-01 rounded-lg disabled:opacity-50"
                >
                  {createTimeEntry.isPending ? 'Saving...' : 'Log Time'}
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
