import { Fragment, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { useQueryClient } from '@tanstack/react-query';
import {
  ClockIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import {
  useProject,
  useUpdateProject,
  useDeleteProject,
  useProjectTimeEntries,
  useCreateTimeEntry,
  projectKeys,
  timeEntryKeys,
} from '@/queries';
import { ProjectStatus } from '@/types';
import type { ProjectRequest, TimeEntryRequest } from '@/types';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Badge } from '@/components/ui/Badge';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { formatCurrency } from '@/utils/currency';
import { formatDate, formatDuration, getTodayString } from '@/utils/date';

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: project, isLoading } = useProject(id!);
  const { data: timeEntriesData } = useProjectTimeEntries(id!, 0, 50);
  const timeEntries = timeEntriesData?.content ?? [];

  const deleteProject = useDeleteProject();
  const [showLogTimeSheet, setShowLogTimeSheet] = useState(false);
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleRefresh = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(id!) }),
      queryClient.invalidateQueries({
        queryKey: [...timeEntryKeys.all, 'by-project', id],
      }),
    ]);
  }, [queryClient, id]);

  const { containerRef, PullIndicator } = usePullToRefresh({ onRefresh: handleRefresh });

  const handleDelete = async () => {
    try {
      await deleteProject.mutateAsync(id!);
      navigate('/app/projects', { replace: true });
    } catch {
      // Error handled by React Query
    }
  };

  if (isLoading || !project) {
    return <DashboardSkeleton />;
  }

  const budgetRemaining =
    project.budgetAmount != null && project.billableAmount != null
      ? project.budgetAmount - project.billableAmount
      : null;

  return (
    <>
      <PageHeader
        title={project.name}
        backTo="/app/projects"
        actions={
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowEditSheet(true)}
              className="p-1.5 text-gray-60 active:bg-gray-10 rounded-full"
            >
              <PencilIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 text-danger active:bg-danger-light rounded-full"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        }
      />
      <div className="page-content space-y-4" ref={containerRef}>
        <PullIndicator />

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <p className="text-helper-01 text-gray-40 mb-1">Total Hours</p>
            <p className="text-heading-02 text-gray-100">
              {formatDuration(Math.round(project.totalHours * 60))}
            </p>
          </Card>
          <Card>
            <p className="text-helper-01 text-gray-40 mb-1">Billable Hours</p>
            <p className="text-heading-02 text-gray-100">
              {formatDuration(Math.round(project.billableHours * 60))}
            </p>
          </Card>
          <Card>
            <p className="text-helper-01 text-gray-40 mb-1">Billable Amount</p>
            <p className="text-heading-02 text-gray-100">
              {project.billableAmount != null
                ? formatCurrency(project.billableAmount)
                : '--'}
            </p>
          </Card>
          <Card>
            <p className="text-helper-01 text-gray-40 mb-1">Budget Remaining</p>
            <p
              className={clsx(
                'text-heading-02',
                budgetRemaining != null && budgetRemaining < 0
                  ? 'text-danger'
                  : 'text-gray-100'
              )}
            >
              {budgetRemaining != null
                ? formatCurrency(budgetRemaining)
                : '--'}
            </p>
          </Card>
        </div>

        {/* Project info */}
        <Card>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-label-01 text-gray-50">Status</span>
              <StatusBadge status={project.status} />
            </div>
            {project.clientName && (
              <div className="flex items-center justify-between">
                <span className="text-label-01 text-gray-50">Client</span>
                <span className="text-body-01 text-gray-100">{project.clientName}</span>
              </div>
            )}
            {project.hourlyRate != null && (
              <div className="flex items-center justify-between">
                <span className="text-label-01 text-gray-50">Hourly Rate</span>
                <span className="text-body-01 text-gray-100">
                  {formatCurrency(project.hourlyRate)}/hr
                </span>
              </div>
            )}
            {project.startDate && (
              <div className="flex items-center justify-between">
                <span className="text-label-01 text-gray-50">Start Date</span>
                <span className="text-body-01 text-gray-100">
                  {formatDate(project.startDate)}
                </span>
              </div>
            )}
            {project.endDate && (
              <div className="flex items-center justify-between">
                <span className="text-label-01 text-gray-50">End Date</span>
                <span className="text-body-01 text-gray-100">
                  {formatDate(project.endDate)}
                </span>
              </div>
            )}
            {project.description && (
              <div>
                <span className="text-label-01 text-gray-50 block mb-1">Description</span>
                <p className="text-body-01 text-gray-70">{project.description}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Time entries section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-heading-02 text-gray-100">Time Entries</h2>
            <button
              onClick={() => setShowLogTimeSheet(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-label-01 font-medium rounded-lg"
            >
              <PlusIcon className="w-4 h-4" />
              Log Time
            </button>
          </div>

          {timeEntries.length === 0 ? (
            <EmptyState
              icon={ClockIcon}
              title="No time logged"
              description="Log your first time entry for this project."
            />
          ) : (
            <div className="space-y-2">
              {timeEntries.map((entry) => (
                <Card key={entry.id}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-body-01 text-gray-100 truncate">
                        {entry.description || 'No description'}
                      </p>
                      <p className="text-helper-01 text-gray-40">
                        {formatDate(entry.entryDate)}
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
          )}
        </div>
      </div>

      {/* Log Time Bottom Sheet */}
      <LogTimeSheet
        open={showLogTimeSheet}
        onClose={() => setShowLogTimeSheet(false)}
        projectId={id!}
        defaultRate={project.hourlyRate}
      />

      {/* Edit Project Bottom Sheet */}
      <EditProjectSheet
        open={showEditSheet}
        onClose={() => setShowEditSheet(false)}
        project={project}
      />

      {/* Delete Confirmation */}
      <Transition show={showDeleteConfirm} as={Fragment}>
        <Dialog onClose={() => setShowDeleteConfirm(false)} className="relative z-[60]">
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
              <Dialog.Panel className="bg-white rounded-xl p-5 w-full max-w-sm">
                <Dialog.Title className="text-heading-02 text-gray-100 mb-2">
                  Delete Project
                </Dialog.Title>
                <p className="text-body-01 text-gray-50 mb-5">
                  Are you sure you want to delete &ldquo;{project.name}&rdquo;? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 h-11 bg-gray-10 text-gray-100 font-medium text-body-01 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleteProject.isPending}
                    className="flex-1 h-11 bg-danger text-white font-medium text-body-01 rounded-lg disabled:opacity-50"
                  >
                    {deleteProject.isPending ? 'Deleting...' : 'Delete'}
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

function LogTimeSheet({
  open,
  onClose,
  projectId,
  defaultRate,
}: {
  open: boolean;
  onClose: () => void;
  projectId: string;
  defaultRate?: number;
}) {
  const createTimeEntry = useCreateTimeEntry();
  const [description, setDescription] = useState('');
  const [entryDate, setEntryDate] = useState(getTodayString());
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [billable, setBillable] = useState(true);
  const [rate, setRate] = useState(defaultRate?.toString() ?? '');
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
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
      setDescription('');
      setEntryDate(getTodayString());
      setHours('');
      setMinutes('');
      setBillable(true);
      setRate(defaultRate?.toString() ?? '');
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
                      placeholder={defaultRate?.toString() || '0.00'}
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

function EditProjectSheet({
  open,
  onClose,
  project,
}: {
  open: boolean;
  onClose: () => void;
  project: {
    id: string;
    name: string;
    description?: string;
    hourlyRate?: number;
    budgetAmount?: number;
    color?: string;
    status: ProjectStatus;
  };
}) {
  const updateProject = useUpdateProject();
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? '');
  const [hourlyRate, setHourlyRate] = useState(
    project.hourlyRate?.toString() ?? ''
  );
  const [budgetAmount, setBudgetAmount] = useState(
    project.budgetAmount?.toString() ?? ''
  );
  const [status, setStatus] = useState<ProjectStatus>(project.status);

  const PROJECT_COLORS = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#F97316',
  ];
  const [selectedColor, setSelectedColor] = useState(
    project.color || PROJECT_COLORS[0]
  );

  const handleSubmit = async () => {
    if (!name.trim()) return;

    const data: ProjectRequest = {
      name: name.trim(),
      description: description.trim() || undefined,
      hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
      budgetAmount: budgetAmount ? parseFloat(budgetAmount) : undefined,
      color: selectedColor,
      status,
    };

    try {
      await updateProject.mutateAsync({ id: project.id, data });
      onClose();
    } catch {
      // Error handled by React Query
    }
  };

  const statusOptions: { label: string; value: ProjectStatus }[] = [
    { label: 'Active', value: ProjectStatus.ACTIVE },
    { label: 'Paused', value: ProjectStatus.PAUSED },
    { label: 'Completed', value: ProjectStatus.COMPLETED },
    { label: 'Archived', value: ProjectStatus.ARCHIVED },
  ];

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
                  Edit Project
                </Dialog.Title>
                <button
                  onClick={onClose}
                  className="p-1 text-gray-50 active:bg-gray-10 rounded-full"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-label-01 text-gray-70 mb-1">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-11 px-3 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-label-01 text-gray-70 mb-1">
                    Status
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {statusOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setStatus(opt.value)}
                        className={clsx(
                          'px-3 py-1.5 rounded-full text-label-01 font-medium transition-colors',
                          status === opt.value
                            ? 'bg-primary text-white'
                            : 'bg-white text-gray-60 border border-gray-20'
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-label-01 text-gray-70 mb-1">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  />
                </div>

                {/* Hourly Rate */}
                <div>
                  <label className="block text-label-01 text-gray-70 mb-1">
                    Hourly Rate (NGN)
                  </label>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-11 px-3 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Budget Amount */}
                <div>
                  <label className="block text-label-01 text-gray-70 mb-1">
                    Budget Amount (NGN)
                  </label>
                  <input
                    type="number"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-11 px-3 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Color */}
                <div>
                  <label className="block text-label-01 text-gray-70 mb-2">
                    Color
                  </label>
                  <div className="flex gap-3">
                    {PROJECT_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={clsx(
                          'w-8 h-8 rounded-full transition-all',
                          selectedColor === color
                            ? 'ring-2 ring-offset-2 ring-primary scale-110'
                            : ''
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-5 pt-3 flex-shrink-0">
                <button
                  onClick={handleSubmit}
                  disabled={!name.trim() || updateProject.isPending}
                  className="w-full h-12 bg-primary text-white font-medium text-body-01 rounded-lg disabled:opacity-50"
                >
                  {updateProject.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
