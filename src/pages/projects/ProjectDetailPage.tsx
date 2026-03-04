import { Fragment, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { useQueryClient } from '@tanstack/react-query';
import {
  ListBulletIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import {
  useProject,
  useUpdateProject,
  useDeleteProject,
  useProjectBudget,
  useProjectFinancialSummary,
  useCreateBudgetLineItem,
  useUpdateBudgetLineItem,
  useDeleteBudgetLineItem,
  projectKeys,
} from '@/queries';
import { ProjectStatus, BudgetCategory } from '@/types';
import type { ProjectRequest, BudgetLineItem, BudgetLineItemRequest } from '@/types';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';

const PROJECT_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316',
];

const BUDGET_CATEGORIES = Object.values(BudgetCategory);

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: project, isLoading } = useProject(id!);
  const { data: lineItems = [] } = useProjectBudget(id!);
  const { data: summary } = useProjectFinancialSummary(id!);

  const deleteProject = useDeleteProject();
  const deleteBudgetLineItem = useDeleteBudgetLineItem();

  const [showEditSheet, setShowEditSheet] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddLineItem, setShowAddLineItem] = useState(false);
  const [editingLineItem, setEditingLineItem] = useState<BudgetLineItem | null>(null);
  const [deletingLineItem, setDeletingLineItem] = useState<BudgetLineItem | null>(null);

  const handleRefresh = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(id!) }),
      queryClient.invalidateQueries({ queryKey: projectKeys.budget(id!) }),
      queryClient.invalidateQueries({ queryKey: projectKeys.financialSummary(id!) }),
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

  const handleDeleteLineItem = async () => {
    if (!deletingLineItem) return;
    try {
      await deleteBudgetLineItem.mutateAsync({ projectId: id!, id: deletingLineItem.id });
      setDeletingLineItem(null);
    } catch {
      // Error handled by React Query
    }
  };

  if (isLoading || !project) {
    return <DashboardSkeleton />;
  }

  const profit = summary?.profit ?? project.profit ?? 0;

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

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <p className="text-helper-01 text-gray-40 mb-1">Budget</p>
            <p className="text-heading-02 text-gray-100">
              {formatCurrency(summary?.totalBudget ?? project.totalBudget)}
            </p>
          </Card>
          <Card>
            <p className="text-helper-01 text-gray-40 mb-1">Income</p>
            <p className="text-heading-02 text-success-dark">
              {formatCurrency(summary?.totalIncome ?? project.totalIncome)}
            </p>
          </Card>
          <Card>
            <p className="text-helper-01 text-gray-40 mb-1">Expenses</p>
            <p className="text-heading-02 text-gray-100">
              {formatCurrency(summary?.totalExpenses ?? project.totalExpenses)}
            </p>
          </Card>
          <Card>
            <p className="text-helper-01 text-gray-40 mb-1">Profit</p>
            <p className={clsx('text-heading-02', profit >= 0 ? 'text-success-dark' : 'text-danger')}>
              {formatCurrency(profit)}
            </p>
          </Card>
        </div>

        {/* Budget Used Progress */}
        {(summary?.budgetUsedPercent ?? project.budgetUsedPercent) != null && (
          <Card>
            <div className="flex items-center justify-between mb-2">
              <p className="text-label-01 text-gray-50">Budget Used</p>
              <p className="text-label-01 text-gray-70 font-medium">
                {((summary?.budgetUsedPercent ?? project.budgetUsedPercent) as number).toFixed(0)}%
              </p>
            </div>
            <div className="w-full h-2 bg-gray-10 rounded-full overflow-hidden">
              <div
                className={clsx(
                  'h-full rounded-full transition-all',
                  (summary?.budgetUsedPercent ?? project.budgetUsedPercent ?? 0) > 100
                    ? 'bg-danger'
                    : (summary?.budgetUsedPercent ?? project.budgetUsedPercent ?? 0) > 80
                    ? 'bg-warning-dark'
                    : 'bg-primary'
                )}
                style={{
                  width: `${Math.min(summary?.budgetUsedPercent ?? project.budgetUsedPercent ?? 0, 100)}%`,
                }}
              />
            </div>
          </Card>
        )}

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

        {/* Budget Line Items */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-heading-02 text-gray-100">Budget</h2>
            <button
              onClick={() => setShowAddLineItem(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-label-01 font-medium rounded-lg"
            >
              <PlusIcon className="w-4 h-4" />
              Add Item
            </button>
          </div>

          {lineItems.length === 0 ? (
            <EmptyState
              icon={ListBulletIcon}
              title="No budget items"
              description="Add line items to break down your project budget by category."
            />
          ) : (
            <div className="space-y-2">
              {lineItems.map((item) => (
                <Card key={item.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-helper-01 text-gray-40 uppercase text-[10px] tracking-wide">
                        {item.category}
                      </p>
                      <p className="text-body-01 text-gray-100 truncate">{item.description}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                      <p className="text-body-01 font-medium text-gray-100 tabular-nums">
                        {formatCurrency(item.estimatedAmount)}
                      </p>
                      <button
                        onClick={() => setEditingLineItem(item)}
                        className="p-1.5 text-gray-40 active:bg-gray-10 rounded"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingLineItem(item)}
                        className="p-1.5 text-danger active:bg-danger-light rounded"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Budget Line Item Sheet */}
      <BudgetLineItemSheet
        open={showAddLineItem || !!editingLineItem}
        onClose={() => {
          setShowAddLineItem(false);
          setEditingLineItem(null);
        }}
        projectId={id!}
        lineItem={editingLineItem}
      />

      {/* Edit Project Sheet */}
      <EditProjectSheet
        open={showEditSheet}
        onClose={() => setShowEditSheet(false)}
        project={project}
      />

      {/* Delete Line Item Confirmation */}
      <Transition show={!!deletingLineItem} as={Fragment}>
        <Dialog onClose={() => setDeletingLineItem(null)} className="relative z-[60]">
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
                  Remove Budget Item
                </Dialog.Title>
                <p className="text-body-01 text-gray-50 mb-5">
                  Remove &ldquo;{deletingLineItem?.description}&rdquo; from the budget?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeletingLineItem(null)}
                    className="flex-1 h-11 bg-gray-10 text-gray-100 font-medium text-body-01 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteLineItem}
                    disabled={deleteBudgetLineItem.isPending}
                    className="flex-1 h-11 bg-danger text-white font-medium text-body-01 rounded-lg disabled:opacity-50"
                  >
                    {deleteBudgetLineItem.isPending ? 'Removing...' : 'Remove'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Delete Project Confirmation */}
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

function BudgetLineItemSheet({
  open,
  onClose,
  projectId,
  lineItem,
}: {
  open: boolean;
  onClose: () => void;
  projectId: string;
  lineItem?: BudgetLineItem | null;
}) {
  const createLineItem = useCreateBudgetLineItem();
  const updateLineItem = useUpdateBudgetLineItem();

  const isEditing = !!lineItem;
  const [category, setCategory] = useState<BudgetCategory>(
    lineItem?.category ?? BudgetCategory.MATERIALS
  );
  const [description, setDescription] = useState(lineItem?.description ?? '');
  const [estimatedAmount, setEstimatedAmount] = useState(
    lineItem?.estimatedAmount?.toString() ?? ''
  );

  const handleSubmit = async () => {
    if (!description.trim() || !estimatedAmount) return;

    const data: BudgetLineItemRequest = {
      category,
      description: description.trim(),
      estimatedAmount: parseFloat(estimatedAmount),
    };

    try {
      if (isEditing && lineItem) {
        await updateLineItem.mutateAsync({ projectId, id: lineItem.id, data });
      } else {
        await createLineItem.mutateAsync({ projectId, data });
      }
      setCategory(BudgetCategory.MATERIALS);
      setDescription('');
      setEstimatedAmount('');
      onClose();
    } catch {
      // Error handled by React Query
    }
  };

  const isPending = createLineItem.isPending || updateLineItem.isPending;

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
                  {isEditing ? 'Edit Budget Item' : 'Add Budget Item'}
                </Dialog.Title>
                <button
                  onClick={onClose}
                  className="p-1 text-gray-50 active:bg-gray-10 rounded-full"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
                <div>
                  <label className="block text-label-01 text-gray-70 mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as BudgetCategory)}
                    className="w-full h-11 px-3 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {BUDGET_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0) + cat.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-label-01 text-gray-70 mb-1">
                    Description *
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g., Cement and blocks"
                    className="w-full h-11 px-3 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-label-01 text-gray-70 mb-1">
                    Estimated Amount (NGN) *
                  </label>
                  <input
                    type="number"
                    value={estimatedAmount}
                    onChange={(e) => setEstimatedAmount(e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full h-11 px-3 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div className="px-5 pt-3 flex-shrink-0">
                <button
                  onClick={handleSubmit}
                  disabled={!description.trim() || !estimatedAmount || isPending}
                  className="w-full h-12 bg-primary text-white font-medium text-body-01 rounded-lg disabled:opacity-50"
                >
                  {isPending
                    ? isEditing ? 'Saving...' : 'Adding...'
                    : isEditing ? 'Save Changes' : 'Add Item'}
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
    budgetAmount?: number;
    color?: string;
    status: ProjectStatus;
  };
}) {
  const updateProject = useUpdateProject();
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? '');
  const [budgetAmount, setBudgetAmount] = useState(
    project.budgetAmount?.toString() ?? ''
  );
  const [status, setStatus] = useState<ProjectStatus>(project.status);
  const [selectedColor, setSelectedColor] = useState(
    project.color || PROJECT_COLORS[0]
  );

  const handleSubmit = async () => {
    if (!name.trim()) return;

    const data: ProjectRequest = {
      name: name.trim(),
      description: description.trim() || undefined,
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
