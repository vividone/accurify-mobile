import { Fragment, useState, useCallback, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useQueryClient } from '@tanstack/react-query';
import {
  FlagIcon,
  PlusIcon,
  XMarkIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import {
  useMilestones,
  useCreateMilestone,
  useUpdateMilestone,
  useDeleteMilestone,
  useProjects,
  milestoneKeys,
} from '@/queries';
import type { MilestoneRequest, MilestoneResponse, Project } from '@/types';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';

// ===== Status helpers =====
function statusVariant(status: string): 'gray' | 'info' | 'success' | 'danger' {
  const map: Record<string, 'gray' | 'info' | 'success' | 'danger'> = {
    NOT_STARTED: 'gray',
    IN_PROGRESS: 'info',
    COMPLETED: 'success',
    OVERDUE: 'danger',
  };
  return map[status] || 'gray';
}

// ===== Milestone Card =====
function MilestoneCard({
  milestone,
  onEdit,
  onDelete,
}: {
  milestone: MilestoneResponse;
  onEdit: (m: MilestoneResponse) => void;
  onDelete: (m: MilestoneResponse) => void;
}) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showActions, setShowActions] = useState(false);

  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      setShowActions(true);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleTouchMove = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  return (
    <>
      <Card
        onClick={() => onEdit(milestone)}
      >
        <div
          className="space-y-3"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchMove}
          onContextMenu={(e) => {
            e.preventDefault();
            setShowActions(true);
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-body-01 font-medium text-gray-100 truncate">
                {milestone.name}
              </p>
              {milestone.dueDate && (
                <p className="text-helper-01 text-gray-40">
                  Due {formatDate(milestone.dueDate)}
                </p>
              )}
            </div>
            <Badge variant={statusVariant(milestone.status)}>
              {milestone.status}
            </Badge>
          </div>

          {/* Amount */}
          {milestone.amount != null && (
            <div>
              <p className="text-body-01 font-medium text-gray-100">
                {formatCurrency(milestone.amount)}
              </p>
            </div>
          )}

          {/* Percentage progress bar */}
          {milestone.percentage != null && milestone.percentage > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-helper-01 text-gray-40">Progress</span>
                <span className="text-helper-01 text-gray-50">
                  {milestone.percentage}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-10 rounded-full overflow-hidden">
                <div
                  className={clsx(
                    'h-full rounded-full transition-all',
                    milestone.percentage > 100
                      ? 'bg-danger'
                      : milestone.percentage > 80
                      ? 'bg-warning-dark'
                      : 'bg-primary'
                  )}
                  style={{
                    width: `${Math.min(milestone.percentage, 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Description preview */}
          {milestone.description && (
            <p className="text-helper-01 text-gray-40 line-clamp-2">
              {milestone.description}
            </p>
          )}
        </div>
      </Card>

      {/* Long-press action sheet */}
      <Transition show={showActions} as={Fragment}>
        <Dialog onClose={() => setShowActions(false)} className="relative z-[60]">
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
                <div className="px-5 py-4 border-b border-gray-20">
                  <Dialog.Title className="text-heading-02 text-gray-100">
                    {milestone.name}
                  </Dialog.Title>
                </div>
                <div className="px-5 py-3 space-y-1">
                  <button
                    onClick={() => {
                      setShowActions(false);
                      onEdit(milestone);
                    }}
                    className="flex items-center gap-3 w-full px-3 py-3 text-body-01 text-gray-100 active:bg-gray-10 rounded-lg"
                  >
                    <PencilSquareIcon className="w-5 h-5 text-gray-50" />
                    Edit Milestone
                  </button>
                  <button
                    onClick={() => {
                      setShowActions(false);
                      onDelete(milestone);
                    }}
                    className="flex items-center gap-3 w-full px-3 py-3 text-body-01 text-danger active:bg-gray-10 rounded-lg"
                  >
                    <TrashIcon className="w-5 h-5" />
                    Delete Milestone
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

// ===== Create / Edit Bottom Sheet =====
function MilestoneFormSheet({
  open,
  onClose,
  projectId,
  milestone,
}: {
  open: boolean;
  onClose: () => void;
  projectId: string;
  milestone?: MilestoneResponse | null;
}) {
  const createMilestone = useCreateMilestone();
  const updateMilestone = useUpdateMilestone();

  const isEditing = !!milestone;

  const [name, setName] = useState(milestone?.name ?? '');
  const [description, setDescription] = useState(milestone?.description ?? '');
  const [amount, setAmount] = useState(milestone?.amount?.toString() ?? '');
  const [percentage, setPercentage] = useState(
    milestone?.percentage != null ? milestone.percentage.toString() : ''
  );
  const [dueDate, setDueDate] = useState(milestone?.dueDate ?? '');

  // Reset form when milestone changes
  const resetForm = () => {
    setName('');
    setDescription('');
    setAmount('');
    setPercentage('');
    setDueDate('');
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;

    const data: MilestoneRequest = {
      name: name.trim(),
      description: description.trim() || undefined,
      amount: amount ? parseFloat(amount) : undefined,
      percentage: percentage ? parseFloat(percentage) : undefined,
      dueDate: dueDate || undefined,
    };

    try {
      if (isEditing && milestone) {
        await updateMilestone.mutateAsync({
          projectId,
          milestoneId: milestone.id,
          data,
        });
      } else {
        await createMilestone.mutateAsync({ projectId, data });
      }
      resetForm();
      onClose();
    } catch {
      // Error handled by React Query
    }
  };

  const isPending = createMilestone.isPending || updateMilestone.isPending;

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
                  {isEditing ? 'Edit Milestone' : 'Create Milestone'}
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
                    Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Phase 1 Delivery"
                    className="w-full h-11 px-3 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-label-01 text-gray-70 mb-1">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional description of this milestone"
                    rows={3}
                    className="w-full px-3 py-2.5 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-label-01 text-gray-70 mb-1">
                    Amount (NGN) *
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full h-11 px-3 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Percentage */}
                <div>
                  <label className="block text-label-01 text-gray-70 mb-1">
                    Percentage (0-100)
                  </label>
                  <input
                    type="number"
                    value={percentage}
                    onChange={(e) => setPercentage(e.target.value)}
                    placeholder="0"
                    min="0"
                    max="100"
                    className="w-full h-11 px-3 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-label-01 text-gray-70 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full h-11 px-3 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div className="px-5 pt-3 flex-shrink-0">
                <button
                  onClick={handleSubmit}
                  disabled={!name.trim() || isPending}
                  className="w-full h-12 bg-primary text-white font-medium text-body-01 rounded-lg disabled:opacity-50"
                >
                  {isPending
                    ? isEditing
                      ? 'Updating...'
                      : 'Creating...'
                    : isEditing
                    ? 'Update Milestone'
                    : 'Create Milestone'}
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

// ===== Delete Confirmation Dialog =====
function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  milestoneName,
  isPending,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  milestoneName: string;
  isPending: boolean;
}) {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-[70]">
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
                Delete Milestone
              </Dialog.Title>
              <p className="text-body-01 text-gray-50">
                Are you sure you want to delete &quot;{milestoneName}&quot;? This
                action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 h-11 border border-gray-20 text-gray-70 font-medium text-body-01 rounded-lg active:bg-gray-10"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isPending}
                  className="flex-1 h-11 bg-danger text-white font-medium text-body-01 rounded-lg disabled:opacity-50"
                >
                  {isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

// ===== Main Page =====
export function MilestonesPage() {
  const queryClient = useQueryClient();

  // Project selector
  const { data: projectsData } = useProjects(0, 100);
  const projects = projectsData?.content ?? [];
  const [selectedProjectId, setSelectedProjectId] = useState('');

  // Milestones query (only when project is selected)
  const { data: milestones, isLoading } = useMilestones(selectedProjectId);

  // Mutations
  const deleteMilestone = useDeleteMilestone();

  // Sheet state
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<MilestoneResponse | null>(null);
  const [deletingMilestone, setDeletingMilestone] = useState<MilestoneResponse | null>(null);

  // Pull to refresh
  const handleRefresh = useCallback(async () => {
    if (selectedProjectId) {
      await queryClient.invalidateQueries({
        queryKey: milestoneKeys.byProject(selectedProjectId),
      });
    }
  }, [queryClient, selectedProjectId]);

  const { containerRef, PullIndicator } = usePullToRefresh({ onRefresh: handleRefresh });

  const handleDelete = async () => {
    if (!deletingMilestone || !selectedProjectId) return;
    try {
      await deleteMilestone.mutateAsync({
        projectId: selectedProjectId,
        milestoneId: deletingMilestone.id,
      });
      setDeletingMilestone(null);
    } catch {
      // Error handled by React Query
    }
  };

  const handleEdit = (milestone: MilestoneResponse) => {
    setEditingMilestone(milestone);
  };

  const handleCloseEditSheet = () => {
    setEditingMilestone(null);
  };

  return (
    <>
      <PageHeader
        title="Milestones"
        backTo="/app/dashboard"
        actions={
          selectedProjectId ? (
            <button
              onClick={() => setShowCreateSheet(true)}
              className="p-1.5 text-primary active:bg-gray-10 rounded-full"
            >
              <PlusIcon className="w-6 h-6" />
            </button>
          ) : undefined
        }
      />
      <div className="page-content" ref={containerRef}>
        <PullIndicator />

        {/* Project selector */}
        <div className="mb-4">
          <label className="block text-label-01 text-gray-70 mb-1">
            Project
          </label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full h-11 px-3 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Select a project</option>
            {projects.map((p: Project) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Content */}
        {!selectedProjectId ? (
          <EmptyState
            icon={FlagIcon}
            title="Select a project"
            description="Choose a project above to view and manage its milestones."
          />
        ) : isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : !milestones || milestones.length === 0 ? (
          <EmptyState
            icon={FlagIcon}
            title="No milestones"
            description="Add milestones to track project deliverables and progress."
            action={
              <button
                onClick={() => setShowCreateSheet(true)}
                className="px-4 py-2 bg-primary text-white text-body-01 font-medium rounded-lg"
              >
                Add Milestone
              </button>
            }
          />
        ) : (
          <div className="space-y-3">
            {milestones.map((milestone: MilestoneResponse) => (
              <MilestoneCard
                key={milestone.id}
                milestone={milestone}
                onEdit={handleEdit}
                onDelete={(m) => setDeletingMilestone(m)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating action button */}
      {selectedProjectId && (
        <button
          onClick={() => setShowCreateSheet(true)}
          className="fixed right-4 bottom-20 z-20 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center active:bg-primary/90"
          style={{ marginBottom: 'var(--safe-area-bottom)' }}
        >
          <PlusIcon className="w-7 h-7" />
        </button>
      )}

      {/* Create Milestone Bottom Sheet */}
      <MilestoneFormSheet
        open={showCreateSheet}
        onClose={() => setShowCreateSheet(false)}
        projectId={selectedProjectId}
      />

      {/* Edit Milestone Bottom Sheet */}
      <MilestoneFormSheet
        key={editingMilestone?.id ?? 'new'}
        open={!!editingMilestone}
        onClose={handleCloseEditSheet}
        projectId={selectedProjectId}
        milestone={editingMilestone}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={!!deletingMilestone}
        onClose={() => setDeletingMilestone(null)}
        onConfirm={handleDelete}
        milestoneName={deletingMilestone?.name ?? ''}
        isPending={deleteMilestone.isPending}
      />
    </>
  );
}
