import { Fragment, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { useQueryClient } from '@tanstack/react-query';
import {
  FolderIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useProjects, useCreateProject, projectKeys } from '@/queries';
import { ProjectStatus } from '@/types';
import type { ProjectRequest } from '@/types';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PageHeader } from '@/components/ui/PageHeader';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { formatDuration } from '@/utils/date';

const PROJECT_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316',
];

const statusFilters: { label: string; value: ProjectStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Active', value: ProjectStatus.ACTIVE },
  { label: 'Paused', value: ProjectStatus.PAUSED },
  { label: 'Completed', value: ProjectStatus.COMPLETED },
];

export function ProjectsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<ProjectStatus | 'ALL'>('ALL');
  const [showCreateSheet, setShowCreateSheet] = useState(false);

  const status = activeFilter === 'ALL' ? undefined : activeFilter;
  const { data: projectsData, isLoading } = useProjects(0, 50, status);
  const projects = projectsData?.content ?? [];

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
  }, [queryClient]);

  const { containerRef, PullIndicator } = usePullToRefresh({ onRefresh: handleRefresh });

  return (
    <>
      <PageHeader
        title="Projects"
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

        {/* Status filter pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4 -mx-4 px-4">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              className={clsx(
                'px-3 py-1.5 rounded-full text-label-01 font-medium whitespace-nowrap transition-colors',
                activeFilter === filter.value
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-60 border border-gray-20'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Project list */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            icon={FolderIcon}
            title="No projects yet"
            description={
              activeFilter !== 'ALL'
                ? `No ${activeFilter.toLowerCase()} projects.`
                : 'Create your first project to start tracking time.'
            }
            action={
              <button
                onClick={() => setShowCreateSheet(true)}
                className="px-4 py-2 bg-primary text-white text-body-01 font-medium rounded-lg"
              >
                New Project
              </button>
            }
          />
        ) : (
          <div className="space-y-3">
            {projects.map((project) => {
              const budgetUsed =
                project.budgetAmount && project.billableAmount
                  ? Math.round((project.billableAmount / project.budgetAmount) * 100)
                  : null;

              return (
                <Card
                  key={project.id}
                  onClick={() => navigate(`/app/projects/${project.id}`)}
                >
                  <div className="flex items-start gap-3">
                    {/* Color dot */}
                    <div
                      className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                      style={{ backgroundColor: project.color || '#3B82F6' }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-body-01 font-medium text-gray-100 truncate">
                          {project.name}
                        </p>
                        <StatusBadge status={project.status} />
                      </div>
                      {project.clientName && (
                        <p className="text-label-01 text-gray-50 truncate mb-2">
                          {project.clientName}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-helper-01 text-gray-40">
                        <span>{formatDuration(Math.round(project.totalHours * 60))} total</span>
                        <span>{formatDuration(Math.round(project.billableHours * 60))} billable</span>
                        {budgetUsed !== null && (
                          <span>{budgetUsed}% budget</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Project Bottom Sheet */}
      <CreateProjectSheet
        open={showCreateSheet}
        onClose={() => setShowCreateSheet(false)}
      />
    </>
  );
}

function CreateProjectSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const createProject = useCreateProject();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[0]);

  const handleSubmit = async () => {
    if (!name.trim()) return;

    const data: ProjectRequest = {
      name: name.trim(),
      description: description.trim() || undefined,
      hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
      budgetAmount: budgetAmount ? parseFloat(budgetAmount) : undefined,
      color: selectedColor,
      status: ProjectStatus.ACTIVE,
    };

    try {
      await createProject.mutateAsync(data);
      // Reset form
      setName('');
      setDescription('');
      setHourlyRate('');
      setBudgetAmount('');
      setSelectedColor(PROJECT_COLORS[0]);
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
                  New Project
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
                    placeholder="Enter project name"
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
                    placeholder="Project description"
                    rows={3}
                    className="w-full px-3 py-2 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
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

                {/* Color picker */}
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
                  disabled={!name.trim() || createProject.isPending}
                  className="w-full h-12 bg-primary text-white font-medium text-body-01 rounded-lg disabled:opacity-50"
                >
                  {createProject.isPending ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
